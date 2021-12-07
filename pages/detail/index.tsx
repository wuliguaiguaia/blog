import { Col, Row, Breadcrumb, Divider } from 'antd'
import Author from '../../components/Author'
import { renderToString} from 'react-dom/server'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
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
import { useEffect, useState } from 'react'
import Comment from '../../components/Comment'
import { EyeOutlined } from '@ant-design/icons'

export interface NavList {
  level: number;
  text: string;
  children: NavList[]
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
  /* 滚动监听 */
  useEffect(() => {
    const wrapper = document.getElementById('_article-content')
    const content = wrapper?.querySelectorAll('[class*="detail_title-"]') || []
    const headerHeight = 50
    const offsetArr = []
    const wrapperTop = wrapper?.offsetTop
    content.forEach(el => {
      offsetArr.push(el.offsetTop + wrapperTop)
    })
    const handleScroll = () => {
      const top = window.scrollY
      let curIndex = 0
      offsetArr.forEach((item, index) => {
        if (top + headerHeight >= item) {
          curIndex = index
        }
      })
      setActiveCatelog(content[curIndex].innerText)
    }
    window.addEventListener('scroll', throttle(handleScroll, 100))
  }, [])
  

  const navList: NavList[]= []
  /* markdown 各级标题样式自定义 */
  renderer.heading = (text, level) => {
    if (level === 2) {
      navList.push({ text, level, children: [] })
    } else {
      let last = navList[navList.length - 1]
      last.children.push({ text, level, children: [] })
    }
    const markerContents = renderToString(<div className={cns(styles[`title-${level}`], styles.title, '_artilce-title')}><a id={`#${text}`} href={`/detail?id=${router.query.id}#${text}`} >{text}</a></div>)
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
          <div className={cns(styles.article ,'card')}>
            <div className={styles['article-title']}>{article.title}</div>
            <div className={styles['article-keys']}>
              <span className={styles['article-time']}>{getDate(article.updateTime, DateType.text)}</span>
              <span><EyeOutlined /> {article.viewCount || 1230}</span>
            </div>
            <div className="article-keys">
              <span>{/* {article.keywords} */}</span>
            </div>
            <div className="article-content" id="_article-content" dangerouslySetInnerHTML={{ __html: html }} ></div>
            {/* <div className="article-keys">
              <span>{article.keywords}</span>
              <span>{article.viewCount}</span>
            </div> */}
          </div>
          <Comment></Comment>
        </Col>
        <Col className="main-right" xs={0} sm={0} md={7} lg={6} xl={5} xxl={4}>
          <Author />
          <div className={cns(styles['article-menu'], 'position-sticky', 'card')}>
            <Divider orientation="left">Directory</Divider>
            <MarkdownNavbar data={navList} current={activeCatelog}/>
          </div>
        </Col>
      </Row>
    </>
  )
}


const getArticle = async (params) => {
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
