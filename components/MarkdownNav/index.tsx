import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { NavList } from '../../pages/detail'
import styles from './index.module.scss'
import cns from 'classnames'
import { useRouter } from 'next/router'

interface IProps {
  data: NavList[],
  current: string
}

const MarkdownNavbar: FunctionComponent<IProps> = ({ data, current }) => {
  const titlesRef = useRef()
  const router = useRouter()
  const [active, setActive] = useState(current)
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
      // titlesRef.current.removeEventListener('click', handleClick)
      window.removeEventListener('hashchange', handleHashChange)
      router.events.off('hashChangeComplete', handleHashChange)
    }
  }, [router])

  useEffect(() => {
    setActive(current)
  }, [current])

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
          return <li key={text} className={styles['title-wrapper']}>
            <div className={styles.line}></div>
            <div
              className={cns('align-center', active === text && styles.active)}
              data-hash={text}
            >
              <div className={styles.circle}></div>
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