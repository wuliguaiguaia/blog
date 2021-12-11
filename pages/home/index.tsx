import { Col, Row, List } from 'antd'
import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import Author from '../../components/Author'
import { useRouter } from 'next/dist/client/router'
import Category from '../../components/Category'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle, ICategory } from '../../common/interface'
import { DateType, getDate, throttle } from '../../common/utils'
import useInfiniteScroll from '../../common/hooks/useInfiniteScroll'
import marked from '../../common/plugins/marked'
import { EyeOutlined, MessageOutlined } from '@ant-design/icons'

interface IProps {
  acticles: IArticle[]
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
  const routeChange = (id: number) => {
    router.push({
      pathname: '/detail',
      query: { id }
    })
  }
  const { query: { categories = [], mode } } = router
  const cates = decodeURIComponent(categories)
    .split(',')
    .filter(v => v)
    .map(item => +item)
  const [page, setPage] = useState(1)
  const [isEnd, setIsEnd] = useState(false)
  const list = useRef(articles)
  console.log(cates)
  useEffect(() => {
    const handleScroll = async () => {
      if (isEnd) return
      const scrollTop = window.scrollY
      const el = document.getElementsByClassName('articleList')[0]
      if (!el) return
      const headerHeight = 50
      const safeDistance = 50 /* 滚动的安全距离 */
      const fullHeight = el.scrollHeight
      console.log('-------');

      if (scrollTop + window.innerHeight + safeDistance > fullHeight + headerHeight) {
        console.log('获取数据, 第', page + 1)
        const data = await getArticle({
          page: page + 1,
          prepage,
          categories: cates,
          type: mode
        })
        debugger
        list.current = list.current.concat(data)
        console.log('客户端获取数据：', data)
        setPage(page + 1)

        if (data.length < prepage) {
          setIsEnd(true)
          return
        }
      }
    }
    const throttleScroll = throttle(handleScroll, 0)
    window.addEventListener('scroll', throttleScroll)
    return () => {
      window.removeEventListener('scroll', throttleScroll)
    }
  }, [cates, isEnd, mode, page])

  return (
    <>
      <Row className="main" justify="center">
        <Col className="main-left" xs={23} sm={23} md={16} lg={17} xl={14} xxl={12}>
          <List
            className={cns([styles.list, 'card', 'articleList'])}
            header={<div>最新日志</div>}
            footer={<div className={styles.bottomLine}>——————  人家是有底线的  ——————</div>}
            dataSource={list.current}
            itemLayout="vertical"
            renderItem={item => (
              <List.Item onClick={() => { routeChange(item.id)}}>
                <div className="list-title">{item.title}</div>
                <div className="list-content" dangerouslySetInnerHTML={{ __html: marked.parse(item.content.substr(0, 350)) }}></div>
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


const getArticle = async (params: any, other = {}) => {
  params = { ...params, ...other}
  const response = await $http.getarticlelist(params)
  const { data: { list, total} } = response
  console.log(total);
  
  return list
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // query 不变都会重新请求  TODO:
  const { query: { categories = [], mode = 0 } } = context
  const cates = decodeURIComponent(categories)
    .split(',')
    .filter(v => v)
    .map(item => +item)
  const categoryList = await getCategory()
  const articles = await getArticle(
    {
      page: 1,
      prepage,
      categories: cates,
      type: mode
    })

  return {
    props: {
      allPostsData: [],
      category: categoryList,
      articles,
      articlesLength: 10,
    }
  }
}


export default Home