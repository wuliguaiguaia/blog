export enum DateType {
  text,
  line
}

export const getDate = (str: string, type: DateType = DateType.text) => {
  const date = new Date(str)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  if (type === DateType.text) {
    return `${year} 年 ${month} 月 ${day} 日`
  } else {
    return `${year} - ${month} - ${day} `
  }
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