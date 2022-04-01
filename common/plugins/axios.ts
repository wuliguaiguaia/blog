import axios from 'axios'
import { message } from 'antd'

axios.interceptors.request.use((config) => {
  // loading start
  // loadingUtil.start()
  return config
})

axios.interceptors.response.use((response) => response, (error) => {
  const { data } = error.response
  if (data?.errStr) {
    message.error(data.errStr)
  } else {
    message.error(error.response.errorText)
  }
  return Promise.reject(error)
})

export default axios