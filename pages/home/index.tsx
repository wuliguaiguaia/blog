import { Col, Row, List, Spin } from 'antd'
import Author from '../../components/Author'
import { useRouter } from 'next/dist/client/router'
import Category from '../../components/Category'
import { GetStaticProps, NextPage } from 'next'
import $http from '../../common/api'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle, ICategory } from '../../common/interface'
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

const Home: NextPage<IProps> = ({ articles, category, articlesLength }) => {
  const router = useRouter()
  const routeChange = (id: number) => {
    router.push({
      pathname: '/detail',
      query: { id }
    })
  }
  const scrollCb = getArticle.bind(undefined, {
    categories: [],
    type: '0',
    prepage,
    page: 1
  })

  const [list, loading] = useInfiniteScroll(articles, 'articleList', scrollCb, prepage, articlesLength)
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
                  <span className="item-date">{item.createTime.slice(0,10)}</span>
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

const getArticle = async (params: { page: number; prepage: number; categories: number[]; type: string | string[] | undefined }, other = {}) => {
  params = {...params,...other}
  const response = await $http.getarticlelist(params)
  const { data: { list, total } } = response
  return [list, total]
}

export const getStaticProps: GetStaticProps = async () => {
  console.log('home 重新请求')
  const categoryList = await getCategory()
  const [articles, articlesLength] = await getArticle({
    page: 1,
    prepage,
    categories: [],
    type: ''
  })

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