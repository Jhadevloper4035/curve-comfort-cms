output "backend_s3_env" {
  description = "Copy this into backend/.env.development or backend/.env.production."
  sensitive   = true
  value       = <<-EOT
    AWS_ACCESS_KEY_ID=${aws_iam_access_key.uploads.id}
    AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.uploads.secret}
    AWS_REGION=${var.aws_region}
    S3_BUCKET=${aws_s3_bucket.uploads.bucket}
    S3_PUBLIC_BASE_URL=https://${aws_s3_bucket.uploads.bucket}.s3.${var.aws_region}.amazonaws.com
  EOT
}
