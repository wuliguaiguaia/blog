import { Button, message } from 'antd'
import { IMessage } from 'common/interface'
import { UserUtils } from 'common/utils'
import React, { ChangeEventHandler, FunctionComponent, useState } from 'react'
import styles from './index.module.scss'
import cns from 'classnames'
import MessageDialog from 'components/MessageDialog'
import TextArea from 'antd/lib/input/TextArea'
import { localStorage } from 'common/utils/storage'

interface IProps {
  callback: () => void
  addMessage: (data: any) => void
  btnPosition?: 'left' | 'right'
  btnText?: string
  handleFocus?: () => void
}

const CommentBox: FunctionComponent<IProps> = ({
  callback,
  addMessage,
  handleFocus,
  btnPosition = 'left',
  btnText = '提交'
}) => {
  const [formData, setFormData] = useState<IMessage>({
    username: '',
    email: '',
    website: '',
    content: '',
  })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [dialogVisible, setDialogVisible] = useState<boolean>(false)
  const handleSubmit = async () => {
    if (!formData.content?.trim()) {
      message.warning('请输入内容')
      return
    }
    const userData = UserUtils.get()
    const showTip = localStorage.get('notip')
    const newData = { ...formData, ...userData }
    if (userData && showTip) {
      handleConfirm(newData)
      return
    }
    setFormData(newData)
    setDialogVisible(true)
  }

  const handleConfirm = async (idata: IMessage) => {
    setConfirmLoading(true)
    const res: any = await addMessage(idata)
    setConfirmLoading(false)
    if (res) {
      setDialogVisible(false)
      const { username, email, website } = idata
      localStorage.set('user', { username, email, website })
      setFormData({
        username: '',
        email: '',
        website: '',
        content: '',
      })
      callback()
    } else {
      message.error('反馈失败，请重试')
    }
  }

  const handleChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement
    setFormData({ ...formData, content: target.value })
  }

  return <>
    <div className={styles.inputWrapper}>
      <TextArea
        className={styles.input}
        placeholder="给咱也整两句吧~"
        autoSize={{ minRows: 2, maxRows: 6 }}
        value={formData.content}
        onChange={handleChange}
        onFocus={handleFocus}
      />
      <Button className={cns([styles.btn, styles[btnPosition]])} type="primary" onClick={handleSubmit}>{btnText}</Button>
    </div>
    <MessageDialog
      visible={dialogVisible}
      setVisible={setDialogVisible}
      data={formData}
      handleConfirm={handleConfirm}
      confirmLoading={confirmLoading}
    ></MessageDialog>
  </>
}


export default CommentBox