/** @module functions/line */

/** Promise polyfill */
import 'babel-polyfill'
/** Promise based XMLHttpRequests client */
import axios from 'axios'

export default async function (event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2))
  try {
    // 1. 取得來自 LINE Channel 的 JSON Body.
    const msg = event.result[0]
    // 2. 將使用者輸入的文字翻譯成日本語
    const source = await translate('ja', msg.content.text)
    // 3. 使用 docomo 提供的聊天 API 和機器人對話
    const dialogue = await getDialogue({
      utt: source.data.translations[0].translatedText,
      mode: 'dialog'
    })
    // 4. 將機器人回答的文字翻譯成使用者的語言
    const target = await translate(source.data.translations[0].detectedSourceLanguage, dialogue.utt)
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
 * Google Translate API
 * @see {@link https://cloud.google.com/translate/docs}
 * @param {string} target - 目標的語系，例：'en'。
 * @param {string} q - The text to be translated.
 * @return {Promise.<TranslateResults, Error>}
 * @typedef {Object[]} TranslateResults
 * @property {string} translatedText - 系統回答的文字，例：你好。
 * @property {string} detectedSourceLanguage - 偵測的來源語系。例：'zh-TW'。
 */
function translate (target, q) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      baseURL: 'https://www.googleapis.com/',
      url: '/language/translate/v2',
      params: {
        'key': process.env.GOOGLE_API_KEY,
        'target': target,
        'q': q
      }
    }).then(response => {
      console.log('translate:', JSON.stringify(response, null, 2))
      resolve(response.data)
    }).catch(response => {
      console.error('translate ERROR:', JSON.stringify(response, null, 2))
      reject(new Error(response.data.statusMessage))
    })
  })
}

/**
 * docomo 雑談対話 API
 * @see {@link https://dev.smt.docomo.ne.jp}
 * @param {Object} data - docomo 雑談対話 API Request Body
 * @param {string} data.utt - 對話文字（255字以下），例：你好。
 * @param {string} data.context - 延續上一筆對話的 context ID。
 * @param {string} data.nickname - 使用者暱稱（10字以下），例：咲良。
 * @param {string} data.nickname_y - 暱稱的片假名讀音，例：さくら。
 * @param {string} data.sex - 使用者的性別（男 or 女）。
 * @param {string} data.bloodtype - 使用者的血型（A、B、AB、O）。
 * @param {string} data.birthdateY - 使用者的生日（年），例：1998。
 * @param {string} data.birthdateM - 使用者的生日（月），例：3。
 * @param {string} data.birthdateD - 使用者的生日（日），例：19。
 * @param {string} data.age - 使用者的年齡，例：16。
 * @param {string} data.constellations - 使用者的星座，例：魚座。
 * @param {string} data.place - 使用者所在的地區，例：鹿児島。
 * @param {string} data.mode - 對話模式，預設 dialog，延續對話 srtr。
 * @param {strung} data.t - 對話角色（20：關西腔角色、30：嬰兒角色）。
 * @return {Promise.<Dialogue, Error>}
 * @typedef {Object} Dialogue
 * @property {string} utt - 系統回答的文字，例：你好。
 * @property {string} yomi - 對話的片假名發音。例：こんにちは。
 * @property {string} mode - 對話模式（dialog or srtr），預設 dialog，延續對話 srtr。
 * @property {string} da - 對話編號，例：0。
 * @property {string} context - 用作延續下一筆對話的 context ID。
 */
function getDialogue (data) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'POST',
      baseURL: 'https://api.apigw.smt.docomo.ne.jp/dialogue/v1/',
      url: '/dialogue',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      params: {
        'APIKEY': process.env.DOCOMO_API_KEY
      },
      data
    }).then(response => {
      console.log('getDialogue:', JSON.stringify(response, null, 2))
      resolve(response.data)
    }).catch(response => {
      console.error('getDialogue ERROR:', JSON.stringify(response, null, 2))
      reject(new Error(response.data.statusMessage))
    })
  })
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
