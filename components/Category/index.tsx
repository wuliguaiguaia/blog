import styles from './index.module.scss'
import { useRouter } from 'next/router'
import { FunctionComponent, useEffect, useState } from 'react'
import { ICategory } from './../../common/interface'
import cns from 'classnames'
import Link from 'next/link'

interface IProps {
  data: ICategory[],
}

const Category: FunctionComponent<IProps> = ({ data }) => {
  const router = useRouter()
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    console.log(123)
  }, [data, router])
  
  
  const handleClick = (id: number) => {
    setSelected([id])
  }

  return (
    <div className={cns(['position-sticky card', styles['list-wrapper']])}>
      <div className={cns(styles.header, 'align-center')}>
        <span className={styles.title}>Category</span>
        <span className={styles.line}></span>
      </div>
      <ul className={styles.list} >
        {
          data.map(({ id, name, articlesLen }) => (
            <li
              key={id}
              className={cns(
                styles.listItem,
                selected.includes(id) && styles.active,
              )}
              onClick={() => handleClick(id)}
            >
              <Link href={`/category/${id}`}><a>{name} ({articlesLen})</a></Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default Category