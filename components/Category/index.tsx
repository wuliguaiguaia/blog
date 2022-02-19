import styles from './index.module.scss'
import { FunctionComponent} from 'react'
import { ICategory } from './../../common/interface'
import cns from 'classnames'
import Link from 'next/link'

interface IProps {
  data: ICategory[],
  curCategoryId?: number
}

const Category: FunctionComponent<IProps> = ({ data, curCategoryId}) => {
  return (
    <div className={cns(['position-sticky card', styles['list-wrapper']])}>
      <div className={cns(styles.header, 'align-center')}>
        <span className={styles.title}>Category</span>
        <span className={styles.line}></span>
      </div>
      <ul className="flex-col">
        {
          data.map(({ id, name, articlesLen }) => (
            <Link href={`/category/${id}`} key={id}>
              <a
                className={cns(
                  styles.listItem,
                  id === curCategoryId && styles.active,
                )}
              >{name} ({articlesLen})
              </a>
            </Link>
          ))
        }
      </ul>
    </div>
  )
}

export default Category