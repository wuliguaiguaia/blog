import styles from './index.module.scss'
import Link from 'next/link'
import cns from 'classnames'
import { message } from 'antd'
import { IMessage } from 'common/interface'
import { useRouter } from 'next/router'
import { postMessage } from 'common/api/utils'
import CommentBox from 'components/CommentBox'

const NotFound = () => {
  const router = useRouter()
  /* 游戏？ */
  const addMessage = (data:IMessage) => {
    return postMessage(data)
  }
  const callback = () => {
    message.success('感谢您的反馈，即将为你跳转到首页~')
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return <div className={cns([styles.wrapper, 'jusCenter-alignCenter'])}>
    <div className={styles.left}>404</div>
    <div className={styles.right}>
      <p>啊哦，您访问的页面不存在 T_T</p>
      <p>您可以向我提点建议：</p>
      <CommentBox addMessage={addMessage} callback={callback}></CommentBox>
      <p>或者去<Link href="/"><a>首页</a></Link>发现更多美好的事情 :D</p>
    </div>
  </div>
}

export default NotFound