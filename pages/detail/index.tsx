import { Col, Row, Breadcrumb, Divider } from 'antd'
import Author from '../../components/Author'
import { renderToString} from 'react-dom/server'
import { marked } from 'marked'
import hljs from 'highlight.js'
import MarkdownNavbar from './../../components/MarkdownNav'
import { withRouter, NextRouter } from 'next/router'
import Link from 'next/link'
import Head from '../../components/Head'
import styles from './index.module.scss'
import cns from 'classnames'
import { GetServerSideProps } from 'next'
import $http from '../../common/api'
import { IArticle } from './../../common/interface'
import { DateType, getDate, throttle } from '../../common/utils/index'
import { createRef, useEffect, useState } from 'react'
import Comment from '../../components/Comment'
import { EyeOutlined } from '@ant-design/icons'

export interface NavList {
  level: number;
  text: string;
  children?: NavList[]
}

interface WithRouterProps {
  router: NextRouter
}

interface IProps extends WithRouterProps {
  article: IArticle,
}


const Detail = (props: IProps) => {
  const { router, article } = props
  const category = article.categories?.[0]
  const [activeCatelog, setActiveCatelog] = useState('')
  const renderer = new marked.Renderer()
  const articleContent= createRef<HTMLDivElement>()

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
    navList.push({ text, level })
    const markerContents = renderToString(<div id={text} className={cns('_artilce-title', 'md-title', `md-title-${level}`)}><a href={`#${text}`} >{text}</a></div>)
    return markerContents
  }
  const [html, setHtml] = useState('')
  useEffect(() => {
    if (article.content) {
      setHtml(marked.parse(article.content))
    }
  }, [article.content])

  /* 滚动监听 */
  useEffect(() => {
    if (!articleContent.current) return
    const wrapperTop = articleContent.current?.offsetTop
    const titles = articleContent.current.getElementsByClassName('_artilce-title') as  HTMLCollectionOf<HTMLElement>
    const headerPadding = 10
    const offsetArr:number[] = []
    Array.from(titles || []).forEach(el => {
      offsetArr.push(el.offsetTop + headerPadding + wrapperTop)
    })
    const handleScroll = () => {
      const top = Math.ceil(window.scrollY)
      let curIndex = -1
      offsetArr.forEach((item, index) => {
        if (top >= item) {
          curIndex = index
        }
      })
      if (curIndex > -1 && titles[curIndex]?.innerText) {
        setActiveCatelog(titles[curIndex].innerText)
      }
    }
    window.addEventListener('wheel', throttle(handleScroll, 0))
    return () => {
      window.removeEventListener('wheel', throttle(handleScroll, 0))
    }
  }, [articleContent])

  useEffect(() => {
    if (!articleContent?.current) return
    const hashchange = () => {
      const hash = decodeURIComponent(window.location.hash).slice(1)
      if(!hash) return
      const target = document.getElementById(hash)
      if (!target) return
      const headerHeight = 46
      const headerPadding = 10
      const wrapperTop = articleContent.current?.offsetTop || 0
      window.scrollTo(0, target.offsetTop + wrapperTop + headerHeight - headerPadding)
      setActiveCatelog(hash)
    }
    // hashchange()
    window.addEventListener('hashchange', hashchange)
    return () => {
      window.removeEventListener('hashchange', hashchange)
    }
  }, [articleContent])

  return (
    <>
      <Head title={article.title} />
      <Row className="main" justify="center">
        <Col className="main-left" xs={23} sm={23} md={15} lg={16} xl={13} xxl={11}>
          <Breadcrumb className="card">
            <Breadcrumb.Item>
              <Link href="/" passHref><a >首页</a></Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={`/?category=${category.id}`} passHref>{category.name}</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className={cns(styles.article ,'card')} ref={articleContent}>
            <div className={styles['article-title']}>{article.title}</div>
            <div className={styles['article-keys']}>
              <span className={styles['article-time']}>{getDate(article.updateTime, DateType.text)}</span>
              <span><EyeOutlined /> {article.viewCount || 1230}</span>
            </div>
            <div className="article-keys">
              <span>{/* {article.keywords} */}</span>
            </div>
            <div className="article-content md-wrapper" dangerouslySetInnerHTML={{ __html: html }} ></div>
            {/* <div className="article-keys">
              <span>{article.keywords}</span>
              <span>{article.viewCount}</span>
            </div> */}
          </div>
          <Comment></Comment>
        </Col>
        <Col className="main-right" xs={0} sm={0} md={7} lg={6} xl={5} xxl={4}>
          <Author articlesLength={0} />
          <div className={cns(styles['article-menu'], 'position-sticky', 'card')}>
            <Divider orientation="left">Directory</Divider>
            <MarkdownNavbar data={navList} activeCatelog={activeCatelog} setActiveCatelog={setActiveCatelog}/>
          </div>
        </Col>
      </Row>
    </>
  )
}

const getArticle = async (params: { id: string | string[] | undefined }) => {
  const { data } = await $http.getarticle(params)
  return data
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // let loadingStatus  = 0
  const { query: { id } } = context
  const article = await getArticle({ id })
  setTimeout(() => {
    // loadingStatus = 1
  }, 2000)
  return {
    props: {
      article,
      // loadingStatus
    }
  }
}

export default withRouter(Detail)
