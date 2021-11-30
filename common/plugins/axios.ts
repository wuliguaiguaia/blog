import { loadingUtil } from './../../components/Loadingbar/index'
import axios from 'axios'
/* 
  
*/

axios.interceptors.request.use((config) => {
  // loading start
  // loadingUtil.start()
  return config
})
axios.interceptors.response.use((response) => {
  // loading end
  // loadingUtil.end()
  return response
})

export default axios