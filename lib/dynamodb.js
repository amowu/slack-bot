import AWS from 'aws-sdk'
import {reduce} from 'lodash'

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

export function getDynamoDBItem (params) {
  const {
    tableName,
    key: keys,
    attributesToGet
  } = params

  return new Promise((resolve, reject) => {
    dynamodb.getItem({
      'TableName': tableName,
      'Key': reduce(keys, (result, value, key) => {
        result[key] = {
          'S': value
        }
        return result
      }, {}),
      'AttributesToGet': attributesToGet
    }, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

export function updateDynamoDBItem (params) {
  const {
    tableName,
    key: keys,
    attributeUpdates: attributes
  } = params

  return new Promise((resolve, reject) => {
    dynamodb.updateItem({
      'TableName': tableName,
      'Key': reduce(keys, (result, value, key) => {
        result[key] = {
          'S': value
        }
        return result
      }, {}),
      'AttributeUpdates': reduce(attributes, (result, value, key) => {
        result[key] = {
          'Action': 'PUT',
          'Value': {
            'S': value
          }
        }
        return result
      }, {})
    }, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}
