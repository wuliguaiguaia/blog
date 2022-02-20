import React, { ChangeEventHandler, FunctionComponent, useEffect, useState } from 'react'
import { Modal, message } from 'antd'
import { IMessage } from 'common/interface'
import { Input, Select } from 'antd'
import styles from './index.module.scss'

const { Option } = Select

interface IProps {
  visible: boolean,
  setVisible: (x: boolean) => void
  handleConfirm: () => void
  submit: (data: IMessage) => void
  data: IMessage
}
const MessageDialog: FunctionComponent<IProps> = ({ visible, setVisible, handleConfirm, data, submit}) => {
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [formData, setFormData] = useState<IMessage>(data)
  const checkValid = () => {
    const { username, website, email } = formData
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
    setConfirmLoading(true)
    await submit(formData)
    setConfirmLoading(false)
    handleConfirm()
  }
  const handleCancel = () => setVisible(false)
  const [title, setTitle] = useState<string>('确认信息')
  const onUsernameChange: ChangeEventHandler = (e) => { 
    const target = e.target as HTMLInputElement
    setFormData({...formData, username: target.value.trim()})
  }

  useEffect(() => {
    setConfirmLoading(false)
  }, [])

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setTitle('确认使用以下用户信息？')
    } else {
      setTitle('请输入用户信息')
    }
  }, [data])

  const selectBefore = (
    <Select defaultValue="http://" className="select-before">
      <Option value="http://">http://</Option>
      <Option value="https://">https://</Option>
    </Select>
  )

  const selectAfter = (
    <Select defaultValue=".com" className="select-after">
      <Option value=".com">.com</Option>
      <Option value=".jp">.jp</Option>
      <Option value=".cn">.cn</Option>
      <Option value=".org">.org</Option>
    </Select>
  )

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
      <Input maxLength={20} onChange={onUsernameChange} defaultValue={formData.username}/>
    </div>
    <div className={styles.row}>
      <span className={styles.title}><span className="red">*</span>邮箱：</span>
      <Input addonBefore={selectBefore} addonAfter={selectAfter} defaultValue=""/>
    </div>
    <div className={styles.row}>
      <span className={styles.title}>网站：</span>
      <Input addonBefore={selectBefore} addonAfter={selectAfter} defaultValue=""/>
    </div>
  </Modal>
}

export default MessageDialog