terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "biblioteca" {
  name = "biblioteca-net"
}

resource "docker_image" "postgres" {
  name = "postgres:15-alpine"
}

resource "docker_image" "api" {
  name = "biblioteca-api:local"

  build {
    context    = "${path.module}/../app/backend"
    dockerfile = "Dockerfile"
  }
}

resource "docker_image" "frontend" {
  name = "biblioteca-frontend:local"

  build {
    context    = "${path.module}/../app/frontend"
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "db" {
  name  = "biblioteca-db"
  image = docker_image.postgres.image_id

  restart = "unless-stopped"

  env = [
    "POSTGRES_USER=${var.db_user}",
    "POSTGRES_PASSWORD=${var.db_password}",
    "POSTGRES_DB=${var.db_name}"
  ]

  volumes {
    volume_name    = "biblioteca-pgdata"
    container_path = "/var/lib/postgresql/data"
  }

  networks_advanced {
    name = docker_network.biblioteca.name
  }
}

resource "docker_container" "api" {
  name  = "biblioteca-api"
  image = docker_image.api.image_id

  restart = "unless-stopped"

  env = [
    "PORT=3000",
    "JWT_SECRET=${var.jwt_secret}",
    "DB_HOST=biblioteca-db",
    "DB_PORT=5432",
    "DB_USER=${var.db_user}",
    "DB_PASSWORD=${var.db_password}",
    "DB_NAME=${var.db_name}"
  ]

  ports {
    internal = 3000
    external = 3000
  }

  networks_advanced {
    name = docker_network.biblioteca.name
  }

  depends_on = [
    docker_container.db
  ]
}

resource "docker_container" "frontend" {
  name  = "biblioteca-frontend"
  image = docker_image.frontend.image_id

  restart = "unless-stopped"

  ports {
    internal = 80
    external = 8090
  }

  networks_advanced {
    name = docker_network.biblioteca.name
  }

  depends_on = [
    docker_container.api
  ]
}
