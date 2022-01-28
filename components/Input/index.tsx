import { ChangeEventHandler, createRef, FunctionComponent, MouseEventHandler, useEffect, useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import styles from './index.module.scss'
import cns from 'classnames'

interface IProps {
  placeholder: string,
  handleEnter: (value: string) => void,
  handleChange: ChangeEventHandler,
  value: string
}

const ZInput: FunctionComponent<IProps> = ({ placeholder, handleEnter, value, handleChange }) => {
  const [active, setActive] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const inputEl = createRef<HTMLInputElement>()
  const handleClick:MouseEventHandler = () => {
    setIsClick(true)
    if (!inputEl.current) return
    const value = inputEl.current.value
    if (value.trim() === '') return
    handleEnter(value)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!inputEl.current) return
    if (e.key !== 'Enter') return
    setIsClick(true)
    const value = inputEl.current.value
    if (value.trim() === '') return
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

    if (inputEl.current) {
      inputEl.current.addEventListener('focus', handleFocus)
      inputEl.current.addEventListener('blur', handleBlur)
      inputEl.current.addEventListener('keydown', handleKeyDown)
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