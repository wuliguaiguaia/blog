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
import useSWR from 'swr'
import { get } from 'common/api/api'
import { Avatar, Statistic, Row, Col, Popover, Tooltip } from 'antd'

const Author: FunctionComponent = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data, error } = useSWR(get.getcount, fetcher)
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  return (
    <div className={cns([styles['author-wrapper'], 'card'])}>
      <div className='jus-center'>
        <Avatar shape="circle" size={130} src={avatar.src} />
      </div>
      <Row gutter={15} className={styles.data}>
        <Col span={12}>
          <Statistic title="Article" value={data.data.articleLen} />
        </Col>
        <Col span={12}>
          <Statistic title="Message" value={data.data.messageLen} />
        </Col>
      </Row>
      <div className={styles.divider} />
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
