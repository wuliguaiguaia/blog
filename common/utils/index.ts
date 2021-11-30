export const getDate = (str: string) => {
  const date = new Date(str)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  return `${year} 年 ${month} 月 ${day} 日`
}


/* 
  节流函数：
  每隔 time 执行一次 cb
*/
export const throttle = (cb: Function, time: number) => {
  let flag = true
  return (...arg: any[]) => {
    if (!flag) return
    cb(...arg)
    flag = false
    setTimeout(() => {
      flag = true
    }, time)
  }
}