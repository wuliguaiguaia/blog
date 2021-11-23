import styles from './index.module.scss'
import { List, Divider } from 'antd'
import { useRouter } from 'next/router'
import { FunctionComponent } from 'react'
import { ICategory } from '../../pages/home'
import cns from 'classnames'

interface IProps {
  data: ICategory[],
  current: number
}

const Category: FunctionComponent<IProps> = ({ data, current }) => {
  const router = useRouter()
  const handleClick = (id: number) => {
    router.push({
      pathname: '/',
      query: {
        category: id
      }
    })
  }
  return (
    <div className={cns(['position-sticky card', styles['list-wrapper']])}>
      <Divider orientation="left">Category</Divider>
      <List
        className={styles.list}
        dataSource={data}
        loading={data.length === 0}
        renderItem={item => (
          <List.Item
            className={cns(current === +item.id && styles.active)}
            onClick={() => handleClick(item.id)}
          >{item.name} ({item.articlesLen})</List.Item>
        )}
      />
    </div>
  )
}

export default Category