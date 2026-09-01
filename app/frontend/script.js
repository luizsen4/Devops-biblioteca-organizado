const API_URL = `http://${window.location.hostname}:3000`;

// Exibir alertas
function mostrarMensagem(texto, tipo) {
  const div = document.getElementById("mensagem");
  if (!div) return;
  div.innerText = texto;
  div.className = `alerta ${tipo}`;
  div.style.display = "block";
  setTimeout(() => div.style.display = "none", 3000);
}

// ------------------------------------
// LÓGICA DE LOGIN E CADASTRO
// ------------------------------------
const formLogin = document.getElementById("form-login");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const matricula = document.getElementById("matricula").value;
    const senha = document.getElementById("senha").value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, senha })
      });

      const data = await res.json();

      if (res.ok) {
        // Salva o Token JWT no armazenamento do navegador (localStorage)
        localStorage.setItem("token", data.token);
        window.location.href = "livros.html";
      } else {
        mostrarMensagem(data.mensagem, "erro");
      }
    } catch (err) {
      mostrarMensagem("Erro ao conectar com o servidor.", "erro");
    }
  });

  document.getElementById("btn-cadastrar").addEventListener("click", async (e) => {
    e.preventDefault();
    const matricula = document.getElementById("matricula").value;
    const senha = document.getElementById("senha").value;

    const res = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula, senha })
    });

    const data = await res.json();
    if (res.ok) {
      mostrarMensagem("Usuário cadastrado com sucesso! Faça login.", "sucesso");
    } else {
      mostrarMensagem(data.mensagem, "erro");
    }
  });
}

// ------------------------------------
// LÓGICA DA PÁGINA DE LIVROS
// ------------------------------------
const tabelaLivros = document.getElementById("tabela-livros");
if (tabelaLivros) {
  const token = localStorage.getItem("token");

  // Redireciona para o login se não houver token
  if (!token) {
    window.location.href = "login.html";
  }

  // Carregar Livros
  async function carregarLivros() {
    const res = await fetch(`${API_URL}/livros`);
    const livros = await res.json();

    tabelaLivros.innerHTML = "";
    livros.forEach(livro => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${livro.id}</td>
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.categoria || '-'}</td>
        <td>${livro.ano || '-'}</td>
        <td>${livro.disponivel ? 'Sim' : 'Não'}</td>
        <td>
          <button onclick="deletarLivro(${livro.id})" style="background-color: #dc3545; padding: 5px 10px;">Remover</button>
        </td>
      `;
      tabelaLivros.appendChild(tr);
    });
  }

  // Cadastrar Livro (Requer Token JWT)
  document.getElementById("form-livro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const categoria = document.getElementById("categoria").value;
    const ano = document.getElementById("ano").value;

    const res = await fetch(`${API_URL}/livros`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ titulo, autor, categoria, ano })
    });

    if (res.ok) {
      mostrarMensagem("Livro cadastrado com sucesso!", "sucesso");
      document.getElementById("form-livro").reset();
      carregarLivros();
    } else {
      const data = await res.json();
      mostrarMensagem(data.mensagem, "erro");
    }
  });

  // Deletar Livro
  window.deletarLivro = async (id) => {
    if (!confirm("Deseja realmente excluir este livro?")) return;

    const res = await fetch(`${API_URL}/livros/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      carregarLivros();
    } else {
      mostrarMensagem("Erro ao deletar livro.", "erro");
    }
  };

  // Logout
  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  carregarLivros();
}
