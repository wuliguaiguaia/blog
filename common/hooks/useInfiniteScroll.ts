import { throttle } from './../utils/index';
import { useEffect, useState, useRef } from 'react';

/* 
  无限滚动
*/

const useInfiniteScroll = (initial: any, domclass: string, cb: any, prepage: number, deps: any[]) => {
  const list = useRef(initial)
  console.log(...deps);
  
  const [isEnd, setIsEnd] = useState(false)
  const [page, setPage] = useState(1)
  useEffect(() => {
    list.current = initial
  }, [initial])
  useEffect(() => {
    const handleScroll = async () => {
      if (isEnd) return
      const scrollTop = window.scrollY
      const el = document.getElementsByClassName(domclass)[0]
      if (!el) return
      const headerHeight = 60
      const safeDistance = 50 /* 滚动的安全距离 */
      const fullHeight = el.scrollHeight
      console.log(scrollTop + window.innerHeight + safeDistance, fullHeight + headerHeight);
      console.log(scrollTop, fullHeight);
      
      if (scrollTop + window.innerHeight + safeDistance > fullHeight + headerHeight) {
        console.log('获取数据, 第', page + 1)
        let data = await cb({
          page: page + 1,
        })
        data = data || []
        list.current = list.current.concat(data)
        console.log('客户端获取数据：', data)
        if (data.length < prepage) {
          setIsEnd(true)
          return
        }
        setPage(page + 1)
      }
    }
    const throttleScroll = throttle(handleScroll, 10)
    window.addEventListener('scroll', throttleScroll)
    return () => {
      window.removeEventListener('scroll', throttleScroll)
    }
  }, [isEnd, ...deps])

  return list
}

export default useInfiniteScroll