import styles from './index.module.scss'
import { List, Popover, Radio, RadioChangeEvent } from 'antd'
import { useRouter } from 'next/router'
import { FunctionComponent, useEffect, useState } from 'react'
import { ICategory } from './../../common/interface'
import cns from 'classnames'
import {QuestionCircleOutlined, CheckOutlined} from '@ant-design/icons'
import usePrevious from '../../common/hooks/usePrevious'
interface IProps {
  data: ICategory[],
}

const Category: FunctionComponent<IProps> = ({ data }) => {
  const router = useRouter()
  const [mode, setMode] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const prevSelected = usePrevious(selected)
  // 初始化
  useEffect(() => {
    const { query: { categories: _curCategory, mode: _curMode } } = router
    const curMode = Number(_curMode)
    const curCategory = String(_curCategory)
    if (!_curCategory) {
      setSelected([])
      setMode([0, 1, 2].includes(curMode) ? curMode : 0)
      return
    }
    const ids = data.map(item => item.id) 
    const _data = String(decodeURIComponent(curCategory))
      .split(',')
      .map(item => +item)
      .filter(item => ids.includes(item)) as []
    if (curMode === 2 && _data.length > 2) {
      setMode(1)
    } else {
      setMode([0, 1, 2].includes(curMode) && curMode || data.length > 1 ? 1 : 0)
    }
    setSelected(_data)
  }, [data, router])
  
  
  const handleClick = (id: number) => {
    let _selected = JSON.parse(JSON.stringify(selected))
    const index = _selected.indexOf(id)
    switch (mode) {
    case 0:
      _selected = [id]
      break
    case 1:
      if (index === -1) {
        _selected.push(id)
      } else {
        _selected.splice(index,1)
      }
      break
    case 2:
      if (index === -1) {
        if (_selected.length < 2) {
          _selected.push(id)
        }
      } else {
        _selected.splice(index,1)
      }
      break
    }
    const changed = JSON.stringify(prevSelected) !== JSON.stringify(_selected)
    if (!changed) return 
    setSelected(_selected)
    router.push({
      pathname: '/',
      query: {
        categories: encodeURIComponent(_selected),
        mode
      }
    })
  }


  const handleModeChange = (e: RadioChangeEvent) => {
    const value = Number(e.target.value)
    setSelected([])
    router.push({
      pathname: '/',
      query: {
        categories: '',
        mode: value
      }
    })
    setMode(value)
  }
 

  return (
    <div className={cns(['position-sticky card', styles['list-wrapper']])}>
      <div className={cns(styles.header, 'align-center')}>
        <span className={styles.title}>Category</span>
        <span className={styles.line}></span>
      </div>
      <div className={cns(styles.filter, 'align-center')}>
        <Popover
          title={<div className={styles.popoverTitle}>筛选模式</div>}
          content={<div className={styles.popoverContent}>
            <div>单选 ：就是选择其中一个啦</div>
            <div>多选 ||：包含所选分类的任意一个</div>
            <div>多选 &&：必须同时包含所选分类（一篇文章最多两种分类:D）</div>
          </div>}
          placement="bottom">
          <span className={styles.filterTitle}>筛选模式</span>
          <QuestionCircleOutlined className={styles.icon}/>
        </Popover>
        <Radio.Group
          className={styles.buttonGroup}
          value={mode}
          onChange={handleModeChange}
        >
          <Radio.Button className={styles.button} value={0}>单选</Radio.Button>
          <Radio.Button className={styles.button} value={1}>多选 ||</Radio.Button>
          <Radio.Button className={styles.button} value={2}>多选 &&</Radio.Button>
        </Radio.Group>
      </div>
      <List
        className={styles.list}
        dataSource={data}
        loading={data.length === 0}
        renderItem={item => (
          <List.Item
            className={cns(
              styles.listItem,
              selected.includes(item.id) && styles.active,
              !selected.includes(item.id) && mode === 2 && selected.length === 2 && styles.disabled
            )}
            onClick={() => handleClick(item.id)}
          >
            <span>{item.name} ({item.articlesLen})</span>
            {
              [1, 2].includes(mode) ?
                selected.includes(item.id) && <CheckOutlined className={styles.checkIcon} />
                : null
            }
          </List.Item>
        )}
      /> 
    </div>
  )
}

export default Category