import Head from 'next/head'
import { Col, Row, List } from 'antd'
import Header from '../components/Header'
import { useState } from 'react'
import Author from '../components/Author'
import Footer from '../components/Footer'
import { useRouter } from 'next/dist/client/router'
// import axios from 'axios'    
// import dynamic from 'next/dynamic'
// const Eeader = dynamic(import('../components/Header'))
function Home(props) {      
  console.log( props)                   
         
  const [mylist, setMylist] = useState (
    [
      { title : '第一', context: 'desc', id: 1 },
      { title: '第而', context: 'desc', id: 2 },
    ]
  )
  const Router = useRouter()
  const routeChange = (id: number) => {
    Router.push({
      pathname: '/detail',
      query: { id }
    } )
  }
  return (
    <>
      <Head>
        <title>Home</title> 
      </Head>
      <Header/>
      <Row className="main" justify="center">
        <Col className="main-left" xs={24} sm={24} md={16} lg={18} xl={14}>
          <List
            header={<div>最新日志</div>}
            dataSource={mylist}
            itemLayout="vertical"
            renderItem={item => (
              <List.Item onClick={() => { routeChange(item.id)}}>
                <div className="list-title">{item.title}</div>
                <div className="list-context">{item.context}</div>
                <div className="list-keys">
                  <span>2019-06-28</span>
                </div>
              </List.Item>
            )}
          />
        </Col>
        <Col className="main-right" xs={24} sm={24} md={7} lg={5} xl={5}>
          <Author/>
        </Col>
      </Row>
      <Footer/>
    </>
  )
}

Home.getInitialProps = async () => {
  // const getData = await axios('https://www.easy-mock.com/mock/5cfcce489dc7c36bd6da2c99/xiaojiejie/getList')
  // const data = getData()
  // console.log(data);
  return 'fsdfsdfsfsfsdfsdf'      
}

export default Home