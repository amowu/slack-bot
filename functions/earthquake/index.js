import axios from 'axios'
import 'babel-polyfill'
import {get} from 'lodash'
import moment from 'moment'
import xmldoc from 'xmldoc'

import {getDynamoDBItem, updateDynamoDBItem} from '../../lib/dynamodb.js'
import {postToChannel} from '../../lib/slack.js'

export default async function (event, context) {
  try {
    const payload = await fetchAndGetEarthquake()
    if (haveNewEarthquake(payload)) {
      const results = await saveAndPostNewEarthquake(payload)

      console.log(results)
      context.succeed()
    } else {
      console.log('Have not new earthquake')
      context.succeed('Have not new earthquake')
    }
  } catch (error) {
    console.error(error)
    context.fail(error)
  }
}

function fetchAndGetEarthquake () {
  return Promise.all([
    fetchEarthquake(),
    getEarthquakeLastUpdatedAtByKey('1', 'LastUpdatedAt')
  ])
}

function fetchEarthquake () {
  const url = 'http://opendata.cwb.gov.tw/govdownload?dataid=E-A0015-001R&authorizationkey=rdec-key-123-45678-011121314'
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(response => {
        const { data } = response
        const document = new xmldoc.XmlDocument(data)
        resolve(document)
      })
      .catch(response => reject(response))
  })
}

function getEarthquakeLastUpdatedAtByKey(earthquakeId, attribute) {
  return new Promise((resolve, reject) => {
    getDynamoDBItem({
      tableName: 'Earthquake',
      key: {
        'EarthquakeID': earthquakeId
      },
      attributesToGet: [
        attribute
      ]
    }).then(data => {
      const attr = get(data, ['Item', attribute, 'S'])
      if (attr) {
        resolve(attr)
      } else {
        reject('LastUpdatedAt can not find')
      }
    }).catch(error => reject(error))
  })
}

function haveNewEarthquake ([earthquakeXmlDocument, lastUpdatedAt]) {
  const sent = earthquakeXmlDocument.descendantWithPath('sent').val

  return moment(sent).isAfter(lastUpdatedAt)
}

function saveAndPostNewEarthquake ([earthquakeXmlDocument, lastUpdatedAt]) {
  const sent = earthquakeXmlDocument.descendantWithPath('sent').val
  const attachments = createSlackEarthquakeAttachments(earthquakeXmlDocument)
  return Promise.all([
    updateEarthquakeAttributeByKey('1', { 'LastUpdatedAt': sent }),
    postNewJobsToSlackChannel(attachments)
  ])
}

function createSlackEarthquakeAttachments (earthquakeXmlDocument) {
  const reportContent = earthquakeXmlDocument.descendantWithPath('dataset.earthquake.reportContent').val
  const web = earthquakeXmlDocument.descendantWithPath('dataset.earthquake.web').val
  const shakemapImageURI = earthquakeXmlDocument.descendantWithPath('dataset.earthquake.shakemapImageURI').val

  return {
    'fallback': '😖有地震！請注意安全。',
    'text': `<${web}|${reportContent}>`,
    'color': 'danger',
    'image_url': shakemapImageURI
  }
}

function updateEarthquakeAttributeByKey (earthquakeId, attribute) {
  return updateDynamoDBItem({
    tableName: 'Earthquake',
    key: {
      'EarthquakeID': earthquakeId
    },
    attributeUpdates: attribute
  })
}

function postNewJobsToSlackChannel (attachments) {
  return postToChannel(process.env.SLACK_WEBHOOK_URL, {
    'attachments': [attachments]
  })
}
