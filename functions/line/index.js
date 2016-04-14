/** @module functions/line */

/** Promise polyfill */
import 'babel-polyfill'
/** Promise based XMLHttpRequests client */
import axios from 'axios'

import { getDialogue } from '../../lib/docomo'
import translate from '../../lib/translate'

export default async function (event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2))
  try {
    // 1. 取得來自 LINE Channel 的 JSON Body.
    const msg = event.result[0]
    // 2. 將使用者輸入的文字翻譯成日本語
    const source = await translate(process.env.GOOGLE_API_KEY, 'ja', msg.content.text)
    // 3. 使用 docomo 提供的聊天 API 和機器人對話
    const dialogue = await getDialogue(process.env.DOCOMO_API_KEY, {
      utt: source.data.translations[0].translatedText,
      mode: 'dialog'
    })
    // 4. 將機器人回答的文字翻譯成使用者的語言
    const target = await translate(process.env.GOOGLE_API_KEY, source.data.translations[0].detectedSourceLanguage, dialogue.utt)
    // 5. 將對話結果發送回 LINE Channel
    await sendMessage({
      to: [msg.content.from.toString()],
      toChannel: 1383378250,
      eventType: '138311608800106203',
      content: {
        'contentType': 1,
        'toType': 1,
        'text': target.data.translations[0].translatedText
      }
    })
    context.succeed()
  } catch (error) {
    context.fail(error.message)
  }
}

/**
 * LINE BOT Sending messages API
 * @see {@link https://developers.line.me/bot-api/api-reference}
 * @param {Object} data - a JSON string in the request body that includes the message you want to send.
 * @param {string[]} data.to - Array of target user. Max count: 150.
 * @param {number} data.toChannel - 1383378250 Fixed value.
 * @param {string} data.eventType - "138311608800106203" Fixed value.
 * @param {Object} data.content - Object that contains the message.
 * @param {number} data.content.contentType - 1. Fixed value.
 * @param {number} data.content.toType - Type of recipient set in the to property. (1 = user)
 * @param {string} data.content.text - String you want to send. Messages can contain up to 1024 characters.
 * @return {Promise.<LINEMessage, Error>}
 * @typedef {Object} LINEMessage
 * @property {*[]} failed
 * @property {string} messageId
 * @property {number} timestamp
 * @property {number} version
 */
function sendMessage (data) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'POST',
      baseURL: 'https://trialbot-api.line.me/v1/',
      url: '/events',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Line-ChannelID': process.env.LINE_CHANNEL_ID,
        'X-Line-ChannelSecret': process.env.LINE_CHANNEL_SECRET,
        'X-Line-Trusted-User-With-ACL': process.env.LINE_MID
      },
      data
    }).then(response => {
      console.log('sendMessage:', JSON.stringify(response, null, 2))
      resolve(response.data)
    }).catch(response => {
      console.error('sendMessage ERROR:', JSON.stringify(response, null, 2))
      reject(new Error(response.data.statusMessage))
    })
  })
}
