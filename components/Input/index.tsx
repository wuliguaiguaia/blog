import { FunctionComponent, MouseEventHandler, useEffect, useRef, useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import styles from './index.module.scss'
import cns from 'classnames'

interface IProps {
  placeholder: string,
  handleEnter: () => void,
  handleChange: () => void,
  value: string
}

const ZInput: FunctionComponent<IProps> = ({ placeholder, handleEnter, value, handleChange }) => {
  const [active, setActive] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const inputEl = useRef()
  const handleClick: MouseEventHandler<HTMLSpanElement> = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return
    setIsClick(true)
    const value = inputEl.current.value || ''
    if (value.trim() === '') {
      return
    }
    handleEnter(value)
  }
  useEffect(() => {
    const handleFocus = () => setActive(true)
    const handleBlur = () => {
      if (isClick) {
        setActive(true)
        setTimeout(() => {
          setActive(false)
        }, 2000)
      } else {
        setActive(false)
      }
    }

    inputEl.current.addEventListener('focus', handleFocus)
    inputEl.current.addEventListener('blur', handleBlur)
    inputEl.current.addEventListener('keydown', handleClick)
    return () => {
      inputEl.current.removeEventListener('focus', handleFocus)
      inputEl.current.removeEventListener('blur', handleBlur)
      inputEl.current.removeEventListener('keydown', handleClick)
    }
  }, [])
  return <div className={styles.inputWrapper}>
    <SearchOutlined
      className={cns([styles.searchIcon, active && styles.iconActive])}
      onClick={handleClick}
    />
    <input
      ref={inputEl}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className={cns([styles.input, active && styles.inputActive])}
    />
  </div>
}

export default ZInput