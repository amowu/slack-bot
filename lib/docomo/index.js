/** @module lib/docomo */

/** Promise polyfill */
import 'babel-polyfill'
/** Promise based XMLHttpRequests client */
import axios from 'axios'

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
function getDialogue (key, data) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'POST',
      baseURL: 'https://api.apigw.smt.docomo.ne.jp/dialogue/v1/',
      url: '/dialogue',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      params: {
        'APIKEY': key
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

export {
  getDialogue
}
