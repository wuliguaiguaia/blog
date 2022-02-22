import React, { ChangeEventHandler, FunctionComponent, useEffect, useState } from 'react'
import { Modal, message, Checkbox } from 'antd'
import { IMessage } from 'common/interface'
import { Input } from 'antd'
import styles from './index.module.scss'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { localStorage } from 'common/utils/storage'

interface IProps {
  visible: boolean,
  setVisible: (x: boolean) => void
  handleConfirm: (data: IMessage) => void
  data: IMessage
  confirmLoading: boolean,
}
const MessageDialog: FunctionComponent<IProps> = ({
  visible,
  setVisible,
  handleConfirm,
  data,
  confirmLoading,
}) => {
  const [showTipText, setshowTipText] = useState(false)
  const [formData, setFormData] = useState<IMessage>(data)
  const checkValid = () => {
    const { username, email } = formData
    if (!username?.trim()) {
      message.error('请输入用户名')
      return false
    }
    if (!email?.trim()) {
      message.error('请输入邮箱')
      return false
    }
    return true
  }
  const handleOk = async () => {
    if (!checkValid()) return
    handleConfirm(formData)
  }
  const handleCancel = () => setVisible(false)
  const [title, setTitle] = useState<string>('确认信息')
  const onChange: ChangeEventHandler = (e) => { 
    const target = e.target as HTMLInputElement
    const field = target.dataset.field as keyof IMessage
    const newData = { ...formData, [field]: target.value.trim()}
    setFormData(newData)
  }
  const onTipChange = (e: CheckboxChangeEvent) => {
    const target = e.target
    localStorage.set('notip', target.checked)
  }

  useEffect(() => {
    setFormData(data)
    if (data.username.trim()) {
      setTitle('确认使用以下用户信息？')
      setshowTipText(true)
    } else {
      setTitle('请输入用户信息')
      setshowTipText(false)
    }
  }, [data])

  return <Modal
    title={title}
    visible={visible}
    onOk={handleOk}
    confirmLoading={confirmLoading}
    onCancel={handleCancel}
    okText="确认并提交"
    cancelText="取消"
  >
    <div className={styles.row}>
      <span className={styles.title}><span className="red">*</span>昵称：</span>
      <Input maxLength={20} data-field="username" onChange={onChange} value={formData.username}/>
    </div>
    <div className={styles.row}>
      <span className={styles.title}><span className="red">*</span>邮箱：</span>
      <Input value={formData.email} data-field="email" onChange={onChange}/>
    </div>
    <div className={styles.row}>
      <span className={styles.title}>&nbsp; 网站：</span>
      <Input value={formData.website} data-field="website" onChange={onChange}/>
    </div>
    {
      showTipText ? <div className={styles.tip}>
        <Checkbox onChange={onTipChange}>不再提示</Checkbox>
      </div> : null
    }
  </Modal>
}

export default MessageDialog