provider "aws" {
  region = "us-west-2"
}

resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-terraformbucket"

  tags = {
    Name        = "MyBucket"
    Environment = "Dev"
  }
}

