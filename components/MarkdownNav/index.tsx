import { createRef, FunctionComponent, MouseEventHandler, useEffect } from 'react'
import styles from './index.module.scss'
import cns from 'classnames'
import { NavList } from 'common/interface'

interface IProps {
  data: NavList[],
  activeNav: string,
  setActiveNav: (arg: string) => void,
}

const MarkdownNav: FunctionComponent<IProps> = ({ data = [], activeNav, setActiveNav }) => {
  const titlesRef = createRef<HTMLDivElement>()
  const levels = data.map((item) => item.level)
  const maxLevel = Math.min(...levels)
  const handleClick: MouseEventHandler = (e) => {
    const target = e.target as HTMLElement
    const dataset = target.dataset
    if (!dataset) return
    const { hash } = dataset
    if (!hash) return
    window.location.hash = hash
    setActiveNav(hash)
    const el = document.getElementById(hash) as HTMLDivElement
    const headerHeight = 40
    window.scrollTo(0, el.offsetTop + headerHeight)
  }
  useEffect(() => {
    const { hash } = window.location
    if(!hash) return
    setActiveNav(decodeURIComponent(hash.slice(1)))
  }, [setActiveNav])

  return (
    <div ref={titlesRef} className={styles.wrapper} onClick={handleClick}>
      { data.length ?(
        <ul className={cns(styles.navbar)}> {
          data.map((item, index) => {
            const { level, text } = item
            return (
              <li
                key={index}
                className={cns([styles['title-wrapper'], activeNav === text && styles.active])}
              >
                <div className={cns([
                  styles[`title-${level - maxLevel + 1}`],
                  styles.title,
                  'text-ellipsis',
                ])}
                data-hash={text}
                >
                  {text}
                </div>
              </li>
            )
          })
        }</ul>)
        : <div className={styles.empty}>暂无目录</div>
      }
    </div>
  )
}

export default MarkdownNav