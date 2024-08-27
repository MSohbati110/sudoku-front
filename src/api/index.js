import axios from "axios"

const ISDEVELOPMODE = process.env.NODE_ENV !== 'production'
const django_api_url = 'http://192.168.103.5:8001'
const base_url = ISDEVELOPMODE ? django_api_url : ''

export default{
  getSudoku(data) {
    return axios({
      method: 'post',
      url: `${base_url}/api/new/`,
      data: data
    })
  }
}