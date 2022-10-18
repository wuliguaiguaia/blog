/* 记住上次数据 */
import { useEffect, useRef } from 'react'
export default function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}