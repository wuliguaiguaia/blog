import { Col, Row, Breadcrumb, Divider } from 'antd'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Author from '../../components/Author'

import { marked } from 'marked'
import * as hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import MarkdownNavbar from 'markdown-navbar'
import 'markdown-navbar/dist/navbar.css'
import { withRouter, NextRouter } from 'next/router'
import Link from 'next/link'
import Head from '../../components/Head'
import styles from './index.module.scss'
import cns from 'classnames'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'

interface WithRouterProps {
  router: NextRouter
}

interface IArticle {
  id: number;
  title: string;
  content: string;
  keywords: string;
  createTime: string;
  viewCount: number;
}
interface IProps extends WithRouterProps {
  article: IArticle
}


const Detail = (props: IProps) => {
  const { router, article } = props
  console.log(router)
  
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
  let html = marked.parse(article.content)
  return (
    <>
      <Head title={article.title} />
      <Header/>
      <Row className="main" justify="center">
        <Col className="main-left" xs={24} sm={24} md={16} lg={18} xl={14}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/"><a >首页</a></Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <a href="">Application Center</a>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="article">
            <div className="article-title">{article.title}</div>
            <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} ></div>
          </div>
          <div className="article-keys">
            <span>{article.keywords}</span>
            <span>{article.createTime}</span>
            <span>{article.viewCount}</span>
          </div>
          <Divider>留言区</Divider>
        </Col>
        <Col className="main-right" xs={24} sm={24} md={7} lg={5} xl={5}>
          <Author />
          <MarkdownNavbar
            className={cns(styles.articleMenu, 'position-sticky')}
            source={article.content}
            ordered={false}
            headingTopOffset={80}
            declarative={true}
          />
        </Col>
      </Row>
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
