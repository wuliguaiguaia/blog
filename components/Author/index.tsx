import { Divider, Avatar, Statistic, Row, Col, Popover, Tooltip  } from 'antd'
import {
  WechatOutlined,
  ZhihuOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import cns from 'classnames'
import styles from './index.module.scss'
import { FunctionComponent } from 'react'
import Image from 'next/image'
import avatar from 'assets/images/avator.jpg'
import vx from 'assets/images/vx.png'

interface IProps {
  articlesLength: number
}
const Author: FunctionComponent<IProps> = ({ articlesLength }) => {
  return (
    <div className={cns([styles['author-wrapper'], 'card'])}>
      <div className='jus-center'>
        <Avatar shape="circle" size={130} src={avatar.src}/>
      </div>
      <Row gutter={15} className={styles.data}>
        <Col span={12}>
          <Statistic title="Article" value={articlesLength} />
        </Col>
        <Col span={12}>
          <Statistic title="Message" value={112893} />
        </Col>
      </Row>
      <Divider />
      <div className='jus-center'>
        <Popover
          content={<Image src={vx.src} width="120" height="120" alt="" />}
          color="rgb(200, 186, 99)"
          placement="bottom">
          <Avatar className={styles.icon} icon={<WechatOutlined />} />
        </Popover>
        <Tooltip
          title={<a href="https://www.zhihu.com/people/da-da-da-xiao-jie-82" target="_blank" rel="noreferrer">知乎跳转</a>}
          placement="bottom"
          color="#fff"
        >
          <a href="https://www.zhihu.com/people/da-da-da-xiao-jie-82" target="_blank" rel="noreferrer">
            <Avatar className={styles.icon} icon={<ZhihuOutlined />} />
          </a>
        </Tooltip>
        <Tooltip
          title={<a href="https://github.com/wuliguaiguaia" target="_blank" rel="noreferrer">Github跳转</a>}
          placement="bottom"
          color="#fff"
        >
          <a href="https://github.com/wuliguaiguaia" target="_blank" rel="noreferrer">
            <Avatar className={styles.icon} icon={<GithubOutlined />} />
          </a>
        </Tooltip>
      </div>
    </div>
  )
}

export default Author
