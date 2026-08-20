// Importa o framework Express.
const express = require("express");

// Cria a aplicação.
const app = express();

// Define a porta do servidor.
// Caso a variável de ambiente PORT não exista, utiliza a porta 3000.
const PORT = process.env.PORT || 3000;

/**
 * Rota padrão da aplicação.
 *
 * Ao acessar:
 * http://localhost:3000/
 *
 * O servidor retorna a data e a hora atuais.
 */
app.get("/", (request, response) => {
  const agora = new Date();

  // Formata a data e a hora utilizando o padrão brasileiro.
  const dataHoraFormatada = agora.toLocaleString("pt-BR", {
    timeZone: "America/Recife",
    dateStyle: "full",
    timeStyle: "medium",
  });

  response.status(200).json({
    mensagem: "Data e hora atuais",
    dataHora: dataHoraFormatada,
    iso: agora.toISOString(),
    fusoHorario: "America/Recife",
  });
});

// Inicia o servidor.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
