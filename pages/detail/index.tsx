import { Col, Row, Breadcrumb, Divider, BackTop } from 'antd'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Author from '../../components/Author'
import { renderToString} from 'react-dom/server'
import { marked } from 'marked'
import * as hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import MarkdownNavbar from './../../components/MarkdownNav'
import { withRouter, NextRouter } from 'next/router'
import Link from 'next/link'
import Head from '../../components/Head'
import styles from './index.module.scss'
import cns from 'classnames'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'
import { IArticle } from '../home'
import { getDate } from '../../common/utils'
import { useEffect } from 'react'

export interface NavList {
  level: number;
  text: string;
  children: NavList[]
}

interface WithRouterProps {
  router: NextRouter
}

interface IProps extends WithRouterProps {
  article: IArticle
}


const Detail = (props: IProps) => {
  const { router, article } = props
  const category = article.categories?.[0]
  
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


  const navList: NavList[]= []
  /* markdown 各级标题样式自定义 */
  renderer.heading = (text, level) => {
    if (level === 2) {
      navList.push({ text, level, children: [] })
    } else {
      let last = navList[navList.length - 1]
      last.children.push({ text, level, children: [] })
    }
    const markerContents = renderToString(<div className={cns(styles[`title-${level}`], styles.title)}><a id={`#${text}`} href={`/detail?id=${router.query.id}#${text}`} >{text}</a></div>)
    return markerContents
  }

  useEffect(() => {
    const handleHashChange = () => {
      const target = document.getElementById(decodeURIComponent(location.hash))
      if (!target) return
      const headerPadding = 8
      document.documentElement.scrollTop = target.offsetTop + headerPadding
    }
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    router.events.on('hashChangeComplete', handleHashChange) // ???????
    return () => {
      router.events.off('hashChangeComplete', handleHashChange)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [router.events])

  let html = marked.parse(article.content)
  return (
    <>
      <Head title={article.title} />
      <Header/>
      <Row className="main" justify="center">
        <Col className="main-left" xs={22} sm={23} md={16} lg={17} xl={14} xxl={12}>
          <Breadcrumb className="card">
            <Breadcrumb.Item>
              <Link href="/" passHref><a >首页</a></Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={`/?category=${category.id}`} passHref>{category.name}</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className={cns(styles.article ,'card')}>
            <div className={styles['article-title']}>{article.title}</div>
            <div className={styles['article-time']}>{getDate(article.createTime)}</div>
            <div className="article-keys">
              <span>{/* {article.keywords} */}</span>
            </div>
            <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} ></div>
          </div>
          <div className="article-keys">
            <span>{article.keywords}</span>
            <span>{article.viewCount}</span>
          </div>
          <Divider>留言区</Divider>
        </Col>
        <Col className="main-right" xs={0} sm={0} md={7} lg={6} xl={5} xxl={4}>
          <Author />
          <div className={cns(styles['article-menu'], 'position-sticky', 'card')}>
            <Divider orientation="left">Directory</Divider>
            {/* <MarkdownNavbar
              source={article.content}
              ordered={false}
              headingTopOffset={0}
              declarative={true}
            /> */}
            <MarkdownNavbar data={navList} />
          </div>
        </Col>
      </Row>
      <BackTop />
      <Footer/>
    </>
  )
}


const getArticle = async (params) => {
  const { data } = await $http.getarticle(params)
  return data
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query: { id } } = context
  const article = await getArticle({ id })
  return {
    props: {
      article
    }
  }
}

export default withRouter(Detail)
