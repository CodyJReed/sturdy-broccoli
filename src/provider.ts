type Provider = "openai" | "gemini" | "groq";

type HelloOutput = {
  ok: true;
  provider: Provider;
  model: string;
  message: string;
};

type GeminiGenerateContent = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

async function helloGemini(): Promise<HelloOutput> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Google api key not present.");

  const model = "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Say a short hello",
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);

  const json = (await res.json()) as GeminiGenerateContent;
  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text ?? "Hello as default";

  return {
    ok: true,
    provider: "gemini",
    model,
    message: String(text).trim(),
  };
}

type OpenAiChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

async function helloGroq(): Promise<HelloOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing Groq api key.");

  const model = "llama-3.1-8b-instant";
  const url = `https://api.groq.com/openai/v1/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: "Say a short hello to Cody J Reed.",
        },
      ],
      temperature: 0,
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);

  const json = (await res.json()) as OpenAiChatCompletion;
  const content = json?.choices?.[0]?.message?.content ?? "Hello as default";

  return {
    ok: true,
    provider: "groq",
    model,
    message: String(content).trim(),
  };
}

async function helloOpenAi(): Promise<HelloOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAi api key.");

  const model = "gpt-4.1-mini";
  const url = `https://api.openai.com/v1/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: "Say a short hello.",
        },
      ],
      temperature: 0,
    }),
  });

  if (!res.ok) throw new Error(`OpenAi ${res.status}: ${await res.text()}`);

  const json = (await res.json()) as OpenAiChatCompletion;
  const content = json?.choices?.[0]?.message?.content ?? "Hello as default";

  return {
    ok: true,
    provider: "openai",
    model,
    message: String(content).trim(),
  };
}

export async function selectHello(): Promise<HelloOutput> {
  const forced = (process.env.PROVIDER || "").toLowerCase();

  if (forced === "gemini") return helloGemini();
  if (forced === "groq") return helloGroq();
  if (forced === "openai") return helloOpenAi();

  if (forced)
    throw new Error(`Unsupported PROVIDER=${forced}. use openai|groq|gemini`);

  if (process.env.GOOGLE_API_KEY) {
    try {
      return await helloGemini();
    } catch (err) {}
  }

  if (process.env.GROQ_API_KEY) {
    try {
      return await helloGroq();
    } catch (err) {}
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      return await helloOpenAi();
    } catch (err) {}
  }

  throw new Error("No provider configured.");
}
