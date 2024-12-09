provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "public_bucket" { 
  bucket = "public-bucket-example" 
  acl = "private" 
  versioning {
    enabled = true
    mfa_delete = true
  }
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
  logging {
    target_bucket = "log-bucket"
    target_prefix = "log/"
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" { 
  bucket = aws_s3_bucket.public_bucket.id
  policy = jsonencode({ 
    Version = "2012-10-17" 
    Statement = [ { 
      Action = "s3:GetObject" 
      Effect = "Allow" 
      Resource = "${aws_s3_bucket.public_bucket.arn}/profilePictures/*" 
      Principal = { 
        AWS = "arn:aws:iam::234657654:user/francescomazzini" 
      } 
    } ] 
  }) 
}