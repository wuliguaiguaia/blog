import styles from './index.module.scss'
import { Input, Button, message } from 'antd'
import Link from 'next/link'
import cns from 'classnames'
import { postMessage } from 'common/api/utils'
import MessageDialog from 'components/MessageDialog'
import { ChangeEvent, ChangeEventHandler, useState } from 'react'
import { getUser } from 'common/utils'
import { IMessage } from 'common/interface'
import { useRouter } from 'next/router'

const { TextArea } = Input
const NotFound = () => {
  const router = useRouter()
  /* 游戏？ */
  const [formData, setFormData] = useState<IMessage>({
    username: '',
    email: '',
    website: '',
    content: ''
  })
  const [dialogVisible, setDialogVisible] = useState<boolean>(true)
  const handleSubmit = async () => {
    if (!formData.content?.trim()) {
      message.warning('请输入内容')
      return
    }
    const userData = getUser()
    setFormData({ ...formData, ...userData })
    setDialogVisible(true)
  }
  const submitMessage = async (data:IMessage) => {
    return postMessage(data)
  }
  const handleConfirm = () => {
    setDialogVisible(false)
    message.success('感谢您的反馈，即将为你跳转到首页~')
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  const handleChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement
    setFormData({ ...formData, content: target.value.trim()})
  }

  return <div className={cns([styles.wrapper, 'jusCenter-alignCenter'])}>
    <div className={styles.left}>404</div>
    <div className={styles.right}>
      <p>啊哦，您访问的页面不存在 T_T</p>
      <p>您可以向我提点建议：</p>
      <TextArea
        className={styles.input}
        placeholder=""
        autoSize={{ minRows: 2, maxRows: 6 }}
        onChange={handleChange}
      />
      <Button className={styles.btn} type="primary" onClick={handleSubmit}>提交</Button>
      <p>或者去<Link href="/"><a>首页</a></Link>发现更多美好的事情 :D</p>
    </div>
    <MessageDialog
      visible={dialogVisible}
      setVisible={setDialogVisible}
      data={formData}
      handleConfirm={handleConfirm}
      submit={submitMessage}
    ></MessageDialog>
  </div>
}

export default NotFound