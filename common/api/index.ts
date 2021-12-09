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
  [k: string]: number | string | [] | boolean | IData
}
type RequestRender = (type: string, url: string) => (params: IData, config: IData) => Promise<any>;
const requestRender: RequestRender = (type: string, url:string) => {
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
  // case 'file':
  default:
    // {headers: {'content-type': 'multipart/form-data}}
    return (data:IData, config:IData) => axios.post(url, data, config).then(res => res.data)
  // case 'ws':
  //   return new Promise(() => {1} )
  // default:
  //   return new Promise(() => {1})
  }
}


export function isValidKey(key: string | number | symbol , object: object): key is keyof typeof object {
  return key in object
}


interface IRequest {
  [k: string]:  Promise<any>
}

const $http: IRequest = Object.keys(apiMap).reduce((res:(IRequest), type: string) => {
  if (!isValidKey(type, apiMap)) {
    throw Error('invalid sequence')
  }
  const apis = apiMap[type]
  Object.keys(apis).forEach((key) => {
    if (!isValidKey(key, res)) {
      throw Error('invalid sequence')
    }
    res[key] = requestRender(type, apis[key]) as unknown as Promise<any>
  })
  return res
}, {})

export default $http


