# Sistema da Biblioteca — DevOps Local

Projeto didático de **Gerência de Configuração e Infraestrutura como Código**, adaptado para execução **100% local em containers Docker**.

## O que foi alterado

Esta versão mantém a estrutura e a aplicação do projeto original, mas remove o fluxo de deploy em máquina remota.

### Removido

- SSH;
- chaves privadas;
- usuário SSH;
- IP de servidor remoto;
- deploy em máquina externa;
- necessidade de copiar arquivos para um servidor remoto;
- `npm install` executado manualmente no computador para subir a aplicação.

### Mantido

- Docker;
- Docker Compose;
- Terraform;
- Ansible;
- Node.js/Express;
- PostgreSQL;
- frontend em Nginx;
- JWT;
- aplicação da Biblioteca;
- `package-lock.json`;
- infraestrutura como código.

## Arquitetura local

```text
                    SUA MÁQUINA
                         |
                    Docker Engine
                         |
             +-----------+-----------+
             |      biblioteca-net   |
             |                       |
       +-----v-----+           +-----v-----+
       | PostgreSQL|           |    API    |
       |    :5432  |           |   :3000  |
       +-----------+           +-----+-----+
                                      |
                                +-----v------+
                                |  Frontend  |
                                |    :8080   |
                                +------------+
```

A comunicação entre os containers utiliza a rede Docker `biblioteca-net`.

O navegador, por estar fora do Docker, acessa:

- Frontend: `http://localhost:8080`
- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## 1. Pré-requisitos

- Docker Desktop com WSL2 habilitado;
- WSL2/Ubuntu;
- Git;
- Terraform;
- Ansible;
- collection `community.docker`.

Verifique:

```bash
docker --version
docker compose version
terraform --version
ansible --version
```

Instale a collection do Ansible, se necessário:

```bash
ansible-galaxy collection install community.docker
```

## 2. Subir a aplicação diretamente com Docker Compose

Na raiz do projeto:

```bash
docker compose up -d --build
```

O `--build` constrói as imagens.

### Importante sobre npm

Você **não precisa executar**:

```bash
npm install
```

nem:

```bash
npm ci
```

na sua máquina para executar a aplicação.

As dependências do backend são instaladas durante a **construção da imagem Docker**:

```dockerfile
COPY package*.json ./
RUN npm ci --omit=dev
```

Depois que a imagem está pronta, o container inicia diretamente com:

```dockerfile
CMD ["node", "app.js"]
```

Portanto:

```text
Host
  |
  +-- docker compose up
          |
          +-- build da imagem
          |     |
          |     +-- npm ci
          |
          +-- container API
                |
                +-- node app.js
```

## 3. Acessar o sistema

Frontend:

```text
http://localhost:8080/login.html
```

API:

```text
http://localhost:3000/
```

PostgreSQL:

```text
localhost:5432
```

## 4. Fluxo com Terraform

Para demonstrar IaC, também é possível provisionar a mesma infraestrutura pelo Terraform.

Entre no diretório:

```bash
cd terraform
```

Inicialize:

```bash
terraform init
```

Veja o plano:

```bash
terraform plan
```

Aplique:

```bash
terraform apply
```

Confirme com `yes`.

O Terraform criará localmente:

- rede Docker `biblioteca-net`;
- container `biblioteca-db`;
- container `biblioteca-api`;
- container `biblioteca-frontend`;
- volume PostgreSQL;
- imagens locais da API e frontend.

Nenhum recurso SSH é utilizado.

## 5. Validação com Ansible

Volte para a raiz:

```bash
cd ..
```

Teste o Docker:

```bash
ansible-playbook -i ansible/inventory.ini ansible/preparar-container.yml
```

Depois valide a aplicação:

```bash
ansible-playbook -i ansible/inventory.ini ansible/instalar-api.yml
```

O Ansible utiliza:

```ini
[local]
localhost ansible_connection=local
```

Portanto, ele não tenta entrar em uma máquina remota.

## 6. Verificar os containers

```bash
docker ps
```

Você deverá encontrar:

```text
biblioteca-db
biblioteca-api
biblioteca-frontend
```

Logs da API:

```bash
docker logs biblioteca-api
```

Logs do frontend:

```bash
docker logs biblioteca-frontend
```

Logs do banco:

```bash
docker logs biblioteca-db
```

## 7. Parar a aplicação

Se estiver usando Compose:

```bash
docker compose down
```

Para remover também o volume do PostgreSQL:

```bash
docker compose down -v
```

> `-v` apaga os dados persistidos do banco.

## 8. Destruir a infraestrutura criada pelo Terraform

Se utilizou Terraform:

```bash
cd terraform
terraform destroy
```

Confirme com `yes`.

## Terraform x Ansible

Nesta versão, a divisão ficou simples:

### Terraform

Responsável por definir **o que deve existir**:

```text
Terraform
   |
   +-- Docker Network
   +-- PostgreSQL
   +-- API
   +-- Frontend
   +-- Volume
```

### Ansible

Responsável por **validar/configurar o ambiente local**:

```text
Ansible
   |
   +-- verifica Docker
   +-- verifica containers
   +-- testa API
   +-- testa frontend
```

### Docker

Responsável por executar a aplicação:

```text
Docker
   |
   +-- PostgreSQL
   +-- Node.js / Express
   +-- Nginx
```

## Resultado final

```text
Código-fonte
     |
     v
Terraform
     |
     v
Docker
     |
     +--> PostgreSQL
     |
     +--> API Node.js
     |
     +--> Frontend Nginx
     |
     v
Ansible
     |
     v
Validação automática
     |
     +--> API OK
     +--> Frontend OK
     +--> Containers OK
```

**Não existe SSH neste fluxo.**

**Não existe servidor remoto.**

**Não existe deploy externo.**

**Não é necessário executar `npm install` no host.**
