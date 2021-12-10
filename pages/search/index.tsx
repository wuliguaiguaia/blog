import { Col, Row, List } from 'antd'
import { FunctionComponent, useEffect } from 'react'
import { useRouter } from 'next/dist/client/router'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle } from '../../common/interface'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { DateType, getDate } from '../../common/utils'
import Link from 'next/link'

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

const Search: FunctionComponent<IProps> = ({ articles, articlesLen }) => {
  const router = useRouter()
  const {query: {q = ''}} = router
  const routeChange = (id: number) => {
    router.push({
      pathname: '/detail',
      query: { id }
    })
  }
  const renderer = new marked.Renderer()
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    pedantic: false,
    sanitize: false,
    breaks: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code: string) {
      return hljs.highlightAuto(code).value
    }
  })

  useEffect(() => {
    /* 二次加工 */
    // articles.forEach(item => {
    //   let { contentSlice = '', title }= item
    //   title = title.replace(new RegExp(q as string, 'ig'), `<span class="red">${q}</span>`)
    //   item.title = title
    //   contentSlice = contentSlice.replace(new RegExp(q as string, 'ig'), `<span class="red">${q}</span>`)
    //   item.contentSlice = contentSlice
    // })
  }, [articles, q])

  return  <>
    <Row className="main" justify="center">
      <Col className="main-left" xs={23} sm={23} md={20} lg={17} xl={14} xxl={12}>
        <div className={styles.header}>相关内容<span className={styles.searchText}>为你找到约 {articlesLen} 个结果</span></div>
        {
          articles.length === 0 ?
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
          dataSource={articles}
          itemLayout="vertical"
          renderItem={ (item) => (
            <List.Item
              className={styles['content-wrapper']}
              onClick={() => { routeChange(item._source.id) }}
            >
              <div className={styles['list-title']} dangerouslySetInnerHTML={{ __html: item.highlight.title }}></div>
              <div className={cns(styles['list-content'])} dangerouslySetInnerHTML={{ __html: marked.parse(item.highlight.content || '') }}></div>
              <div className={styles['list-keys']}>
                <span className={styles['item-date']}>{getDate(item._source.createTime, DateType.line).replaceAll(' ', '')}</span>
                {
                  item._source.categories.map(({id, name}) => {
                    return <span className={styles['item-cates']} key={id}>
                      <Link href={{ pathname: '/', query: {categories: id}}}><a>{name}</a></Link>
                    </span>
                  })
                }
              </div>
            </List.Item>
          )}
        />
      </Col>
    </Row>
  </>
}
const getArticleFromSearch = async (params) => {
  const response = await $http.search(params)
  const { data: { list, total}  } = response
  return [list, total]
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query: { q } } = context
  const [articles, articlesLen] = await getArticleFromSearch({ page: 1, prepage: 10, words: q })
  return {
    props: {
      articles,
      articlesLen
    }
  }
}
export default Search