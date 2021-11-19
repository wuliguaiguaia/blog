import Head from 'next/head'
import { Col, Row, Breadcrumb, Divider } from 'antd'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Author from '../../components/Author'

import * as marked from 'marked'
import * as hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import MarkdownNavbar from 'markdown-navbar'
import 'markdown-navbar/dist/navbar.css'
import { withRouter, NextRouter } from 'next/router'
import Link from 'next/link'
interface WithRouterProps {
  router: NextRouter
}

interface IProps extends WithRouterProps { }


const Detail = (props: IProps) => {
  const { router } = props
  console.log(router)
  
  const renderer = new marked.Renderer()

  marked.setOptions({
    renderer: renderer,
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
      return hljs.highlightAuto(code).value
    }
  })

  const article = `
 
## 二级标题Chicken Chicken
 
Chicken Chicken Chicken Chicken Chicken.

* Chicken Chicken Chicken Chicken Chicken.
* Chicken Chicken Chicken Chicken Chicken.
* Chicken Chicken Chicken Chicken Chicken.


### 三级标题 Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken.


#### 四级标题 Chicken Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken Chicken.


## 二级标题Chicken Chicken

Chicken Chicken Chicken Chicken Chicken.

* Chicken Chicken Chicken Chicken Chicken.
* Chicken Chicken Chicken Chicken Chicken.
* Chicken Chicken Chicken Chicken Chicken.


### 三级标题 Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken.


#### 四级标题 Chicken Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken Chicken.

#### 四级标题 Chicken Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken Chicken.
### 三级标题 Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken.


#### 四级标题 Chicken Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken Chicken.

#### 四级标题 Chicken Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken Chicken.
### 三级标题 Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken.


#### 四级标题 Chicken Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken Chicken.

#### 四级标题 Chicken Chicken Chicken Chicken


Chicken Chicken Chicken Chicken Chicken Chicken.


`
 

  let html = marked.parse(article)
  return (
    <>
      <Head>
        <title>Detail</title>
      </Head>
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
            <div className="article-title">title</div>
            <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} ></div>
          </div>
          <div className="article-keys">
            <span>2019-06-28</span>
            <span>视频教程</span>
            <span>5498人</span>
          </div>
          <Divider>留言区</Divider>
        </Col>
        <Col className="main-right" xs={0} sm={0} md={7} lg={5} xl={9}>
          <Author />
          <MarkdownNavbar
            className="article-menu sticky"
            source={article}
            ordered={false}
            headingTopOffset={80}
            escapeHtml={false}
            declarative={true}
          />
        </Col>
      </Row>
      <Footer/>
    </>
  )
}

export default withRouter(Detail)

