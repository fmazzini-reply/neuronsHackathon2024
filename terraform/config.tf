provider "aws" {
region = "us-east-1"
}

resource "aws_s3_bucket" "public_bucket" { 
  bucket = "public-bucket-example" 
  acl = "private" 
}

resource "aws_s3_bucket_policy" "bucket_policy" { 
  bucket = aws_s3_bucket.public_bucket.id
  policy = jsonencode({ 
    Version = "2012-10-17" 
    Statement = [ { 
      Action = "s3:GetObject" 
      Effect = "Allow" 
      Resource = "${aws_s3_bucket.public_bucket.arn}/specific-path/*" 
      Principal = { 
        AWS = "arn:aws:iam::account-id:user/specific-user" 
      } 
    } ] 
  }) 
}