import { Col, Row, List, Spin } from 'antd'
import { useRouter } from 'next/dist/client/router'
import { GetServerSideProps, NextPage } from 'next'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle } from '../../common/interface'
import marked from '../../common/plugins/marked'
import Link from 'next/link'
import useInfiniteScroll from '../../common/hooks/useInfiniteScroll'
import { getArticleListFromSearch } from 'common/api/utils'
import { formatDate } from 'common/utils'

type SearchArticle = {
    _source: IArticle,
    _score: number,
    highlight: {
      title: string,
      content: string
    }
  }
interface IProps {
  articles: SearchArticle[],
  articlesLen: number
}

const prepage = 10

const Search: NextPage<IProps> = ({ articles, articlesLen }) => {
  const router = useRouter()
  const {query: {q}} = router

  const scrollCb = getArticleListFromSearch.bind(undefined, {
    words: q,
    prepage,
    page: 1
  })

  const [list, loading] = useInfiniteScroll(articles, 'articleList', scrollCb, prepage, articlesLen)
  const dataSource:SearchArticle[] = list.current
  return  <>
    <Row className="main" justify="center">
      <Col className="main-left articleList" xs={23} sm={23} md={20} lg={17} xl={14} xxl={12}>
        <div className={styles.header}>相关内容<span className={styles.searchText}>为你找到约 {articlesLen} 个结果</span></div>
        {
          articlesLen === 0 ?
            <div className={cns([styles.noDate])}>
              <p className={styles.noDateTitle}>找不到和您查询的“{ q }”相符的内容</p>
              建议：
              <ul className={styles.noDateList}>
                <li>请检查输入字词有无错误。</li>
                <li>请尝试其他查询词。</li>
                <li>请改用较常见的字词。</li>
              </ul>
            </div> : null
        }
        <List
          className={cns(['card'])}
          dataSource={dataSource}
          itemLayout="vertical"
          footer={
            <div className="list-bottom">
              {loading ? 
                <Spin tip="正在疯狂加载中..." /> : articlesLen > 0 ? <span className="text">没有其他数据啦~</span> : null}
            </div>}
          renderItem={ (item) => (
            <List.Item className={styles['content-wrapper']}>
              <Link href={`/article/${item._source.id}`}><a>
                <div className={cns(['list-title'], styles.listTitle)} dangerouslySetInnerHTML={{ __html: item.highlight.title }}></div>
                <div className={cns(['list-content'], styles.listContent)} dangerouslySetInnerHTML={{ __html: marked.parse(item.highlight.content || '') }}></div>
                <div className='list-keys'>
                  <span className={styles['item-date']}>{formatDate(+item._source.createTime).slice(0, 9)}</span>
                  {
                    item._source.categories.map(({ id, name }) => {
                      return <span className={styles['item-cates']} key={id}>
                        <Link href={`/category/${id}`}><a>{name}</a></Link>
                      </span>
                    })
                  }
                </div>
              </a></Link>
            </List.Item>
          )}
        />
      </Col>
    </Row>
  </>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query: { q } } = context
  const [articles, articlesLen] = await getArticleListFromSearch({ page: 1, prepage: 10, words: q })
  return {
    props: {
      articles,
      articlesLen
    }
  }
}
export default Search