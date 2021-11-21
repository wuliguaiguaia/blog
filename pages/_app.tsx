import 'antd/dist/antd.css'
import '../styles/common.scss'
import '../styles/globals.scss'
import { AppProps } from 'next/app'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
// import 'tailwindcss/tailwind.css'

React.useLayoutEffect = React.useEffect

const MyApp = function ({ Component, pageProps }: AppProps) {
  // 我们使用自定义应用程序（页面/ _app.js）为此示例订阅该事件，因为它不会在页面导航时卸载，但您可以订阅应用程序中的任何组件上的路由器事件。
  const Router = useRouter()
  useEffect(() => {
    /* 钩子事件 */
    // Router.events.on('routeChangeStart', (...args) => {
    //   console.log('0 路由开始变化, 参数为', args)
    // })
    // Router.events.on('beforeHistoryChange', (...args) => {
    //   console.log('1 history 模式下路由发生变化, 参数为', args)
    // })
    // Router.events.on('routeChangeComplete', (...args) => {
    //   console.log('2 路由变化结束, 参数为', args)
    // })
    // /* 如果一个路由加载被取消(例如，通过连续快速点击两个链接)，routeChangeError将被触发 */
    // Router.events.on('routeChangeError', (...args) => {
    //   console.log('x 路由跳转错误, 参数为', args)
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

  return <Component {...pageProps} />
}

export default MyApp
