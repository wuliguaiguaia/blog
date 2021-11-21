import Head from '../../components/Head'
import { Col, Row, List } from 'antd'
import Header from '../../components/Header'
import { FunctionComponent, useEffect, useState } from 'react'
import Author from '../../components/Author'
import Footer from '../../components/Footer'
import { useRouter } from 'next/dist/client/router'
import Category from '../../components/Category'

import { BackTop } from 'antd'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'

export interface ICategory {
  id: number;
  name: string;
}
interface IProps {
  acticles: object[]
  category: ICategory[],
  articlesLength: number
}

// import axios from 'axios'    
// import dynamic from 'next/dynamic'
// const Eeader = dynamic(import('../components/Header'))
const Home: FunctionComponent<IProps> = ({ acticles, category, articlesLength }) => {
  const [mylist, setMylist] = useState([])
  const router = useRouter()
  const routeChange = (id: number) => {
    router.push({
      pathname: '/detail',
      query: { id }
    } )
  }

  useEffect(() => {
    const handleRouteChange = (path: string) => {
      const pattern = /category=(\d+)/
      const matches = path.match(pattern)
      if (!matches) return
      const categoryId = matches[1]
      console.log('categoryId', categoryId)
      // setMylist(() => {
      //   return initialList.filter(item => item.category === +categoryId)
      // })
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  },[router.events])

  return (
    <>
      <Head title={'orange.com'}/>
      <Header/>
      <Row className="main" justify="center">
        <Col className="main-left" xs={24} sm={24} md={16} lg={18} xl={14}>
          <List
            header={<div>最新日志</div>}
            dataSource={acticles}
            itemLayout="vertical"
            renderItem={item => (
              <List.Item onClick={() => { routeChange(item.id)}}>
                <div className="list-title">{item.title}</div>
                <div className="list-context">{item.content}</div>
                <div className="list-keys">
                  <span>{item.createTime }</span>
                  <span>{item.keywords }</span>
                </div>
              </List.Item>
            )}
          />
        </Col>
        <Col className="main-right" xs={24} sm={24} md={7} lg={5} xl={5}>
          <Author articlesLength={articlesLength}/>
          <Category data={ category }/>
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
  const response = await $http.getcategory()
  const { data: { list } } = response
  return list
}


const getArticle = async (params) => {
  const response = await $http.getarticle(params)
  const { data: { list, total } } = response
  return [list, total]
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const category = await getCategory()
  const [acticles, articlesLength] = await getArticle({page: 1})
  
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
      category,
      acticles,
      articlesLength,
    }
  }
}


export default Home