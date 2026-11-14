/*
 * Camada de compatibilidade do Controle Total.
 *
 * O app pede IA por window.claude.use("sample"). Aqui isso chama /api/gemini,
 * que guarda a chave do Gemini no servidor. Os demais recursos (db, user,
 * downloads) devolvem null: os dados ficam no localStorage e o PDF baixa direto.
 */
(function () {
  "use strict";
  async function sample(input) {
    var prompt = typeof input === "string" ? input : input.map(function (m) { return m.content; }).join("\n\n");
    var res;
    try {
      res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt })
      });
    } catch (e) { throw { code: "upstream_error", message: "Sem conexão." }; }
    if (!res.ok) throw { code: res.status === 429 ? "rate_limited" : "upstream_error", message: "Status " + res.status };
    var data = await res.json();
    if (!data || !data.text) throw { code: "empty_completion", message: "Resposta vazia." };
    return { text: data.text, truncated: false };
  }
  window.claude = { use: async function (name) { return name === "sample" ? sample : null; } };

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
