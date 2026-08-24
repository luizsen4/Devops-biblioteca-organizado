# Sistema da Biblioteca — Backend

API Node.js + Express + PostgreSQL do projeto da Biblioteca.

## Execução recomendada

A aplicação deve ser executada pelos containers Docker.

Na raiz do projeto:

```bash
docker compose up -d --build
```

Não é necessário executar `npm install` no computador.

O Docker executa `npm ci --omit=dev` durante o build da imagem e depois inicia a aplicação com Node.js.

API:

```text
http://localhost:3000
```

Frontend:

```text
http://localhost:8080/login.html
```

## Dependências

As dependências são definidas em:

```text
package.json
```

e fixadas em:

```text
package-lock.json
```

A instalação ocorre dentro da imagem Docker.
