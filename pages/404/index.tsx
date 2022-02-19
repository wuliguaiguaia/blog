import styles from './index.module.scss'
import { Input, Button } from 'antd'
import Link from 'next/link'
import cns from 'classnames'

const { TextArea } = Input
const NotFound = () => {
  /* 游戏？ */
  return <div className={cns([styles.wrapper, 'jusCenter-alignCenter'])}>
    <div className={styles.left}>404</div>
    <div className={styles.right}>
      <p>啊哦，您访问的页面不存在 T_T</p>
      <p>您可以向我提点建议：</p>
      <TextArea
        className={styles.input}
        placeholder=""
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
      <Button className={styles.btn} type="primary">提交</Button>
      <p>或者去<Link href="/"><a>首页</a></Link>发现更多美好的事情 :D</p>
    </div>
  </div>
}

export default NotFound