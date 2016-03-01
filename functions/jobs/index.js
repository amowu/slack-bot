import λ from 'apex.js'
import axios from 'axios'
import 'babel-polyfill'

export default λ((event, context) => {
  const url = 'https://api.import.io/store/connector/0a570a00-9a70-4e73-88cf-9fd4f1009130/_query?input=webpage/url:http%3A%2F%2Ftw.indeed.com%2Fjobs%3Fas_and%3D%26as_phr%3D%26as_any%3D%26as_not%3D%26as_ttl%3D%25E5%2589%258D%25E7%25AB%25AF%26as_cmp%3D%26jt%3Dfulltime%26st%3D%26radius%3D100%26l%3D%25E5%258F%25B0%25E5%258C%2597%25E5%25B8%2582%26fromage%3Dlast%26limit%3D10%26sort%3Ddate%26psf%3Dadvsrch&_apikey=c95c2cfe2b5648958728df00fbf5012babf6afe39896da33b497a0a12c3966bf560eba65d3aa7bd45f0f2ed54ee2b7e07510c6d963f1e7f77397de954f5f1b4c91dade04e30f271c1a1cc68779b1b543'
  return fetch(url)
  // TODO:
  // get jobs.source and lastUpdate from DynamoDB
  // fetch new jobs from API
  // update jobs.lastUpdate into DynamoDB
  // post to Slack
})

async function fetch (url) {
  return await axios.get(url)
}
