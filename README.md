# 📚 Sistema de Biblioteca — Projeto DevOps

Sistema de Biblioteca desenvolvido como um MVP para demonstrar a aplicação de práticas DevOps, utilizando **Docker, Terraform, PostgreSQL, Node.js, Express, Nginx e JWT**.

O projeto foi estruturado para que a infraestrutura possa ser criada de maneira **automatizada, reproduzível e padronizada**, utilizando um único projeto Terraform para provisionar toda a aplicação.

---

# 📌 1. Objetivo do projeto

O objetivo deste projeto é disponibilizar uma versão funcional de um Sistema de Biblioteca utilizando práticas de DevOps e Gerência de Configuração.

A aplicação possui:

- Front-end web;
- Back-end/API;
- Banco de dados PostgreSQL;
- Autenticação de usuários;
- Cadastro e login;
- Cadastro de livros;
- Listagem de livros;
- Exclusão de livros;
- Comunicação entre Front-end e Back-end;
- Infraestrutura Docker;
- Provisionamento automatizado utilizando Terraform.

A infraestrutura pode ser criada a partir de uma máquina limpa utilizando os comandos principais do Terraform.

---

# 🏗️ 2. Arquitetura do projeto

A aplicação é composta por três componentes principais:

```text
                    ┌──────────────────────┐
                    │      FRONT-END       │
                    │      Nginx:80        │
                    │                      │
                    │  biblioteca-frontend │
                    └──────────┬───────────┘
                               │
                               │ HTTP
                               │ porta 3000
                               ▼
                    ┌──────────────────────┐
                    │      BACK-END        │
                    │   Node.js + Express  │
                    │                      │
                    │    biblioteca-api    │
                    └──────────┬───────────┘
                               │
                               │ PostgreSQL
                               │ porta 5432
                               ▼
                    ┌──────────────────────┐
                    │      DATABASE        │
                    │     PostgreSQL 15    │
                    │                      │
                    │     biblioteca-db    │
                    └──────────────────────┘

O Terraform é responsável por criar e configurar os componentes Docker:

                         TERRAFORM
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       Network             Images           Containers
          │                  │                  │
          │          ┌───────┼───────┐    ┌────┼────┐
          │          │       │       │    │    │    │
          ▼          ▼       ▼       ▼    ▼    ▼    ▼
 biblioteca-   PostgreSQL  API   Frontend DB  API Front
 terraform-net


 📁 3. Estrutura do projeto
A estrutura principal do projeto é:

Devops-biblioteca-organizado-apresentacao/
│
├── app/
│   │
│   ├── backend/
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── .env
│   │
│   └── frontend/
│       ├── index.html
│       ├── login.html
│       ├── livros.html
│       ├── script.js
│       ├── style.css
│       ├── config.js
│       ├── Dockerfile
│       ├── docker-compose.yml
│       └── nginx.conf
│
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   └── terraform.tfvars
│
└── README.md



🐳 4. Docker
O projeto utiliza Docker para executar os componentes da aplicação em containers.
Os containers criados pelo Terraform são:

| Container | Função | Porta |
|---|---|---|
| `biblioteca-frontend` | Interface web | `8080` |
| `biblioteca-api` | API Node.js/Express | `3000` |
| `biblioteca-db` | PostgreSQL | `5432` |

O PostgreSQL não precisa necessariamente ter a porta publicada para o computador host, pois a API acessa o banco diretamente pela rede Docker.


🌐 5. Rede Docker
O Terraform cria uma rede Docker própria para a aplicação:

biblioteca-terraform-net

Os três containers são conectados a essa rede.
Isso permite que os containers se comuniquem utilizando os nomes dos serviços.
Por exemplo, o Back-end acessa o banco através de:

DB_HOST=biblioteca-db

Portanto:

biblioteca-api
       │
       │ biblioteca-db:5432
       ▼
biblioteca-db



🖥️ 6. Front-end
O Front-end é uma aplicação web estática servida pelo Nginx.
O Dockerfile utiliza:

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html

EXPOSE 80


O Nginx disponibiliza os arquivos HTML, CSS e JavaScript.
O container possui:

biblioteca-frontend

e a porta:

8080 → 80

Portanto, após a infraestrutura estar funcionando, o sistema pode ser acessado através de:

http://localhost:8080


🔌 7. Comunicação Front-end → Back-end
O Front-end utiliza o arquivo:

const API_URL = "http://localhost:3000";

Assim, o navegador acessa a API através da porta 3000.
Exemplo:

Front-end
http://localhost:8080
        │
        │ HTTP
        ▼
Back-end
http://localhost:3000



A aplicação possui endpoints como:

POST   /usuarios
POST   /login

GET    /livros
GET    /livros/:id
POST   /livros
PUT    /livros/:id
DELETE /livros/:id


🔐 8. Autenticação
O sistema utiliza autenticação baseada em JWT (JSON Web Token).
O fluxo de autenticação é:

1. Usuário informa matrícula e senha
             │
             ▼
2. Front-end envia POST /login
             │
             ▼
3. API verifica usuário no PostgreSQL
             │
             ▼
4. Senha é validada com bcrypt
             │
             ▼
5. API gera JWT
             │
             ▼
6. Front-end armazena o token
             │
             ▼
7. Token é enviado nas requisições protegidas

As operações de criação, alteração e exclusão de livros exigem autenticação.



🗄️ 9. Banco de dados
O banco utilizado é:

PostgreSQL 15 Alpine

O banco é criado pelo container:

biblioteca-db


O Back-end cria automaticamente as tabelas necessárias quando inicia.
Tabela usuarios
Possui, entre outros, os campos:
id
matricula
senha_hash
As senhas não são armazenadas diretamente.
A aplicação utiliza bcryptjs para gerar o hash da senha.
Tabela livros
Possui:
id
titulo
autor
categoria
ano
disponivel


💾 10. Persistência do banco
O PostgreSQL utiliza um volume Docker:
biblioteca-pgdata
Esse volume é montado em:
/var/lib/postgresql/data
Isso permite que os dados do banco permaneçam mesmo que o container seja recriado.
Atenção: remover o volume manualmente apaga os dados armazenados no PostgreSQL.

Para remover o volume manualmente:
docker volume rm biblioteca-pgdata
Isso deve ser feito somente quando for necessário iniciar o banco novamente do zero.


⚙️ 11. Terraform
O projeto possui um único diretório Terraform.
terraform/
├── main.tf
├── variables.tf
└── terraform.tfvars
O Terraform é responsável por:
- Criar a rede Docker;
- Criar a imagem do PostgreSQL;
- Construir a imagem da API;
- Construir a imagem do Front-end;
- Criar o container PostgreSQL;
- Criar o container da API;
- Criar o container do Front-end;
- Configurar as variáveis de ambiente;
- Configurar portas;
- Configurar volumes;
- Configurar a comunicação entre os containers.



🧩 12. Arquivo main.tf
O arquivo principal contém os recursos Docker.
Entre eles:
docker_network.biblioteca
docker_image.postgres
docker_image.api
docker_image.frontend

docker_container.db
docker_container.api
docker_container.frontend
A rede utilizada pelo Terraform é:
biblioteca-terraform-net
As imagens criadas pelo Terraform são:
biblioteca-api:terraform
biblioteca-frontend:terraform




🔑 13. Variáveis do Terraform
O arquivo:
terraform/variables.tf
define as variáveis utilizadas pela infraestrutura.
Atualmente são:
db_user
db_password
db_name
jwt_secret
O arquivo:
terraform/terraform.tfvars
contém os valores utilizados durante o provisionamento.
Exemplo:
db_user     = "postgres"
db_password = "algumaSenhaForte"
jwt_secret  = "outraChaveForte"
Importante: o arquivo terraform.tfvars contém informações sensíveis. Em um projeto real, ele não deve ser enviado para um repositório público.

🚀 14. Pré-requisitos
Antes de executar o projeto, é necessário possuir:
- Windows;
- Docker Desktop;
- Docker funcionando;
- Terraform instalado;
- Git, caso o projeto seja obtido através de um repositório Git.
Verifique o Docker:
docker --version
Verifique o Terraform:
terraform --version
Verifique se o Docker está funcionando:
docker ps



▶️ 15. Executando o projeto pela primeira vez
Entre no diretório do Terraform:
cd C:\Devops-biblioteca-organizado-apresentacao\terraform
Inicialize o Terraform:
terraform init
Esse comando instala e inicializa o provider Docker utilizado pelo projeto.
Depois, recomendamos verificar o plano:
terraform plan
Se estiver tudo correto, aplique a infraestrutura:
terraform apply
O Terraform solicitará confirmação.
Digite:
yes
O Terraform deverá criar os recursos necessários.
Resultado esperado:
Apply complete! Resources: 7 added, 0 changed, 0 destroyed.



🔎 16. Verificando os containers
Depois do terraform apply:
docker ps
O resultado esperado é semelhante a:
biblioteca-frontend
biblioteca-api
biblioteca-db
Também é possível verificar a rede:
docker network ls
Deve existir:
biblioteca-terraform-net



🧪 17. Testando a API
Teste o endpoint de livros:
Invoke-WebRequest -UseBasicParsing http://localhost:3000/livros
Ou:
curl.exe http://localhost:3000/livros
Se o banco estiver vazio, o resultado esperado é:
[]
Um retorno:
StatusCode : 200
indica que a API está respondendo corretamente.



🌐 18. Acessando o sistema
Abra no navegador:
http://localhost:8080
A página de login deverá aparecer.
O fluxo esperado é:
http://localhost:8080
        │
        ▼
      Login
        │
        ▼
   Autenticação
        │
        ▼
   livros.html
        │
        ▼
 Cadastro/listagem de livros



📚 19. Testando o cadastro
Primeiramente, cadastre um usuário através da tela de login.
Informe:
Matrícula
Senha
A senha precisa possuir pelo menos 6 caracteres.
Depois de cadastrar o usuário, faça login.
Após o login, o sistema deverá direcionar para:
livros.html
Nessa página será possível cadastrar livros.
Exemplo:
Título: Dom Casmurro
Autor: Machado de Assis
Categoria: Literatura
Ano: 1899
Depois de cadastrar, o livro deverá aparecer na tabela.




🔄 20. Verificando o estado do Terraform
Depois de executar o projeto, utilize:
terraform plan
Quando a infraestrutura estiver sincronizada, o resultado esperado é:
No changes. Your infrastructure matches the configuration.
Isso significa que o Terraform comparou:
Configuração Terraform
        +
Infraestrutura Docker atual
        ↓
      iguais




🗑️ 21. Destruindo a infraestrutura
Para testar a capacidade de reconstrução da infraestrutura, utilize:
terraform destroy
Confirme:
yes
O Terraform deverá remover os recursos que ele criou.
Depois:
docker ps
Os containers criados pelo Terraform não deverão mais estar em execução.




🔁 22. Recriando a infraestrutura
Uma das partes importantes da proposta do projeto é demonstrar que a infraestrutura pode ser criada novamente de maneira automatizada.
Depois do:
terraform destroy
execute novamente:
terraform init
Depois:
terraform apply
Confirme:
yes
O Terraform deverá recriar:
biblioteca-terraform-net
biblioteca-db
biblioteca-api
biblioteca-frontend
Depois valide:
docker ps
E teste novamente:
Invoke-WebRequest -UseBasicParsing http://localhost:3000/livros
Por fim, acesse:
http://localhost:8080



🔄 23. Fluxo principal de demonstração
Para apresentar o projeto, o fluxo recomendado é:
1. Clonar/obter o projeto
          │
          ▼
2. Entrar em /terraform
          │
          ▼
3. terraform init
          │
          ▼
4. terraform plan
          │
          ▼
5. terraform apply
          │
          ▼
6. Testar aplicação
          │
          ▼
7. terraform destroy
          │
          ▼
8. terraform init
          │
          ▼
9. terraform apply
          │
          ▼
10. Testar novamente
Esse fluxo demonstra que a infraestrutura é:
- Automatizada;
- Reproduzível;
- Versionável;
- Gerenciada como código.


🛠️ 24. Comandos úteis para diagnóstico
Ver containers
docker ps
Ver todos os containers:
docker ps -a
Ver logs da API
docker logs biblioteca-api --tail 100
Ver logs do PostgreSQL
docker logs biblioteca-db --tail 100
Ver logs do Front-end
docker logs biblioteca-frontend
Ver redes Docker
docker network ls
Ver informações da rede Terraform
docker network inspect biblioteca-terraform-net
Ver volumes
docker volume ls


⚠️ 25. Problemas comuns
Docker não está funcionando
Se aparecer:
failed to connect to the docker API
verifique se o Docker Desktop está aberto e funcionando.
Teste:
docker ps
Erro de rede já existente
Caso apareça:
network with name biblioteca-net already exists
ou outro nome de rede já existente, verifique:
docker network ls
A versão atual do projeto utiliza:
biblioteca-terraform-net
Evite misturar a infraestrutura criada pelo Terraform com redes criadas pelos docker-compose anteriores.
API não consegue acessar o PostgreSQL
Verifique:
docker logs biblioteca-api --tail 100
Se aparecer:
password authentication failed for user "postgres"
pode existir um banco antigo utilizando uma senha diferente da configurada no Terraform.
Nesse caso, se os dados não forem necessários, o volume pode ser removido:
docker volume rm biblioteca-pgdata
Depois recrie a infraestrutura:
terraform destroy
terraform apply
API retorna erro 500
Primeiro verifique:
docker logs biblioteca-api --tail 100
Depois verifique o PostgreSQL:
docker logs biblioteca-db --tail 100
Também confirme:
docker ps
A API e o banco devem estar em execução.


🖥️ 26. Execução em outra máquina
A arquitetura foi planejada para permitir futuramente que o Front-end e o Back-end sejam executados em máquinas físicas diferentes.
No ambiente atual de desenvolvimento, os três containers são executados na mesma máquina:
Máquina atual
│
├── Front-end
├── Back-end
└── PostgreSQL
Em um cenário com duas máquinas:
MÁQUINA 1
┌─────────────────────┐
│      FRONT-END      │
│      Nginx :80      │
└──────────┬──────────┘
           │
           │ Rede
           ▼
MÁQUINA 2
┌─────────────────────┐
│       BACK-END      │
│    Node.js :3000    │
│                     │
│    PostgreSQL       │
└─────────────────────┘
Nesse cenário, o config.js do Front-end deverá apontar para o endereço IP da máquina que estiver executando a API.
Exemplo:
const API_URL = "http://IP_DA_MAQUINA_API:3000";
Também será necessário configurar corretamente firewall, conectividade de rede e exposição da porta 3000.
Esse cenário ainda precisa ser validado em uma segunda máquina física.


🔐 27. Segurança
Este projeto é um MVP acadêmico/demonstrativo.
Para um ambiente de produção seriam necessárias melhorias como:
- HTTPS;
- Gerenciamento adequado de secrets;
- Não armazenar senhas diretamente no terraform.tfvars;
- Controle de acesso mais granular;
- Validação mais completa dos dados;
- Restrição de CORS;
- Firewall;
- Backup do PostgreSQL;
- Monitoramento;
- Logs centralizados;
- Política de rotação de secrets.


📋 28. Tecnologias utilizadas
Tecnologia	Utilização
HTML	Estrutura do Front-end
CSS	Estilização
JavaScript	Lógica do Front-end
Nginx	Servidor do Front-end
Node.js	Runtime do Back-end
Express	API REST
PostgreSQL	Banco de dados
bcryptjs	Hash de senhas
JWT	Autenticação
Docker	Containerização
Docker Compose	Execução local dos componentes durante desenvolvimento
Terraform	Provisionamento da infraestrutura
Git	Versionamento


🎯 29. Resultado esperado
Ao final da execução, o ambiente deverá possuir:
Docker
│
├── biblioteca-terraform-net
│
├── biblioteca-db
│      └── PostgreSQL 15
│
├── biblioteca-api
│      └── Node.js + Express
│
└── biblioteca-frontend
       └── Nginx
E a aplicação deverá estar disponível em:
Front-end:
http://localhost:8080

Back-end:
http://localhost:3000
A API deverá responder:
GET http://localhost:3000/livros
com:
[]
quando ainda não existirem livros cadastrados.



✅ 30. Checklist para apresentação
Antes da apresentação, verificar:
- Docker Desktop funcionando;
- Terraform instalado;
- Projeto organizado;
- terraform.tfvars configurado;
- terraform init executado;
- terraform plan sem erros;
- terraform apply funcionando;
- 3 containers em execução;
- API respondendo na porta 3000;
- Front-end abrindo na porta 8080;
- Login funcionando;
- Cadastro de usuário funcionando;
- Cadastro de livro funcionando;
- Listagem de livros funcionando;
- Exclusão de livro funcionando;
- terraform plan retornando No changes;
- terraform destroy funcionando;
- terraform init funcionando novamente;
- terraform apply reconstruindo a infraestrutura;
- Aplicação funcionando novamente após a reconstrução.


👨‍💻 Conclusão
Este projeto demonstra uma abordagem de infraestrutura como código utilizando Terraform para provisionar uma aplicação composta por Front-end, Back-end e banco de dados.
A principal característica do projeto é permitir que a infraestrutura seja criada de forma padronizada utilizando comandos simples:
terraform init
terraform plan
terraform apply
e posteriormente destruída e reconstruída:
terraform destroy
terraform init
terraform apply
Dessa forma, o ambiente deixa de depender de configurações manuais dos containers e passa a ser definido através de código versionável e reproduzível.

**Uma observação importante:** eu mantive no README a arquitetura que vocês realmente chegaram a validar: **um único Terraform**, com os três containers na rede `biblioteca-terraform-net`, Front-end em `8080`, API em `3000` e PostgreSQL interno em `5432`. Também deixei explícito que o cenário de **duas máquinas físicas ainda não foi testado**, em vez de afirmar que ele já está validado.