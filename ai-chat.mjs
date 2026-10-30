export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = Netlify.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server setup pending: GEMINI_API_KEY is not configured in Netlify." }), {
      status: 503, headers: { "Content-Type": "application/json" }
    });
  }

  let body;
  try { body = await request.json(); }
  catch {
    return new Response(JSON.stringify({ error: "Invalid JSON request." }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 4000) {
    return new Response(JSON.stringify({ error: "Message must be between 1 and 4000 characters." }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
  const contents = [];
  for (const item of history) {
    if (!item || !["user", "model"].includes(item.role) || typeof item.text !== "string") continue;
    contents.push({ role: item.role, parts: [{ text: item.text.slice(0, 4000) }] });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are AIOW AI, a helpful, accurate and friendly assistant. Reply in the language the user uses, including Hindi or Hinglish. Be clear and concise. If unsure, say so." }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
      })
    });
    const result = await upstream.json();
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: result?.error?.message || "Gemini API request failed." }), {
        status: upstream.status, headers: { "Content-Type": "application/json" }
      });
    }
    const reply = result?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!reply) throw new Error("The AI returned an empty response.");
    return new Response(JSON.stringify({ reply }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Unexpected AI service error." }), {
      status: 502, headers: { "Content-Type": "application/json" }
    });
  }
};