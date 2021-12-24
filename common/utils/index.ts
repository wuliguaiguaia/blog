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
export const throttle = (cb, time: number) => {
  let flag = true
  let timer: any  = null
  return (...arg: any[]) => {
    if (!flag) return
    cb(...arg)
    flag = false
    clearTimeout(timer)
    timer = setTimeout(() => {
      flag = true
    }, time)
  }
}