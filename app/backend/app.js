require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao_seguranca';

// Conexão com o PostgreSQL usando variáveis de ambiente
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'biblioteca'
});

async function initDb() {
  try {
    // Tabela de Livros
    await pool.query(`
      CREATE TABLE IF NOT EXISTS livros (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        autor VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        ano INT,
        disponivel BOOLEAN DEFAULT TRUE
      );
    `);

    // Tabela de Usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        matricula VARCHAR(100) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL
      );
    `);

    console.log("Conectado ao PostgreSQL: Tabelas verificadas/criadas!");
  } catch (err) {
    console.error("Erro ao conectar no PostgreSQL, tentando novamente em 5s...", err.message);
    setTimeout(initDb, 5000);
  }
}

initDb();

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: "Acesso negado: Token não fornecido" });
  }

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ mensagem: "Token inválido ou expirado" });
    }
    req.usuario = usuario;
    next();
  });
}

// ROTAS DE AUTENTICAÇÃO
app.post("/usuarios", async (req, res) => {
  const { matricula, senha } = req.body;
  if (!matricula || !senha) return res.status(400).json({ mensagem: "Matrícula e senha são obrigatórias!" });
  if (senha.length < 6) return res.status(400).json({ mensagem: "A senha deve ter no mínimo 6 caracteres!" });

  try {
    const senha_hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (matricula, senha_hash) VALUES ($1, $2) RETURNING id, matricula`,
      [matricula, senha_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Constraint de UNIQUE no PG
      return res.status(400).json({ mensagem: "Matrícula já cadastrada!" });
    }
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
});

app.post("/login", async (req, res) => {
  const { matricula, senha } = req.body;
  if (!matricula || !senha) return res.status(400).json({ mensagem: "Informe matrícula e senha para login!" });

  const result = await pool.query("SELECT * FROM usuarios WHERE matricula = $1", [matricula]);
  const usuario = result.rows[0];

  if (!usuario) return res.status(401).json({ mensagem: "Matrícula ou senha incorretas!" });

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) return res.status(401).json({ mensagem: "Matrícula ou senha incorretas!" });

  const token = jwt.sign({ id: usuario.id, matricula: usuario.matricula }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ mensagem: "Login realizado com sucesso!", token });
});

// ROTAS DE LIVROS
app.get("/livros", async (req, res) => {
  const result = await pool.query("SELECT * FROM livros ORDER BY id ASC");
  res.json(result.rows);
});

app.get("/livros/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM livros WHERE id = $1", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ mensagem: "Livro não encontrado" });
  res.json(result.rows[0]);
});

app.post("/livros", autenticarToken, async (req, res) => {
  const { titulo, autor, categoria, ano, disponivel } = req.body;
  if (!titulo || !autor) return res.status(400).json({ mensagem: "Título e autor são obrigatórios!" });

  const result = await pool.query(
    `INSERT INTO livros (titulo, autor, categoria, ano, disponivel) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [titulo, autor, categoria, ano, disponivel !== undefined ? disponivel : true]
  );
  res.status(201).json(result.rows[0]);
});

app.put("/livros/:id", autenticarToken, async (req, res) => {
  const { titulo, autor, categoria, ano, disponivel } = req.body;
  const result = await pool.query(
    `UPDATE livros SET titulo = $1, autor = $2, categoria = $3, ano = $4, disponivel = $5 WHERE id = $6`,
    [titulo, autor, categoria, ano, disponivel, req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ mensagem: "Livro não encontrado para atualização" });
  res.json({ mensagem: "Livro atualizado com sucesso!" });
});

app.delete("/livros/:id", autenticarToken, async (req, res) => {
  const result = await pool.query("DELETE FROM livros WHERE id = $1", [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ mensagem: "Livro não encontrado para remoção" });
  res.json({ mensagem: "Livro removido com sucesso!" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
