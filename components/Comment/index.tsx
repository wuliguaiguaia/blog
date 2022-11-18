import { Divider, message } from 'antd'
import { getCommentList } from 'common/api/utils'
import { IComment, IMessage } from 'common/interface'
import { FunctionComponent, useCallback, useEffect, useState } from 'react'
import CommentItem from './Item'
import CommentBox from 'components/CommentBox'
import cns from 'classnames'
import styles from './index.module.scss'
import $http from 'common/api'
interface IProps {
  id: number
}

const Comment: FunctionComponent<IProps> = ({ id }) => {
  const [list, setList] = useState<IComment[]>([])
  const [idMap, setIdMap] = useState<{ [id: string]: IComment }>({})
  const [userImgs, setUserImgs] = useState<{[str: string]: string}>({})
  const [showInput, setShowInput] = useState<IComment | null>()

  const fetchData = useCallback(async () => {
    const data = await getCommentList(id)
    setList(data)
    const users:Set<string> = new Set()
    const maps = data.reduce((res:IComment[], item:IComment) => {
      res[item.id!] = item
      users.add(item.username)
      if (item.replyInfo?.length) {
        item.replyInfo.forEach((_item: IComment) => {
          res[_item.id!] = _item
          users.add(_item.username)
        })
      }
      return res
    }, {})
    setIdMap(maps)
    setUserImgs(() => {
      const imgs: { [str: string]: string } = {}
      users.forEach((item) => {
        imgs[item] = `https://joeschmoe.io/api/v1/${item}`
      })
      return imgs
    })
  }, [id])

  const callback = () => {
    message.success('发表成功,正在审核中...')
    fetchData()
    setShowInput(null)
  }

  const postMessage = (data: IMessage) => {
    if (!showInput) {
      return $http.postcomment({
        ...data,
        articleId: id
      })
    }
    const { id: commitId, replyId } = showInput
    return $http.postcomment({
      ...data,
      articleId: id,
      replyId: replyId || commitId,
      replyToReplyId: commitId
    })
  }

  const handleFocus = () => {
    setShowInput(null)
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return <div className="card">
    <Divider>留言区</Divider>
    {/* 表情，图片 slot */}
    <CommentBox callback={callback}
      addMessage={postMessage}
      btnPosition="right"
      btnText="发表评论"
      handleFocus={handleFocus}
    />
    <div className={cns([styles.commentWrapper])}>
      {
        list.map((item) => 
          <CommentItem
            item={item}
            key={item.id}
            styles={styles}
            articleId={id}
            userImg={userImgs[item.username]}
            showInput={showInput?.id === item.id}
            setShowInput={setShowInput}
            callback={callback}
            addMessage={postMessage}
          >
            {
              item.replyInfo?.length ? 
                <div className={styles.secondWrapper}> 
                  { item.replyInfo.map((_item) => (
                    <CommentItem
                      item={_item}
                      key={_item.id}
                      styles={styles}
                      articleId={id}
                      userImg={userImgs[_item.username]}
                      replyItem={ _item.replyToReplyId !== item.id ? idMap[_item.replyToReplyId!]: undefined}
                      showInput={showInput?.id === _item.id}
                      setShowInput={setShowInput}
                      callback={callback}
                      addMessage={postMessage}
                    ></CommentItem> 
                  ))}
                </div>
                : null
            }
          </CommentItem>
        )
      }
    </div>
  </div>
}
export default Comment