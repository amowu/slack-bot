import axios from 'axios'

export function postToChannel (webhookUrl, attachments) {
  return new Promise((resolve, reject) => {
    axios.post(webhookUrl, attachments)
      .then(response => resolve(response))
      .catch(response => reject(response))
  })
}
