import { Divider, Avatar } from 'antd'
import {
  UserOutlined, WechatOutlined, ZhihuOutlined, GithubOutlined,
} from '@ant-design/icons'
import classnames from 'classnames'
import styles from './index.module.less'

export default function Author() {
  return (
    <div className={styles['anthor-wrapper']}>
      <div className="flex-center"><Avatar size={64} icon={<UserOutlined />} /></div>
      <Divider>About</Divider>
      <div className={classnames('flex-center', styles.icons)}>
        <Avatar size="small" className={styles.icon} icon={<WechatOutlined />} />
        <Avatar size="small" className={styles.icon} icon={<ZhihuOutlined />} />
        <Avatar size="small" className={styles.icon} icon={<GithubOutlined />} />
      </div>
    </div>
  )
}
