import Head from '../../components/Head'
import { Col, Row, List } from 'antd'
import Header from '../../components/Header'
import { FunctionComponent, useEffect, useState } from 'react'
import Author from '../../components/Author'
import Footer from '../../components/Footer'
import { useRouter } from 'next/dist/client/router'
import Category from '../../components/Category'
import Link from 'next/link'
import { BackTop } from 'antd'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'
import styles from './index.module.scss'
import cns from 'classnames'
export interface ICategory {
  id: number;
  name: string;
  articlesLen: number;
}

export interface IArticle {
  id: number;
  title: string;
  content: string;
  keywords: string;
  createTime: string;
  viewCount: number;
  categories: ICategory[]
}
interface IProps {
  acticles: IArticle[]
  category: ICategory[],
  articlesLength: number
}

// import axios from 'axios'    
// import dynamic from 'next/dynamic'
// const Eeader = dynamic(import('../components/Header'))
const Home: FunctionComponent<IProps> = ({ acticles, category, articlesLength }) => {
  const [curCategory, setCurCategory] = useState(0)
  const router = useRouter()
  const routeChange = (id: number) => {
    router.push({
      pathname: '/detail',
      query: { id }
    })
  }

  useEffect(() => {
    const { query: {category: _curCategory}} = router
    setCurCategory(Number(_curCategory))
  },[router, router.events])

  return (
    <>
      <Head title={'orange.com'} />
      <Header />
      <Row className="main" justify="center">
        <Col className="main-left" xs={23} sm={23} md={16} lg={17} xl={14} xxl={12}>
          <List
            className={cns([styles.list, 'card'])}
            header={<div>最新日志</div>}
            dataSource={acticles}
            itemLayout="vertical"
            renderItem={item => (
              <List.Item onClick={() => { routeChange(item.id)}}>
                <div className="list-title">{item.title}</div>
                <div className="list-context">{item.content}</div>
                <div className="list-keys">
                  <span>{item.createTime}</span>
                  <span>{item.keywords}</span>
                </div>
              </List.Item>
            )}
          />
        </Col>
        <Col className="main-right" xs={0} sm={0} md={7} lg={6} xl={5} xxl={4}>
          <Author articlesLength={articlesLength} />
          <Category data={category} current={curCategory}/>
        </Col>
      </Row>
      <BackTop />
      <Footer/>
    </>
  )
}

// export async function getStaticProps() {
//   const allPostsData = getSortedPostsData()
//   console.log('get data')
//   return {
//     props: {
//       allPostsData
//     }
//   }
// }

// https://swr.vercel.app/zh-CN


const getCategory = async () => {
  const response = await $http.getcategorylist()
  const { data: { list } } = response
  return list
}


const getArticle = async (params) => {
  const response = await $http.getarticlelist(params)
  const { data: { list, total } } = response
  return [list, total]
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query: {category} } = context
  const categoryList = await getCategory()
  const [acticles, articlesLength] = await getArticle({ page: 1, prepage: 10, categories: category ? [category] : [] })
  /* const data = [
    { id: 1, value: 'javascript' },
    { id: 2, value: 'html/css' },
    { id: 3, value: 'react' },
    { id: 4, value: 'vue' },
    { id: 5, value: 'node' },
    { id: 6, value: 'mysql' }
  ] */

  return {
    props: {
      allPostsData: [],
      category: categoryList,
      acticles,
      articlesLength,
    }
  }
}


export default Home