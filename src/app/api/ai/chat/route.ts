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

    // Auto-detect provider if user pasted a key under a mismatched tab
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

    // ── 1. Google Gemini (Supports standard AIza keys & new AQ. keys) ──────
    if (activeProvider === "gemini") {
      const candidateModels = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-3.6-flash",
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
            continue; // try next candidate model
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
      const claudeMessages = messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": trimmedKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2048,
          system: systemPrompt,
          messages: claudeMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `Claude Error: ${res.statusText}`);
      }

      const reply = data.content?.[0]?.text || "No response generated.";
      return NextResponse.json({ reply, resolvedProvider: "claude" });
    }

    // ── 3. OpenAI / DeepSeek / OpenRouter ────────────────────
    let targetEndpoint = "https://api.openai.com/v1/chat/completions";
    let targetModel = "gpt-4o-mini";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${trimmedKey}`,
    };

    if (activeProvider === "deepseek") {
      targetEndpoint = "https://api.deepseek.com/chat/completions";
      targetModel = "deepseek-chat";
    } else if (activeProvider === "openrouter") {
      targetEndpoint = "https://openrouter.ai/api/v1/chat/completions";
      targetModel = "anthropic/claude-3.5-sonnet";
      headers["HTTP-Referer"] = "https://vertex-trading.local";
      headers["X-Title"] = "Vertex Trading Journal";
    }

    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const res = await fetch(targetEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: targetModel,
        messages: fullMessages,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const errMsg = typeof data.error === "string" ? data.error : data.error?.message || res.statusText;
      throw new Error(errMsg);
    }

    const reply = data.choices?.[0]?.message?.content || "No response generated.";
    return NextResponse.json({ reply, resolvedProvider: activeProvider });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[AI Chat API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI request. Please check your API Key." },
      { status: 500 }
    );
  }
}
