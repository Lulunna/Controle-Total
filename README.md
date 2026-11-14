# Controle Total

App de controle financeiro pessoal para o dia a dia: anota gastos e entradas, controla contas fixas, mostra quanto sobra no mês e responde perguntas por chat com IA. Funciona no celular e no computador.

**Demo:** [controle-total-five.vercel.app](https://controle-total-five.vercel.app/)


## O que faz

- **Anotar rápido:** valor, categoria, forma de pagamento (Pix, dinheiro, débito, crédito) e data, num teclado numérico próprio.
- **Entradas:** salário fixo (repete todo mês) e ganhos extras.
- **Quanto tenho disponível:** o que sobrou do mês passado entra automaticamente no mês seguinte.
- **Contas fixas:** repetem todo mês. Dá para editar ou remover só de um mês, ou de um mês em diante, sem mexer nos meses anteriores. Aceita pagamento parcial e avisa no mês seguinte quanto ficou faltando.
- **Meta de guardar:** aparece de forma discreta, sem alertas.
- **Relatório mensal e semanal** com gráficos e **download em PDF**.
- **Chat com IA:** pergunta quanto gastou, quanto tem disponível ou se há contas pendentes.

## Como a IA é usada

O chat recebe só um resumo do mês (totais, categorias e contas) e responde usando somente esses dados. Se a IA não responder, o app calcula a resposta sozinho, então o chat nunca fica mudo.

A chave do Gemini fica na Vercel, numa função serverless (`api/gemini.js`). O navegador nunca vê a chave. Se o primeiro modelo falhar, a função tenta outros.

## Como é feito

- Um único `index.html` com HTML, CSS e JavaScript puro, sem framework e sem build.
- Dados salvos no `localStorage` do aparelho. Não há login nem banco de dados.
- PDF gerado no navegador com pdf-lib.
- PWA: dá para instalar na tela inicial do celular.

## Como publicar

1. Suba esta pasta num repositório do GitHub.
2. Importe o repositório na Vercel.
3. Em Environment Variables, crie `GEMINI_API_KEY` com uma chave do [Google AI Studio](https://aistudio.google.com).
4. Deploy.

Sem a chave, tudo funciona, exceto as respostas da IA no chat.

## Limitações

- Os dados ficam só no aparelho: celular e computador não sincronizam entre si.
- Limpar os dados do navegador apaga os lançamentos.
