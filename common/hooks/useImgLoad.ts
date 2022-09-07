import { useEffect, useState } from 'react'
export const useImgLoad = (content:string)=> {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const promises: Promise<unknown>[] = []
    content.replace(/<img src="([^"]+)".+\/>/g, (_, src) => {
      const promise = new Promise((resolve, reject) => {
        const img = new Image()
        img.src = src
        img.onload = () => {
          resolve(true)
        }
        img.onerror = () => {
          reject()
        }
      })
      promises.push(promise)
      return ''
    })
    Promise.all(promises).then(() => {
      setLoaded(true)
      console.log('图片已加载完成')
    }).catch(() => {
      setLoaded(false)
    })
  }, [content])
  return [loaded]
}