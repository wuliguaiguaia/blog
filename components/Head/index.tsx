import Head from 'next/head'
import { FunctionComponent } from 'react'
interface IProps {
  title: string
  icon?: string
  mainfest?: string
}

const MyHead :FunctionComponent<IProps>= (props) => {
  const { title, icon, mainfest } = props
  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href={icon} />
      <link rel="manifest" href={mainfest} />
      <meta charSet="UTF-8" />
      <meta name="author" content="Alias" />
      <meta name="keywords" content="HTML, CSS, JavaScript, Node, Next, Nest" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description"content="Learn" />
    </Head>
  )
}

MyHead.defaultProps = {
  title: 'Home',
  icon: '/favicon.svg',
  mainfest: '/manifest.json'
}

export default MyHead