import * as apiMap from './api'
import axios from './../plugins/axios'


// axios#get(url[, config])
// axios#delete(url[, config])
// axios#head(url[, config])
// axios#options(url[, config])
// axios#post(url[, data[, config]])
// axios#put(url[, data[, config]])
// axios#patch(url[, data[, config]])

/* 索引类型 */
interface IData {
  [k: string]: any
}

const requestRender = (type: string, url: string) => {
  switch (type) {
  case 'get':
  case 'options':
  case 'head':
    return (params: IData, config: IData) => axios[type](url, { params, ...config }).then(res => res.data)
  case 'post':
  case 'put':
  case 'patch':
    return (data: IData, config: IData) => axios[type](url, data, config).then(res => res.data)
  case 'remove':
    return (params: IData, config: IData) => axios.delete(url, { params, ...config }).then(res => res.data)
  case 'file':
    // {headers: {'content-type': 'multipart/form-data}}
    return (data:IData, config:IData) => axios.post(url, data, config).then(res => res.data)
  case 'ws':
  default:
    return
  }
}


interface IRequest {
  [k: string]: any
}

const $http: IRequest = Object.keys(apiMap).reduce((res, type:string) => {
  const apis = apiMap[type]
  Object.keys(apis).forEach(key => {
    res[key] = requestRender(type, apis[key])
  })
  return res
}, {})

export default $http