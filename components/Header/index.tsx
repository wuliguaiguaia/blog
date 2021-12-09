import { Row, Col } from 'antd'
import { ChangeEventHandler, FunctionComponent, useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './index.module.scss'
import ZInput from '../Input'
import { useRouter } from 'next/router'
import Image from 'next/image'
import cns from 'classnames'

interface IProps {
  loadingStatus: number
}
const Header: FunctionComponent<IProps> = function ({loadingStatus}) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    setSearchValue('')
  }, [router])
  
  const handleSearch = (value: string) => {
    router.push({
      pathname: '/search',
      query: {
        q: value
      }
    })
  }

  const handleValueChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchValue(e.target.value)
  }
  return (
    <div className={styles.header}>
      <Row justify="space-between" className="jusBetween-alignCenter">
        <Col xs={12} sm={12} md={12} lg={10} xl={10} className={cns(['align-center', styles.left])}>
          <div className={cns([
            styles.logo,
            'align-center',
            loadingStatus === 1 && styles.logoActive
          ])}>
            <Image
              src="/favicon.svg"
              alt="logo"
              width={18}
              height={18}
            />
          </div>
          <Link href="/" passHref><a className={styles.link}>小橘子</a></Link>
          <span className={styles.descrtion}>哈密瓜花蜜瓜</span>
        </Col>
        <Col xs={10} sm={10} md={10} lg={6} xl={6} >
          <ZInput placeholder="搜索如：我的第一篇" value={searchValue} handleChange= {handleValueChange} handleEnter={handleSearch}></ZInput>
        </Col>
      </Row>
    </div>
  )
}

export default Header
