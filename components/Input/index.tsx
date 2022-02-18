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
  const inputEl = createRef<HTMLInputElement>()
  const handleClick:MouseEventHandler = () => {
    if (!inputEl.current) return
    const value = inputEl.current.value
    inputEl.current.focus()
    if (value.trim() === '') return
    handleEnter(value)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!inputEl.current) return
    if (e.key !== 'Enter') return
    const value = inputEl.current.value
    if (value.trim() === '') return
    handleEnter(value)
  }
  useEffect(() => {
    const handleFocus = () => setActive(true)
    const handleBlur = () => {
      setActive(false)
    }

    if (inputEl.current) {
      inputEl.current.addEventListener('focus', handleFocus)
      inputEl.current.addEventListener('blur', handleBlur)
      inputEl.current.addEventListener('keydown', handleKeyDown)
    }
  }, [inputEl])

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