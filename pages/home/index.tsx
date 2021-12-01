import { Col, Row, List } from 'antd'
import { FunctionComponent } from 'react'
import Author from '../../components/Author'
import { useRouter } from 'next/dist/client/router'
import Category from '../../components/Category'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle, ICategory } from '../../common/interface'

interface IProps {
  acticles: IArticle[]
  category: ICategory[],
  articlesLength: number,
  loadingStatus: number
}

// import axios from 'axios'    
// import dynamic from 'next/dynamic'
// const Eeader = dynamic(import('../components/Header'))
const Home: FunctionComponent<IProps> = ({ acticles, category, articlesLength, loadingStatus }) => {
  const router = useRouter()
  const routeChange = (id: number) => {
    router.push({
      pathname: '/detail',
      query: { id }
    })
  }

  return (
    <>
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
                {/* <div className="list-context">{item.content}</div> */}
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
          <Category data={category}/>
        </Col>
      </Row>
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
  const { data } = response
  // const { data: { list } } = response
  return data
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  // query 不变都会重新请求  TODO:
  const { query: { categories = [], mode = 0 } } = context
  const cates = decodeURIComponent(categories)
    .split(',')
    .filter(v => v)
    .map(item => +item)
  const categoryList = await getCategory()
  const acticles = await getArticle(
    {
      page: 1,
      prepage: 10,
      categories: cates,
      type: mode
    })
  

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
      articlesLength: 10,
    }
  }
}


export default Home