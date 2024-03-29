import { Col, Row, Breadcrumb, Divider } from 'antd'
import Author from '../../components/Author'
import { renderToString} from 'react-dom/server'
import MarkdownNav from '../../components/MarkdownNav'
import { withRouter, NextRouter } from 'next/router'
import Link from 'next/link'
import Head from '../../components/Head'
import styles from './index.module.scss'
import cns from 'classnames'
import { GetStaticProps, NextPage } from 'next'
import { IArticle, ICategory, NavList } from '../../common/interface'
import { throttle } from '../../common/utils/index'
import { createRef, useEffect, useState } from 'react'
import Comment from '../../components/Comment'
// import { EyeOutlined } from '@ant-design/icons'
import { Marked, renderer } from '../../common/utils/marked'
import { getArticle, getArticleList } from 'common/api/utils'
import { useRouter } from 'next/router'
import Mask from 'components/Mask'
import { useImgLoad } from 'common/hooks/useImgLoad'


const marked = Marked()
interface WithRouterProps {
  router: NextRouter
}

interface IProps extends WithRouterProps {
  article: IArticle,
}

const Article: NextPage<IProps> = (props) => {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('')
  const [navList, setNavList] = useState<NavList[]>([])
  const [html, setHtml] = useState('')
  const scrollEl = createRef<HTMLDivElement>()
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)

  const { article = {
    content: '', title: '', viewCount: 0, createTime: '', updateTime: '', categories: [], id: 0
  } } = props

  const { title, viewCount, createTime, updateTime, categories, id } = article
  const [content, setContent] = useState(article.content)
  const [imgLoaded] = useImgLoad(content)

  const [time, setTime] = useState('')
  const [time2, setTime2] = useState('')
  useEffect(() => {
    if (!isFirstRender) return
    if (createTime) {
      const temp = new Date(+createTime).toLocaleDateString()
      setTime(temp.replace(/(\d+)\/(\d+)\/(\d+)/, '$1 年 $2 月 $3 日'))
    }
    if (updateTime) {
      const temp = new Date(+updateTime).toLocaleDateString()
      setTime2(temp.replace(/(\d+)\/(\d+)\/(\d+)/, '$1/$2/$3'))
    }
    if (content) {
      // 删除图片的 height 属性
      // Safari 不支持 ?<=
      const contentChanged = content.replace(/<img .+(height="?\d+"?)[^>]+/g, (str, val) => {
        return str.replace(val, '')
      })
      setContent(contentChanged)
    }
  }, [createTime, updateTime, content, isFirstRender])

  /* 生成导航 */
  useEffect(() => {
    const list: NavList[]= []
    renderer.heading = (text: string, level: number) => {
      list.push({ text, level })
      setNavList(list)
      const markerContents = renderToString(<div id={text} className={cns('_artilce-title', 'md-title', `md-title-${level}`)}>{text}</div>)
      return markerContents
    }
    setHtml(marked.parse(content))
  }, [id, content])


  /* 初次监听 */
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

  // 点击事件：图片放大、链接跳转
  const [imgVisible, setImgVisible] = useState(false)
  const [imgBigSrc, seImgBigSrc] = useState('')
  useEffect(() => {
    const clickFn = (e: Event) => {
      const target = e.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      let data: string | null
      switch (tagName) {
      case 'img':
        data = target.getAttribute('src')
        if (!data) break 
        setImgVisible(true)
        seImgBigSrc(data)
        break
      case 'a':
        e.preventDefault()
        data = target.getAttribute('href')
        if (!data) break
        window.open(data)
        break
      }
    }
    const el = document.getElementsByClassName('md-wrapper')[0]
    el.addEventListener('click', clickFn)
    return () => {
      el.removeEventListener('click', clickFn)
    }
  }, [])

  if (router.isFallback) {
    return <div>Loading...</div>
  }
  return (
    <>
      <Head title={title} />
      <Row className={cns(['main', styles.wrapper])} justify="center" ref={scrollEl}>
        <Col className="main-left" xs={23} sm={23} md={15} lg={16} xl={13} xxl={11}>
          <Breadcrumb className="card">
            <Breadcrumb.Item>
              <Link href="/" passHref><a className={styles.link}>首页</a></Link>
            </Breadcrumb.Item>
            {
              categories.map((item) => {
                const { id, name } = item as unknown as ICategory
                return (<Breadcrumb.Item key={id}>
                  <Link href={`/category/${id}`} passHref><a className={styles.link}>{name}</a></Link>
                </Breadcrumb.Item>)
              })
            }
          </Breadcrumb>
          <div className={cns(styles.article ,'card')}>
            <div className={styles['article-title']}>{title}</div>
            <div className={styles['article-keys']}>
              <span className={styles['article-time']}>{time}</span>
              {/* <span><EyeOutlined /> {viewCount || 1230}</span> */}
            </div>
            <div className="article-keys">
              <span>{/* {article.keywords} */}</span>
            </div>
            <div className={cns([styles['article-content'],'md-wrapper'])} dangerouslySetInnerHTML={{ __html: html }} ></div>
            {/* <div className="article-keys">
              <span>{article.keywords}</span>
              <span>{article.viewCount}</span>
            </div> */}
            <div className={styles['divide-line']}></div>
            <div className={styles['update-time']}>最后修改于 <span>{time2}</span></div>
          </div>
          <Comment id={id}></Comment>
        </Col>
        <Col className="main-right" xs={0} sm={0} md={7} lg={6} xl={5} xxl={4}>
          <Author />
          <div className={cns(styles['article-menu'], 'position-sticky', 'card')}>
            <Divider orientation="left">Directory</Divider>
            {imgLoaded ? <MarkdownNav data={navList} activeNav={activeNav} setActiveNav={setActiveNav} /> : null}
          </div>
        </Col>
      </Row>
      <Mask
        visible={imgVisible}
        setVisible={setImgVisible}
        content={
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgBigSrc}
            alt="放大图片"
            style={{ maxWidth: '90%', maxHeight: '80%' }}
          />
        }
      />
    </>
  )
}

/* 预加载首页列表前20个 */
export async function getStaticPaths() { 
  const [articles] = await getArticleList({
    page: 1,
    prepage: 20,
    categories: [],
  })
  const paths = articles.map((item: IArticle) => ({ params: { id: item.id + '' } }))
  return {
    paths,
    fallback: true
  }
}
export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id
  const article = await getArticle({ id })
  console.log(id, '数据拉取')
  if (!article) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      article,
    },
  }
}

export default withRouter(Article)
