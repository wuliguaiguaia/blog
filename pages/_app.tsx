import 'antd/dist/antd.css'
import '../styles/common.scss'
import '../styles/globals.scss'
import { AppProps } from 'next/app'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import LoadingBar, { loadingUtil } from '../components/Loadingbar'
import { BackTop } from 'antd'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Head from '../components/Head'
// import 'tailwindcss/tailwind.css'

React.useLayoutEffect = React.useEffect

const MyApp = function ({ Component, pageProps }: AppProps) {
  // 我们使用自定义应用程序（页面/ _app.js）为此示例订阅该事件，因为它不会在页面导航时卸载，但您可以订阅应用程序中的任何组件上的路由器事件。
  const Router = useRouter()
  const [loadingStatus, setLoadingStatus] = useState(-1) 
  useEffect(() => {
    /* 钩子事件 */
    Router.events.on('routeChangeStart', () => {
      setLoadingStatus(0)
      console.log('start')
    })
    
    Router.events.on('routeChangeComplete', () => {
      setTimeout(() => {
        setLoadingStatus(-1)
      }, 1000)
      console.log('end')
      setLoadingStatus(1)
    })
    /* 如果一个路由加载被取消(例如，通过连续快速点击两个链接)，routeChangeError将被触发 */
    // Router.events.on('routeChangeError', (...args) => {
    //   // console.log('x 路由跳转错误, 参数为', args)
    // })


    // Router.events.on('beforeHistoryChange', (...args) => {
    //   console.log('1 history 模式下路由发生变化, 参数为', args)
    // })
    // Router.events.on('hashChangeStart', (...args) => {
    //   console.log('3 hash 模式下路由开始变化, 参数为', args)
    // })
    // Router.events.on('hashChangeComplete', (...args) => {
    //   console.log('4 hash 模式下路由变化结束, 参数为', args)
    // })
    return () => {
      // Router.events.off('routeChangeStart', )
    }
  }, [Router.events])

  return <div>
    <Head title={'orange.com'} />
    <Header loadingStatus={loadingStatus}/>
    <LoadingBar status={loadingStatus}/>
    <Component {...pageProps} loadingStatus={loadingStatus} />
    <BackTop />
    <Footer/>
  </div>
}

export default MyApp
