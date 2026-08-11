resource "aws_iam_user" "uploads" {
  name = "curve-comfort-s3-uploads"
}

data "aws_iam_policy_document" "uploads" {
  statement {
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.uploads.arn}/*"]
  }
}

resource "aws_iam_user_policy" "uploads" {
  name   = "curve-comfort-s3-uploads"
  user   = aws_iam_user.uploads.name
  policy = data.aws_iam_policy_document.uploads.json
}

resource "aws_iam_access_key" "uploads" {
  user = aws_iam_user.uploads.name
}
