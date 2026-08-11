variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "s3_bucket" {
  type    = string
  default = "curve-comfort-admin-dashboard"
}

variable "cors_origins" {
  type    = list(string)
  default = ["http://localhost:5173"]
}

provider "aws" {
  region = var.aws_region
}
