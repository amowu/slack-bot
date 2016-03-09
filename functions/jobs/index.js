import axios from 'axios'
import 'babel-polyfill'
import {get, takeWhile} from 'lodash'

import {getDynamoDBItem, updateDynamoDBItem} from '../../lib/dynamodb.js'
import {postToChannel} from '../../lib/slack.js'

export default async function (event, context) {
  try {
    // 總而言之，這支 jobs Lambda function 會做這幾件事：
    //
    // 1. Fetch jobs list API
    // 2. 從 DynamoDB Jobs 這張表之中，取出最後一次更新的 LastUpdatedSourceID
    // 3. 根據 LastUpdatedSourceID 從 jobs list 之中篩選出新的 new jobs list
    // 4. 更新 DynamoDB 的 LastUpdatedSourceID
    // 5. 發送新的 jobs list 給 Slack

    // 同時執行上述的 1 跟 2
    const [
      jobList,
      lastUpdatedSourceID
    ] = await Promise.all([
      fetchJobList(),
      getLastJobAttributeByKey('frontend', 'LastUpdatedSourceID')
    ])

    // 執行上述的 3
    const newJobList = takeWhile(jobList, job => job['turnstilelink_link/_source'] !== `/rc/clk?jk=${lastUpdatedSourceID}`)
    // 如果沒有新的 jobs，直接結束返回
    if (newJobList.length === 0) return context.succeed('Have not new jobs')

    // 取出最新一筆的 SourceID
    const lastNewJobSourceLink = get(newJobList, ['0', 'turnstilelink_link/_source'])
    const lastNewJobSourceID = get(lastNewJobSourceLink.match(/^\/rc\/clk\?jk=(.*)$/), ['1'])
    // 封裝一份 Slack 支援的接收格式
    const attachments = createSlackJobsAttachments(newJobList)

    // 同時執行上述的 4 跟 5
    await Promise.all([
      updateJobAttributeByKey('frontend', { 'LastUpdatedSourceID': lastNewJobSourceID }),
      postNewJobsToSlackChannel(attachments)
    ])

    context.succeed()
  } catch (error) {
    context.fail(error)
  }
}

function fetchJobList () {
  const endpoint = 'https://api.import.io/store/connector/0a570a00-9a70-4e73-88cf-9fd4f1009130/_query?input=webpage/url:http://tw.indeed.com/jobs?as_and=%26as_phr=%26as_any=%26as_not=%26as_ttl=%25E5%2589%258D%25E7%25AB%25AF%26as_cmp=%26jt=fulltime%26st=%26radius=100%26l=%25E5%258F%25B0%25E5%258C%2597%25E5%25B8%2582%26fromage=last%26limit=10%26sort=date%26psf=advsrch&_apikey=c95c2cfe2b5648958728df00fbf5012babf6afe39896da33b497a0a12c3966bf560eba65d3aa7bd45f0f2ed54ee2b7e07510c6d963f1e7f77397de954f5f1b4c91dade04e30f271c1a1cc68779b1b543'
  return new Promise((resolve, reject) => {
    axios.get(endpoint)
      .then(response => {
        const { data: { results }} = response
        if (results && results.length > 0) {
          resolve(results)
        } else {
          reject('API response have not results')
        }
      })
      .catch(response => reject(response))
  })
}

function getLastJobAttributeByKey (jobId, attribute) {
  return new Promise((resolve, reject) => {
    getDynamoDBItem({
      tableName: 'Jobs',
      key: {
        'JobID': jobId
      },
      attributesToGet: [
        attribute
      ]
    }).then(data => {
      const attr = get(data, ['Item', attribute, 'S'])
      if (attr) {
        resolve(attr)
      } else {
        reject('LastUpdatedSourceID can not find')
      }
    }).catch(error => reject(error))
  })
}

function updateJobAttributeByKey (jobId, attribute) {
  return updateDynamoDBItem({
    tableName: 'Jobs',
    key: {
      'JobID': jobId
    },
    attributeUpdates: attribute
  })
}

function createSlackJobsAttachments (jobs) {
  return jobs.map(job => {
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
}

function postNewJobsToSlackChannel (attachments) {
  return postToChannel(process.env.SLACK_WEBHOOK_URL, {
    'text': `💼有${attachments.length}筆新的工作機會喲！`,
    'attachments': attachments
  })
}
