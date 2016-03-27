import axios from 'axios'
import 'babel-polyfill'
import { filter, find, first, get, matchesProperty } from 'lodash'

export default async function (event, context) {
  if (event.token !== process.env.SLASH_COMMANDS_TOKEN)
    context.fail('Unauthorized Token')
  try {
    const result = await fetchGoogle(event.text)
    const attachment = createGoogleAttachment(result)

    context.succeed(attachment)
  } catch (error) {
    context.succeed({
      'response_type': 'in_channel',
      'attachments': [
        {
          'text': '你把小秘書玩壞了！',
          'color': 'danger'
        }
      ]
    })
  }
}

function fetchGoogle (text) {
  return new Promise((resolve, reject) => {
    const url = 'https://kgsearch.googleapis.com/v1/entities:search?' +
      `query=${text}&` +
      `key=${process.env.GOOGLE_API_KEY}&` +
      'limit=1&' +
      'languages=zh,en,ja'
    return axios.get(url)
      .then(response => {
        const result = get(response, ['data', 'itemListElement', 0, 'result'])
        if (result) {
          resolve(result)
        } else {
          reject('FetchGoogle Error')
        }
      })
      .catch(response => reject(response))
  })
}

function createGoogleAttachment (result) {
  const titleItem = getItemByLanguagePriority(result, 'name', '@language')
  const title = get(titleItem, '@value')

  const detailItem = getItemByLanguagePriority(result, 'detailedDescription', 'inLanguage')
  const titleLink = get(detailItem, 'url')
  const text = get(detailItem, 'articleBody')
  const thumbUrl = get(result, ['image', 'contentUrl'])

  return {
    'response_type': 'in_channel',
    'attachments': [
      {
        'fallback': title,
        'title': title,
        'title_link': titleLink,
        'text': text,
        'thumb_url': thumbUrl
      }
    ]
  }
}

function getItemByLanguagePriority (result, attr, langAttr) {
  const LANGUAGES_PRIORITY = ['zh-TW', 'zh', 'en', 'ja']

  const items = get(result, attr)
  const languages = filter(LANGUAGES_PRIORITY, language =>
    find(items, matchesProperty(langAttr, language))
  )
  const firstLanguage = first(languages)
  const item = find(items, matchesProperty(langAttr, firstLanguage))

  return item
}
