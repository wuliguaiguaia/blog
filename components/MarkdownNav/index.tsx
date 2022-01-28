import { createRef, FunctionComponent, MouseEventHandler, useEffect } from 'react'
import { NavList } from '../../pages/detail'
import styles from './index.module.scss'
import cns from 'classnames'

interface IProps {
  data: NavList[],
  activeCatelog: string,
  setActiveCatelog: (arg: string) => void,
}

const MarkdownNavbar: FunctionComponent<IProps> = ({ data, activeCatelog, setActiveCatelog }) => {
  const titlesRef = createRef<HTMLDivElement>()
  useEffect(() => {
    if(!titlesRef.current) return
    const handleClick: MouseEventHandler = (e) => {
      const dataset = e.target.dataset
      if (!dataset) return
      const { hash } = dataset
      if (!hash) return
      window.location.hash = hash
      setActiveCatelog(hash)
    }
    titlesRef.current.addEventListener('click', handleClick)
  }, [setActiveCatelog, titlesRef])

  useEffect(() => {
    const { hash } = window.location
    if(!hash) return
    setActiveCatelog(decodeURIComponent(hash.slice(1)))
  }, [setActiveCatelog])

  return <div ref={titlesRef} className={styles.wrapper}>
    <ul className={cns(styles.navbar)}>
      {
        data.map((item, index) => {
          const {level, text} = item
          return (
            <li
              key={index}
              className={cns([styles['title-wrapper'], activeCatelog === text && styles.active])}
            >
              <div className={cns([
                styles[`title-${level}`],
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
      }
    </ul>
  </div>
}

export default MarkdownNavbar