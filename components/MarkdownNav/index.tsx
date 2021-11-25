import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { NavList } from '../../pages/detail'
import styles from './index.module.scss'
import cns from 'classnames'
import { useRouter } from 'next/router'
import { route } from 'next/dist/server/router'

interface IProps {
  data: NavList[]
}

const MarkdownNavbar: FunctionComponent<IProps> = ({ data }) => {
  const titlesRef = useRef()
  const router = useRouter()
  const [active, setActive] = useState('')
  useEffect(() => {
    const handleClick = (e) => {
      const dataset = e.target.dataset
      if (!dataset) return
      const {hash} = dataset
      router.push({
        pathname: '/detail',
        query: {
          id: router.query.id
        },
        hash: `${hash}`
      })
      setActive(hash)
      // if (!matches) return
      // const hash = e.target.
    }
    const handleHashChange = () => {
      const hash = decodeURIComponent(location.hash)
      const target = document.getElementById(hash)
      if (!target) return
      setActive(hash.slice(1))
      
    }
    handleHashChange()

    titlesRef.current.addEventListener('click', handleClick)
    window.addEventListener('hashchange', handleHashChange)
    router.events.on('hashChangeComplete', handleHashChange)
    return () => {
      titlesRef.current.removeEventListener('click', handleClick)
      window.removeEventListener('hashchange', handleHashChange)
      router.events.off('hashChangeComplete', handleHashChange)
    }
  }, [router])
  return <div ref={titlesRef}>
    <ul className={cns(styles.navbar)}>
      {
        data.map(item => {
          const { level, text, children } = item
          const childrenDOM = children.map(subItem => {
            const { level: subLevel, text: subText } = subItem
            return <li
              key={subText}
              className={cns(styles[`title-${subLevel}`], 'align-center', active === subText && styles.active)}
              data-hash={subText}
            >
              <span className={cns(styles['icon-title'])}></span>
              <div className={cns(styles.title, 'text-ellipsis')}>{subText}</div>
            </li>
          })
          return <li key={text}>
            <div
              className={cns('align-center', active === text && styles.active)}
              data-hash={text}
            >
              <a><span className={cns(styles['icon-title'])}></span></a>
              <div className={cns(styles[`title-${level}`], styles.title, 'text-ellipsis')}>{text}</div>
            </div>
            <ul>
              {childrenDOM}
            </ul>
          </li>
        })
      }
    </ul>
  </div>
}

export default MarkdownNavbar