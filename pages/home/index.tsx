import { Col, Row, List, Spin } from 'antd'
import { FunctionComponent } from 'react'
import Author from '../../components/Author'
import { useRouter } from 'next/dist/client/router'
import Category from '../../components/Category'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle, ICategory } from '../../common/interface'
import { DateType, getDate } from '../../common/utils'
import useInfiniteScroll from '../../common/hooks/useInfiniteScroll'
import { EyeOutlined, MessageOutlined } from '@ant-design/icons'
import marked from '../../common/plugins/marked'

interface IProps {
  articles: IArticle[]
  category: ICategory[],
  articlesLength: number,
  loadingStatus: number
}

const prepage = 10

// import axios from 'axios'    
// import dynamic from 'next/dynamic'
// const Eeader = dynamic(import('../components/Header'))
const Home: FunctionComponent<IProps> = ({ articles, category, articlesLength }) => {
  console.log('regresh')
  const router = useRouter()
  const { query } = router
  const { mode } = query
  const categories = query.categories as string
  const cates = decodeURIComponent(categories)
    .split(',')
    .filter(v => v)
    .map(item => +item)

  const routeChange = (id: number) => {
    router.push({
      pathname: '/detail',
      query: { id }
    })
  }
  const scrollCb = getArticle.bind(undefined, {
    categories: cates,
    type: mode,
    prepage
  })

  const [list, loading] = useInfiniteScroll(articles, 'articleList', scrollCb, prepage)
  const dataSource: IArticle[] = list.current
  return (
    <>
      <Row className="main" justify="center">
        <Col className="main-left" xs={23} sm={23} md={16} lg={17} xl={14} xxl={12}>
          <List
            className={cns([styles.list, 'card', 'articleList'])}
            header={<div>最新日志</div>}
            footer={
              <div className="list-bottom">
                {loading ? 
                  <Spin tip="正在疯狂加载中..." /> : articlesLength > 0 ? <span className="text">没有其他数据啦~</span> : null}
              </div>}
            dataSource={dataSource}
            itemLayout="vertical"
            renderItem={item => (
              <List.Item onClick={() => { routeChange(item.id)}}>
                <div className="list-title">{item.title}</div>
                <div className="list-content" dangerouslySetInnerHTML={{ __html: marked.parse(item.content.substr(0, 350).replaceAll('\n', '')) }}></div>
                <div className="list-keys">
                  <span className="item-date">{getDate(item.updateTime, DateType.line).replaceAll(' ', '')}</span>
                  <span className="item-view"><EyeOutlined /> {item.viewCount || 1230}</span>
                  <span><MessageOutlined /> {item.messages || 222}</span>
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

const getCategory = async () => {
  const response = await $http.getcategorylist()
  const { data: { list } } = response
  return list
}

const getArticle = async (params: { page: number; prepage: number; categories: number[]; type: string | string[] | undefined }, other = {}, type = 0) => {
  params = { ...other, ...params }
  const response = await $http.getarticlelist(params)
  const { data: { list, total } } = response
  console.log(list, total)
  
  return type === 1 ? [list, total] : list
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // query 不变都会重新请求  TODO:
  const { query } = context
  const categories = query.categories as string
  const cates = decodeURIComponent(categories)
    .split(',')
    .filter(v => v)
    .map(item => +item)
  const categoryList = await getCategory()
  const [articles, articlesLength] = await getArticle(
    {
      page: 1,
      prepage,
      categories: cates,
      type: query.mode
    }, {}, 1)

  return {
    props: {
      allPostsData: [],
      category: categoryList,
      articles,
      articlesLength,
    }
  }
}


export default Home