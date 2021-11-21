import { Divider, Avatar, Statistic, Row, Col, Button  } from 'antd'
import {
  UserOutlined, WechatOutlined, ZhihuOutlined, GithubOutlined,
} from '@ant-design/icons'
import cns from 'classnames'
import styles from './index.module.scss'
import { FunctionComponent } from 'react'


interface IProps {
  articlesLength: number
}
const Author: FunctionComponent<IProps> = ({ articlesLength }) => {
  return (
    <div className={styles['anthor-wrapper']}>
      <div className="jus-center"><Avatar shape="square" size={64} icon={<UserOutlined />} /></div>
      <Row gutter={15} className={styles.data}>
        <Col span={12}>
          <Statistic title="Artical" value={articlesLength} />
        </Col>
        <Col span={12}>
          <Statistic title="Message" value={112893} />
        </Col>
      </Row>
      <Divider>About</Divider>
      <div className={cns('jus-center', styles.icons)}>
        <Avatar size="small" className={styles.icon} icon={<WechatOutlined />} />
        <Avatar size="small" className={styles.icon} icon={<ZhihuOutlined />} />
        <Avatar size="small" className={styles.icon} icon={<GithubOutlined />} />
      </div>
    </div>
  )
}

export default Author
