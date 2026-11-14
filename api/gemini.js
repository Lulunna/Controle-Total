// Função serverless (Vercel). Recebe { prompt } e devolve { text }.
// A chave fica na variável de ambiente GEMINI_API_KEY, fora do código do navegador.
// Se o primeiro modelo falhar (indisponível ou sem cota), tenta os próximos.

const MODELS = [process.env.GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash"].filter(Boolean);
const MAX_PROMPT_CHARS = 60000;
const TIMEOUT_MS = 12000;

async function callModel(model, prompt, key) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      }
    );
    if (!r.ok) return { ok: false, status: r.status };
    const data = await r.json();
    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts) || [];
    const text = parts.map((p) => p.text || "").join("").trim();
    return text ? { ok: true, text } : { ok: false, status: 502 };
  } catch (e) {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "missing_api_key" });

  const prompt = req.body && typeof req.body.prompt === "string" ? req.body.prompt : "";
  if (!prompt.trim()) return res.status(400).json({ error: "empty_prompt" });
  if (prompt.length > MAX_PROMPT_CHARS) return res.status(413).json({ error: "prompt_too_large" });

  let last = 0;
  for (const model of MODELS) {
    const r = await callModel(model, prompt, key);
    if (r.ok) return res.status(200).json({ text: r.text });
    last = r.status;
    if (r.status === 400 || r.status === 401 || r.status === 403) break; // chave/pedido inválido: outro modelo não ajuda
  }
  console.error("Gemini falhou, último status", last);
  return res.status(last === 429 ? 429 : 502).json({ error: "upstream_error", status: last });
};
