variable "db_user" {
  type      = string
  sensitive = false
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_name" {
  type    = string
  default = "biblioteca"
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}