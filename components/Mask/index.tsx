import React, { FunctionComponent } from 'react'
import styles from './index.module.scss'

interface IProps {
  visible: boolean,
  setVisible: (v: boolean) => void,
  content: any
}
const Mask: FunctionComponent<IProps> = ({ visible, setVisible, content }) => {
  if (!visible) return null
  return <div className={styles.maskWrapper} onClick={() => setVisible(false)}>{content}</div>
}

export default Mask
