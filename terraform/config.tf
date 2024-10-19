provider "aws" {
  region = "us-west-2"
}

#For storing C3 data
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-terraformbucket"

  tags = {
    Name        = "MyBucket"
    Environment = "Dev"
  }
}


