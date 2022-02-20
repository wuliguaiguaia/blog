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


export const getUser = () => {
  return {
    username: 'aaa',
    website: 'fds',
    email: '11'
  }
}