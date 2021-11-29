export const getDate = (str: string) => {
  const date = new Date(str)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  return `${year} 年 ${month} 月 ${day} 日`
}
