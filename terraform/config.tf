provider "aws" {
  region = "us-west-2"
}

#For storing C3 data
resource "aws_s3_bucket" "profilePicsBucket" {
  bucket = "my-profilePicsBucket"

  tags = {
    Name        = "profilePicsBucket"
    Environment = "prod"
  }
}

# Add server-side encryption configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "profilePicsBucket_encryption" {
  bucket = aws_s3_bucket.profilePicsBucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}