import Head from '../../components/Head'
import { Col, Row, List } from 'antd'
import Header from '../../components/Header'
import { FunctionComponent } from 'react'
import Footer from '../../components/Footer'
import { useRouter } from 'next/dist/client/router'
import { BackTop } from 'antd'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'
import styles from './index.module.scss'
import cns from 'classnames'
import { IArticle } from '../../common/interface'

interface IProps {
  articles: IArticle[]
}
const Search: FunctionComponent<IProps> = ({ articles }) => {
  const router = useRouter()
  const routeChange = (id: number) => {
    router.push({
      pathname: '/detail',
      query: { id }
    })
  }
  return  <>
    <Row className="main" justify="center">
      <Col className="main-left" xs={23} sm={23} md={20} lg={17} xl={14} xxl={12}>
        <div className={styles.header}>相关内容<span className={styles.searchText}>为你找到约 15 个结果</span></div>
        {
          articles.length === 0 ?
            <div className={cns([styles.noDate])}>
              <p className={styles.noDateTitle}>找不到和您查询的“asfsdfsd”相符的内容</p>
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
    </Row>
  </>
}
const getArticle = async (params) => {
  const response = await $http.getarticlelist(params)
  // const { data } = response
  const { data: { list } } = response
  return list
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query: { q } } = context
  const articles = await getArticle({ page: 1, prepage: 10 })
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
      articles
    }
  }
}
export default Search