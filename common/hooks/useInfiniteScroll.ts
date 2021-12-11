import { throttle } from './../utils/index'
import { useState, useRef, useEffect } from 'react'

/* 无限滚动  */
const useInfiniteScroll = (initial: any[], selector: string, cb:any, deps:any[], prepage:number) => {
  const [page, setPage] = useState(1)
  const [isEnd, setIsEnd] = useState(false)
  const list = useRef<any[]>(initial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    list.current = initial
    setLoading(false)
    setIsEnd(false)
    setPage(1)
  }, [initial])

  useEffect(() => {
    const handleScroll = async () => {
      if (isEnd) return
      if(loading) return
      const scrollTop = window.scrollY
      const el = document.getElementsByClassName(selector)[0]
      if (!el) return
      const headerHeight = 56
      const safeDistance = 50 /* 滚动的安全距离 */
      const fullHeight = el.scrollHeight

      if (scrollTop + window.innerHeight + safeDistance > fullHeight + headerHeight) {
        console.log('获取数据, 第', page + 1)
        setLoading(true)
        const data = await cb({
          page: page + 1,
        })
        list.current = list.current.concat(data)
        console.log('客户端获取数据：', data)
        setPage(page + 1)
        setLoading(false)
        if (data.length < prepage) {
          setIsEnd(true)
          return
        }
      }
    }
    const throttleScroll = throttle(handleScroll, 0)
    window.addEventListener('scroll', throttleScroll)
    return () => {
      window.removeEventListener('scroll', throttleScroll)
    }
  }, [isEnd, page, loading, selector, cb, prepage])
  return [list, loading]
}

export default useInfiniteScroll