import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  provider: "openai" | "gemini" | "deepseek" | "claude" | "openrouter";
  apiKey: string;
  messages: ChatMessage[];
  tradingContext?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { provider, apiKey, messages, tradingContext } = body;

    const trimmedKey = (apiKey || "").trim();
    if (!trimmedKey) {
      return NextResponse.json(
        { error: "API Key is required. กรุณากรอก API Key ก่อนเริ่มใช้งาน" },
        { status: 400 }
      );
    }

    // Auto-detect provider if key format unambiguously matches a provider
    let activeProvider = provider;
    if (trimmedKey.startsWith("AQ.") || trimmedKey.startsWith("AIza")) {
      activeProvider = "gemini";
    } else if (trimmedKey.startsWith("sk-ant-")) {
      activeProvider = "claude";
    } else if (trimmedKey.startsWith("sk-or-")) {
      activeProvider = "openrouter";
    }

    // System prompt with trading context
    let systemPrompt = `You are Vertex AI, an elite Trading Coach and Quantitative Journal Analyst.
You help traders identify behavioral patterns, optimize Risk-to-Reward (R:R), control emotional biases (FOMO, Revenge Trading, Early Exit), and improve trade execution.
Be direct, analytical, professional, and practical. Use bullet points and clear numbers when discussing statistics. Answer in Thai or English based on the language of the user's inquiry.`;

    if (tradingContext) {
      systemPrompt += `\n\n[USER TRADING JOURNAL LIVE DATA]:
${JSON.stringify(tradingContext, null, 2)}
Use this actual journal data to answer specific questions about their performance, win rate, emotions, and trade history accurately.`;
    }

    // ── 1. Google Gemini ──────────────────────────────────────
    if (activeProvider === "gemini") {
      const candidateModels = [
        "gemini-3.6-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp",
      ];

      const geminiContents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      let lastError = "";

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(trimmedKey)}`;

          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": trimmedKey,
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              contents: geminiContents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              },
            }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            lastError = data.error?.message || `Gemini Error (${model}): ${res.statusText}`;
            console.warn(`[Gemini candidate '${model}' failed]:`, lastError);
            continue;
          }

          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply, resolvedProvider: "gemini", model });
          }
        } catch (err: unknown) {
          lastError = (err as Error).message;
        }
      }

      throw new Error(lastError || "Google Gemini API connection failed. Please check your API Key.");
    }

    // ── 2. Anthropic Claude ──────────────────────────────────
    if (activeProvider === "claude") {
      const candidateModels = [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet-latest",
        "claude-3-5-haiku-20241022",
        "claude-3-haiku-20240307",
      ];

      const claudeMessages = messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      let lastError = "";

      for (const model of candidateModels) {
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": trimmedKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model,
              max_tokens: 2048,
              system: systemPrompt,
              messages: claudeMessages,
            }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            lastError = data.error?.message || `Claude Error (${model}): ${res.statusText}`;
            console.warn(`[Claude candidate '${model}' failed]:`, lastError);
            // If invalid api key, don't keep looping
            if (res.status === 401) {
              throw new Error(lastError);
            }
            continue;
          }

          const reply = data.content?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply, resolvedProvider: "claude", model });
          }
        } catch (err: unknown) {
          lastError = (err as Error).message;
          if (lastError.includes("401") || lastError.includes("invalid x-api-key")) {
            throw err;
          }
        }
      }

      throw new Error(lastError || "Anthropic Claude API connection failed. Please check your API Key.");
    }

    // ── 3. OpenAI, DeepSeek, OpenRouter ──────────────────────
    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    interface ProviderConfig {
      endpoint: string;
      models: string[];
      extraHeaders?: Record<string, string>;
    }

    const configs: Record<string, ProviderConfig> = {
      openai: {
        endpoint: "https://api.openai.com/v1/chat/completions",
        models: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
      },
      deepseek: {
        endpoint: "https://api.deepseek.com/chat/completions",
        models: ["deepseek-chat", "deepseek-reasoner"],
      },
      openrouter: {
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        models: [
          "anthropic/claude-3.5-sonnet",
          "deepseek/deepseek-r1",
          "meta-llama/llama-3.3-70b-instruct",
          "google/gemini-2.0-flash-001",
        ],
        extraHeaders: {
          "HTTP-Referer": "https://vertex-trading.local",
          "X-Title": "Vertex Trading Journal",
        },
      },
    };

    let pConfig = configs[activeProvider] || configs.openai;
    let lastError = "";

    // Try target provider models
    for (const model of pConfig.models) {
      try {
        const res = await fetch(pConfig.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${trimmedKey}`,
            ...(pConfig.extraHeaders || {}),
          },
          body: JSON.stringify({
            model,
            messages: fullMessages,
            temperature: 0.7,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          const errMsg = typeof data.error === "string" ? data.error : data.error?.message || res.statusText;
          lastError = errMsg;

          // If on OpenAI and gets invalid key, check if user pasted a DeepSeek key
          if (activeProvider === "openai" && (res.status === 401 || errMsg.includes("Incorrect API key"))) {
            // Attempt DeepSeek silently before giving up
            const dsRes = await fetch(configs.deepseek.endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${trimmedKey}`,
              },
              body: JSON.stringify({
                model: "deepseek-chat",
                messages: fullMessages,
                temperature: 0.7,
              }),
            });
            const dsData = await dsRes.json();
            if (dsRes.ok && !dsData.error && dsData.choices?.[0]?.message?.content) {
              return NextResponse.json({
                reply: dsData.choices[0].message.content,
                resolvedProvider: "deepseek",
                model: "deepseek-chat",
              });
            }
          }

          if (res.status === 401) {
            throw new Error(errMsg);
          }
          continue;
        }

        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return NextResponse.json({ reply, resolvedProvider: activeProvider, model });
        }
      } catch (err: unknown) {
        lastError = (err as Error).message;
        if (lastError.includes("401") || lastError.includes("Incorrect API key")) {
          throw err;
        }
      }
    }

    throw new Error(lastError || `Failed to connect to ${activeProvider.toUpperCase()}. Please check your API Key.`);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[AI Chat API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI request. Please check your API Key." },
      { status: 500 }
    );
  }
}
