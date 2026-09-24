import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  provider: "openai" | "gemini" | "deepseek" | "claude" | "openrouter" | "custom";
  apiKey: string;
  model: string;
  baseUrl?: string;
  messages: ChatMessage[];
  tradingContext?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { provider, apiKey, model, baseUrl, messages, tradingContext } = body;

    if (!apiKey && provider !== "custom") {
      return NextResponse.json(
        { error: "API Key is required. กรุณากรอก API Key ก่อนเริ่มใช้งาน" },
        { status: 400 }
      );
    }

    // Build system message with trading context if available
    let systemPrompt = `You are Vertex AI, an elite Trading Coach and Quantitative Journal Analyst.
You help traders identify behavioral patterns, optimize Risk-to-Reward (R:R), control emotional biases (FOMO, Revenge Trading, Early Exit), and improve trade execution.
Be direct, analytical, professional, and practical. Use bullet points and clear numbers when discussing statistics. Answer in Thai or English based on the language of the user's inquiry.`;

    if (tradingContext) {
      systemPrompt += `\n\n[USER TRADING JOURNAL LIVE DATA]:
${JSON.stringify(tradingContext, null, 2)}
Use this actual journal data to answer specific questions about their performance, win rate, emotions, and trade history accurately.`;
    }

    // Prepare message list with system prompt
    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // ── 1. Google Gemini ──────────────────────────────────────
    if (provider === "gemini") {
      const geminiModel = model || "gemini-2.0-flash";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

      // Convert messages for Gemini
      const geminiContents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(data.error?.message || `Gemini Error: ${res.statusText}`);
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      return NextResponse.json({ reply });
    }

    // ── 2. Anthropic Claude ──────────────────────────────────
    if (provider === "claude") {
      const claudeModel = model || "claude-3-5-sonnet-20241022";
      const claudeMessages = messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: claudeModel,
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
      return NextResponse.json({ reply });
    }

    // ── 3. OpenAI / DeepSeek / OpenRouter / Custom (OpenAI Compatible) ─
    let defaultEndpoint = "https://api.openai.com/v1/chat/completions";
    let defaultModel = "gpt-4o-mini";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    if (provider === "deepseek") {
      defaultEndpoint = "https://api.deepseek.com/chat/completions";
      defaultModel = "deepseek-chat";
    } else if (provider === "openrouter") {
      defaultEndpoint = "https://openrouter.ai/api/v1/chat/completions";
      defaultModel = "anthropic/claude-3.5-sonnet";
      headers["HTTP-Referer"] = "https://vertex-trading.local";
      headers["X-Title"] = "Vertex Trading Journal";
    } else if (provider === "custom") {
      const cleanBase = (baseUrl || "http://localhost:11434/v1").replace(/\/$/, "");
      defaultEndpoint = cleanBase.endsWith("/chat/completions")
        ? cleanBase
        : `${cleanBase}/chat/completions`;
      defaultModel = model || "llama3";
      if (!apiKey) {
        delete headers.Authorization; // Local Ollama does not need auth
      }
    }

    const targetEndpoint = provider === "custom" && baseUrl ? defaultEndpoint : (baseUrl || defaultEndpoint);
    const targetModel = model || defaultModel;

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
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[AI Chat API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI request. Please check your API Key and Model." },
      { status: 500 }
    );
  }
}
