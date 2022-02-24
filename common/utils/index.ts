import marked from 'common/plugins/marked'
import { IUser } from './../interface/index'
import { localStorage } from './storage'

export enum DateType {
  text,
  line
}


/* 
  节流函数：
  每隔 time 执行一次 cb
*/

export const throttle = (cb: { (e: Event): void}, time: number) => {
  let flag = true
  let timer = 0
  return (e: Event) => {
    if (!flag) return
    cb(e)
    flag = false
    if(timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      flag = true
    }, time)
  }
}


export const UserUtils = {
  get() {
    return localStorage.get('user')
  },
  set(data: IUser) {
    return localStorage.set('user', data)
  }
}

export const getValidText = (str:string) => {
  let text = marked.parse(str)
  text = text.replace(/<[^>]+>/g, '').replaceAll('\n', '')
  return text
}

export const isBrowser = typeof window !== 'undefined'
