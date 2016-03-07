import axios from 'axios'
import AWS from 'aws-sdk'
import 'babel-polyfill'
import {get, reduce, takeWhile} from 'lodash'

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

export default async function (event, context) {
  try {
    // Get job item from DynamoDB Jobs table
    const jobItem = await getDynamoDBJobItem()
    // Get attribute 'LastUpdatedSourceID' from job item
    // TODO: const { item: { LastUpdatedSourceID: lastUpdatedSourceID }} = jobItem
    const { Item: { LastUpdatedSourceID: { S: lastUpdatedSourceID }}} = jobItem
    if ( ! lastUpdatedSourceID) context.fail('lastUpdatedSourceID can not find')

    // Fetch last 10 record jobs list from API
    // TODO: const jobs = await fetchJobs({...})
    const results = await fetchJobs()
    // Get jobs list from API response
    // TODO: move to fetchJobs()
    const { data: { results: jobs }} = results
    if ( ! jobs || jobs.length === 0) context.succeed('API response have not results')

    // Find newest jobs list by 'LastUpdatedSourceID'
    // TODO: findNewJobs(arr, attr)
    const newJobs = takeWhile(jobs, (job) => job['turnstilelink_link/_source'] !== `/rc/clk?jk=${lastUpdatedSourceID}`)
    if (newJobs.length === 0) context.succeed('API response have not new jobs')

    // Get last 1 source ID for update
    const lastSourceLink = get(newJobs, ['0', 'turnstilelink_link/_source'])
    const lastSourceID = get(lastSourceLink.match(/^\/rc\/clk\?jk=(.*)$/), ['1'])
    // update 'lastSourceID' into 'LastUpdatedSourceID'
    await updateDynamoDBJobItem({
      attributeUpdates: {
        'LastUpdatedSourceID': lastSourceID
      }
    })

    // Formatted new jobs list with Slack attachment structure
    const attachments = newJobs.map((job) => {
      const {
        'location_value': location,
        'company_value': company,
        'resultlink_value': source,
        'turnstilelink_link': url,
        'turnstilelink_link/_title': title,
        'summary_description': summary
      } = job

      return {
        'title': title,
        'title_link': url,
        'text': `${company} - ${location}\n${summary}\n${source}`
      }
    })
    // Send newest jobs list to Slack message via HTTP POST method
    // await postNewJobsToSlack(attachments)

  context.succeed()
  } catch (err) {
    context.fail(err)
  }
}

function getDynamoDBItem (params) {
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

function getDynamoDBJobItem () {
  return getDynamoDBItem({
    tableName: 'Jobs',
    key: {
      'JobID': 'frontend'
    },
    attributesToGet: [
      'LastUpdatedSourceID'
    ]
  })
}

function fetchJobs () {
  const URL = 'https://api.import.io/store/connector/0a570a00-9a70-4e73-88cf-9fd4f1009130/_query?input=webpage/url:http://tw.indeed.com/jobs?as_and=%26as_phr=%26as_any=%26as_not=%26as_ttl=%25E5%2589%258D%25E7%25AB%25AF%26as_cmp=%26jt=fulltime%26st=%26radius=100%26l=%25E5%258F%25B0%25E5%258C%2597%25E5%25B8%2582%26fromage=last%26limit=10%26sort=date%26psf=advsrch&_apikey=c95c2cfe2b5648958728df00fbf5012babf6afe39896da33b497a0a12c3966bf560eba65d3aa7bd45f0f2ed54ee2b7e07510c6d963f1e7f77397de954f5f1b4c91dade04e30f271c1a1cc68779b1b543'
  return new Promise((resolve, reject) => {
    axios.get(URL)
      .then(response => resolve(response))
      .catch(response => reject(response))
  })
}

function updateDynamoDBItem (params) {
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

function updateDynamoDBJobItem (params) {
  const {
    attributeUpdates
  } = params

  return updateDynamoDBItem({
    tableName: 'Jobs',
    key: {
      'JobID': 'frontend'
    },
    attributeUpdates: attributeUpdates
  })
}

function postNewJobsToSlack (attachments) {
  return new Promise((resolve, reject) => {
    axios.post('https://hooks.slack.com/services/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', {
      'text': `💼有${attachments.length}筆新的工作機會喲！`,
      'attachments': attachments
    }).then(response => resolve(response))
      .catch(response => reject(response))
  })
}
