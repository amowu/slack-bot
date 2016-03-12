
resource "aws_dynamodb_table" "jobsDynamoDBTable" {
    name = "Jobs"
    read_capacity = 5
    write_capacity = 5
    hash_key = "JobID"
    attribute {
      name = "JobID"
      type = "S"
    }
}

resource "aws_dynamodb_table" "earthquakeDynamoDBTable" {
    name = "Earthquake"
    read_capacity = 5
    write_capacity = 5
    hash_key = "EarthquakeID"
    attribute {
      name = "EarthquakeID"
      type = "S"
    }
}
