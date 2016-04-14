/** @module functions/line */

/** Promise polyfill */
import 'babel-polyfill'
/** Promise based XMLHttpRequests client */
import axios from 'axios'

import { getDialogue } from '../../lib/docomo'
import translate from '../../lib/translate'

export default async function (event, context) {
  console.log('Received event:', JSON.stringify(event))
  try {
    // 1. 取得來自 Facebook Messenger 的 JSON Body.
    const msg = event.entry[0].messaging[0]
    // 2. 將使用者輸入的文字翻譯成日本語
    const source = await translate(process.env.GOOGLE_API_KEY, 'ja', msg.message.text)
    // 3. 使用 docomo 提供的聊天 API 和機器人對話
    const dialogue = await getDialogue(process.env.DOCOMO_API_KEY, {
      utt: source.data.translations[0].translatedText,
      mode: 'dialog'
    })
    // 4. 將機器人回答的文字翻譯成使用者的語言
    const target = await translate(process.env.GOOGLE_API_KEY, source.data.translations[0].detectedSourceLanguage, dialogue.utt)
    // 5. 將對話結果發送回 Facebook Messenger
    const result = await sendMessage({
      recipient: {
        'id': msg.sender.id
      },
      message: {
        'text': target.data.translations[0].translatedText
      }
    })
    console.log(JSON.stringify(result))
    context.succeed()
  } catch (error) {
    console.log(JSON.stringify(error))
    context.fail()
  }
}

/**
 * Facebook Messenger Sending messages API
 * @see {@link https://developers.facebook.com/docs/messenger-platform}
 * @param {Object} data - a JSON string in the request body that includes the message you want to send.
 * @return {Promise.<, Error>}
 */
function sendMessage (data) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'POST',
      url: 'https://graph.facebook.com/v2.6/me/messages',
      params: {
        'access_token': process.env.FACEBOOK_TOKEN
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
