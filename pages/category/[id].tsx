import { Col, Row, List, Spin, Breadcrumb } from 'antd'
import Author from '../../components/Author'
import { useRouter } from 'next/dist/client/router'
import Category from '../../components/Category'
import { GetStaticProps, NextPage } from 'next'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle, ICategory } from '../../common/interface'
import useInfiniteScroll from '../../common/hooks/useInfiniteScroll'
import { EyeOutlined, MessageOutlined } from '@ant-design/icons'
import marked from '../../common/plugins/marked'
import { getArticleList, getCategory } from 'common/api/utils'
import Link from 'next/link'
import { formatDate } from 'common/utils'

interface IProps {
  articles: IArticle[]
  category: ICategory[],
  articlesLength: number,
  loadingStatus: number,
  curCategory: ICategory
}

const prepage = 10

const Home: NextPage<IProps> = ({ articles, category, articlesLength, curCategory }) => {
  const router = useRouter()
  const scrollCb = getArticleList.bind(undefined, {
    categories: [curCategory?.id],
    prepage,
    page: 1
  })
  const [list, loading] = useInfiniteScroll(articles, 'articleList', scrollCb, prepage, articlesLength)
  const dataSource: IArticle[] = list.current

  const { isFallback } = router
  if (isFallback) {
    return <div>loading...</div>
  }
  return (
    <>
      <Row className={cns(['main', styles.wrapper])} justify="center">
        <Col className="main-left" xs={23} sm={23} md={16} lg={17} xl={14} xxl={12}>
          <Breadcrumb className="card">
            <Breadcrumb.Item>
              <Link href="/"><a className={styles.link}>首页</a></Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{curCategory.name}</Breadcrumb.Item>
          </Breadcrumb>
          <List
            className={cns([styles.list, 'card', 'articleList'])}
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
                  <div className="list-content" dangerouslySetInnerHTML={{ __html: marked.parse(item.content.substr(0, 350).replaceAll('\n', '')) }}></div>
                  <div className="list-keys">
                    <span className="item-date">{item.createTime ? formatDate(+item.createTime).slice(0, 9) : ''}</span>
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
          <Category data={category} curCategoryId={curCategory.id}/>
        </Col>
      </Row>
    </>
  )
}

export async function getStaticPaths() { 
  const categories = await getCategory()
  const paths = categories.map((item: ICategory) => ({ params: { id: item.id + '' } }))
  return {
    paths,
    fallback: true
  }
}


export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id as string
  const categoryList = await getCategory()
  const [articles, articlesLength] = await getArticleList(
    {
      page: 1,
      prepage,
      categories: [+id],
    }, {})
  const curCategory = categoryList.find((item: ICategory) => item.id === +id)

  if (!curCategory) {
    return {
      notFound: true
    }
  }
  return {
    props: {
      allPostsData: [],
      category: categoryList,
      articles,
      articlesLength,
      curCategory,
    }
  }
}


export default Home