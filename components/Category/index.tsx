import styles from './index.module.scss'
import { List, Divider } from 'antd'
import { useRouter } from 'next/router'
import { FunctionComponent } from 'react'
import { ICategory } from '../../pages/home'


interface IProps {
  data: ICategory[]
}

const Category: FunctionComponent<IProps> = ({ data }) => {
  console.log('-data-', data)
  
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
    <div className="position-sticky">
      <Divider orientation="left">Category</Divider>
      <List
        className={styles.list}
        dataSource={data}
        loading={data.length === 0}
        renderItem={item => (
          <List.Item
            onClick={() => handleClick(item.id)}
          >{item.name}</List.Item>
        )}
      />
    </div>
  )
}

export default Category