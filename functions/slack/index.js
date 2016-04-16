/** @module functions/line */

/** Promise polyfill */
import 'babel-polyfill'
/** Promise based XMLHttpRequests client */
import axios from 'axios'

import { getDialogue } from '../../lib/docomo'
import translate from '../../lib/translate'

export default async function (event, context) {
  console.log('event:', JSON.stringify(event))
  try {
    // 1. 取得來自 Slack Bot 的 messages.
    const text = event.text
    // 2. 將使用者輸入的文字翻譯成日本語
    const source = await translate(process.env.GOOGLE_API_KEY, 'ja', text)
    // 3. 使用 docomo 提供的聊天 API 和機器人對話
    const dialogue = await getDialogue(process.env.DOCOMO_API_KEY, {
      utt: source.data.translations[0].translatedText,
      mode: 'dialog'
    })
    // 4. 將機器人回答的文字翻譯成使用者的語言
    const target = await translate(process.env.GOOGLE_API_KEY, source.data.translations[0].detectedSourceLanguage, dialogue.utt)
    // 5 將結果回傳給 Slack bot
    context.succeed(target.data.translations[0].translatedText)
  } catch (error) {
    console.log(JSON.stringify(error))
    context.fail()
  }
}
