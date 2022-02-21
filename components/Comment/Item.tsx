import { Avatar, Comment, message, Tooltip } from 'antd'
import { IComment, IMessage, IUser } from 'common/interface'
import moment from 'moment'
import { FunctionComponent, useState, } from 'react'
import cns from 'classnames'
import CommentBox from 'components/CommentBox'

interface IProps {
  item: IComment,
  replyItem?: IComment,
  children?: any,
  userImg: string,
  styles: { [k: string]: any }
  showInput: boolean,
  articleId?: number,
  setShowInput: (data: any) => void,
  callback: () => void,
  addMessage: (data: IMessage) => void
}
const CommentItem: FunctionComponent<IProps> = ({
  item,
  children,
  replyItem,
  styles,
  userImg,
  setShowInput,
  showInput,
  callback,
  addMessage,
}) => {
  const [replyId, setReplyId] = useState<number>(0)
  const handleClickReply = () => {
    const curId = replyId === item.id ? 0 : item.id as number
    setShowInput(curId ? item : null)
    setReplyId(curId)
  }
 
  const renderUsername = (user: IUser) => {
    const { username, website } = user
    return <span className={styles.username}>
      {
        website ? 
          <a href={website} target="_blank" rel="noreferrer">{username}</a> : {username}
      }
    </span>
  }

  return  <Comment
    key={item.id}
    className={cns([replyItem && styles.isReply])}
    actions={[
      <span key="comment-nested-reply-to"
        className={cns([styles.replyBtn, showInput && styles.replyBtnShow])}
        onClick={handleClickReply}>{showInput ? '取消回复' : '回复'}
      </span>
    ]}
    author={
      <>
        {renderUsername(item)}
        {replyItem && <><span className={styles.replyText}>回复</span>{renderUsername(replyItem)}</>}
      </>
    }
    avatar={<Avatar className={styles.avatar} src={userImg} alt="Han Solo" />}
    content={
      <>
        <div>{item.content}</div>
        {
          replyItem ? <div className={styles.replyContent}>
            “{replyItem.content}”
          </div> : null
        }
      </>
    }
    datetime={<span>{item.createTime?.slice(0, -5).replace('T', ' ')}</span>}
  >
    {
      showInput ?
        <div className={styles.commentBox}>
          <CommentBox
            addMessage={addMessage}
            callback={callback}
            btnPosition='right'
            btnText='发布'
          />
        </div>
        : null
    }
    {children}
  </Comment>
}

export default CommentItem