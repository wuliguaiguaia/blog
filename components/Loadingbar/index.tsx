import { FunctionComponent, useEffect, useState } from 'react'
import styles from './index.module.scss'
import cns from 'classnames'

interface IProps {
  status: number
}


// const proxy = new Proxy({ }, {
//   set(target, key, value) {
//     target.key = value
//   },
//   get(target, key) {
//     return target.key
//   }
// })
const LoadingBar: FunctionComponent<IProps> = ({ status }) => {
  const [active, setActive] = useState(-1)
  useEffect(() => {
    setActive(status)
  },[status])
  return <div className={cns([
    styles.wrapper,
    active === -1 && styles.hide
  ])}>
    <div className={cns([
      styles.line,
      active === 1 && styles.lineActive,
      active === 0 && styles.lineStartActive
    ])}></div>
  </div>
}


export default LoadingBar

export const loadingUtil = {
  start() {
    // status = 0
    console.log('start')
    
  },
  end() {
    // status = 1
    console.log('end')
  }
}