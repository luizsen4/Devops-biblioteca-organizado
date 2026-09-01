# Segurança e DevSecOps

## Medidas aplicadas

1. **Hash de senha (bcrypt)** — senhas nunca são armazenadas em texto puro; `bcrypt.hash()` no cadastro, `bcrypt.compare()` no login.
2. **Autenticação via JWT** — rotas de escrita (`POST`/`PUT`/`DELETE /livros`) exigem token válido (`autenticarToken`). Apenas leitura é pública.
3. **Queries parametrizadas** — todo acesso ao PostgreSQL usa `$1, $2...` em vez de concatenar string, prevenindo SQL Injection.
4. **Validação de entrada** — campos obrigatórios (matrícula, senha, título, autor) e senha mínima de 6 caracteres, validados antes de gravar no banco.
5. **Segredos fora do código-fonte** — `JWT_SECRET` e credenciais do banco ficam em `terraform.tfvars`/`.env`, nunca hardcoded, ambos no `.gitignore`.
6. **Menor privilégio de rede** — PostgreSQL não expõe porta ao host, só acessível via rede interna `biblioteca-net` pelo nome do container. Só frontend e API ficam expostos.
7. **`.dockerignore`** — impede que `Dockerfile`, `.git` e `*.md` sejam copiados pra dentro da imagem do frontend.

## Confidencialidade
Hash irreversível de senha (1), segredos fora do versionamento (5), banco sem exposição externa (6).

## Integridade
Queries parametrizadas (3), validação de campos obrigatórios (4), constraint `UNIQUE` na matrícula (nível de banco), e escrita só permitida com autenticação (2).

## Disponibilidade
`restart: unless-stopped` em todos os containers, volume dedicado (`biblioteca-pgdata`) preservando dados entre recriações, rede Docker isolada.

## Limitação conhecida
`JWT_SECRET` tem um valor padrão hardcoded como fallback (`|| 'chave_padrao_seguranca'`), usado só se a variável de ambiente não for definida — o que nunca ocorre em prática, já que `terraform.tfvars`/`.env` sempre a definem. O ideal seria a aplicação falhar ao iniciar sem essa variável, em vez de usar um valor previsível.

## Fora do escopo atual
CORS liberado para qualquer origem (`cors()` sem restrição) — aceitável para demonstração local; em produção seria restringido a domínios específicos.