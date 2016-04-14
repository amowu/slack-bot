/** @module lib/translate */

/** Promise polyfill */
import 'babel-polyfill'
/** Promise based XMLHttpRequests client */
import axios from 'axios'

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
export default function (key, target, q) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      baseURL: 'https://www.googleapis.com/',
      url: '/language/translate/v2',
      params: {
        key,
        target,
        q
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
