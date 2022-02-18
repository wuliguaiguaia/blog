import { Col, Row, Breadcrumb, Divider } from 'antd'
import Author from '../../components/Author'
import { renderToString} from 'react-dom/server'
import MarkdownNav from '../../components/MarkdownNav'
import { withRouter, NextRouter } from 'next/router'
import Link from 'next/link'
import Head from '../../components/Head'
import styles from './index.module.scss'
import cns from 'classnames'
import { GetServerSideProps, NextPage } from 'next'
import $http from '../../common/api'
import { IArticle, NavList } from '../../common/interface'
import { throttle } from '../../common/utils/index'
import { createRef, useEffect, useState } from 'react'
import Comment from '../../components/Comment'
import { EyeOutlined } from '@ant-design/icons'
import { Marked, renderer } from '../../common/utils/marked'

const marked = Marked()

interface WithRouterProps {
  router: NextRouter
}

interface IProps extends WithRouterProps {
  article: IArticle,
}

const Detail:NextPage<IProps> = (props) => {
  const {
    article: { content, title, viewCount, updateTime, categories }
  } = props
  const category = categories?.[0]
  const [activeNav, setActiveNav] = useState('')
  const [navList, setNavList] = useState<NavList[]>([])
  const [html, setHtml] = useState('')
  const scrollEl= createRef<HTMLDivElement>()

  /* 生成导航 */
  useEffect(() => {
    const list: NavList[]= []
    renderer.heading = (text: string, level: number) => {
      list.push({ text, level })
      setNavList(list)
      const markerContents = renderToString(<div id={text} className={cns('_artilce-title', 'md-title', `md-title-${level}`)}><a href={`#${text}`}>{text}</a></div>)
      return markerContents
    }
    setHtml(marked.parse(content))
  }, [content])


  /* 初次监听 */
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)
  useEffect(() => {
    if (!isFirstRender) return
    if (!scrollEl?.current) return
    const hash = decodeURIComponent(window.location.hash).slice(1)
    if (!hash) return
    const target = document.getElementById(hash)
    if (!target) return
    const wrapperTop = scrollEl.current?.offsetTop || 0
    window.scrollTo(0, target.offsetTop + wrapperTop)
    setActiveNav(hash)
    setIsFirstRender(false)
  }, [isFirstRender, scrollEl])

  /* 滚动监听 */
  useEffect(() => {
    if (!scrollEl.current) return
    const titles = scrollEl.current.getElementsByClassName('_artilce-title') as  HTMLCollectionOf<HTMLElement> 
    if (titles.length === 0) return
    const wrapperTop = scrollEl.current.offsetTop
    const offsetArr: number[] = []
    Array.from(titles).forEach(el => {
      offsetArr.push(el.offsetTop + wrapperTop)
    })
    const handleScroll = () => {
      const top = window.scrollY
      let curIndex = 0
      offsetArr.forEach((item, index) => {
        if (top >= item) {
          curIndex = index
        }
      })
      setActiveNav(titles[curIndex].innerText)
    }
    window.addEventListener('wheel', throttle(handleScroll, 0))
  }, [scrollEl])

  return (
    <>
      <Head title={title} />
      <Row className="main" justify="center" ref={scrollEl}>
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
            <div className={styles['article-title']}>{title}</div>
            <div className={styles['article-keys']}>
              <span className={styles['article-time']}>{updateTime.slice(0, 10).replace('-', ' 年 ').replace('-', ' 月 ') + ' 日 '}</span>
              <span><EyeOutlined /> {viewCount || 1230}</span>
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
            <MarkdownNav data={navList} activeNav={activeNav} setActiveNav={setActiveNav}/>
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
// export async function getStaticPaths() { }
// export const getStaticProps: GetStaticProps = async () => {}

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
