import { Col, Row, List, Spin } from 'antd'
import Author from '../../components/Author'
import Category from '../../components/Category'
import { GetStaticProps, NextPage } from 'next'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle, ICategory } from '../../common/interface'
import useInfiniteScroll from '../../common/hooks/useInfiniteScroll'
import { EyeOutlined, MessageOutlined } from '@ant-design/icons'
import { getArticleList, getCategory } from 'common/api/utils'
import Link from 'next/link'
import { formatDate, getValidText } from 'common/utils'

interface IProps {
  articles: IArticle[]
  category: ICategory[],
  articlesLength: number,
  loadingStatus: number
}

const prepage = 10

const Home: NextPage<IProps> = ({ articles, category, articlesLength }) => {
  const scrollCb = getArticleList.bind(undefined, {
    categories: [],
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
            header={<div className={styles.listTitle}>最新日志</div>}
            footer={
              <div className="list-bottom">
                {loading ? 
                  <Spin tip="正在疯狂加载中..." /> : articlesLength > 0 ? <span className="text">没有其他数据啦~</span> : null}
              </div>}
            dataSource={dataSource}
            itemLayout="vertical"
            renderItem={item => (
              <List.Item>
                <Link href={`/article/${item.id}`}><a>
                  <div className="list-title">{item.title}</div>
                  <div className="list-content" >{item.desc}</div>
                  <div className="list-keys">
                    <span className="item-date">{formatDate(+item.createTime).slice(0, 9)}</span>
                    <span className="item-view"><EyeOutlined /> {item.viewCount || 1230}</span>
                    <span><MessageOutlined /> {item.messages || 222}</span>
                  </div>
                </a></Link>
              </List.Item>
            )}
          />
        </Col>
        <Col className="main-right" xs={0} sm={0} md={7} lg={6} xl={5} xxl={4}>
          <Author />
          <Category data={category}/>
        </Col>
      </Row>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const categoryList = await getCategory()
  const [articles, articlesLength] = await getArticleList({
    page: 1,
    prepage,
    categories: [],
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