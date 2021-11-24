import Footer from '../../components/Footer'
import Header from '../../components/Header'
import Head from '../../components/Head'
import Link from 'next/link'
import styles from './index.module.scss'

export default function Custom404() {
  return (
    <div>
      <Header/>
      <Head title="页面找不到啦" />
      <div className="jusCenter-alignCenter" style={{ marginTop: '100px' }}>
        <h1>
            Something went WRONG!
        </h1>
        <Link href="/" passHref>返回首页</Link>
      </div>
      <Footer/>
    </div>
  )
}