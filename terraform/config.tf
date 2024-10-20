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
