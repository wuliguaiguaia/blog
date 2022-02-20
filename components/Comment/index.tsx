import { Avatar, Divider, Comment as AComment, Input, Button, message } from 'antd'
import styles from './index.module.scss'
import cns from 'classnames'
import { postComment } from 'common/api/utils'
import { IComment } from 'common/interface'
import CommentBox from 'components/CommentBox'

const Comment = () => {
  const callback = () => {
    message.success('发表成功')
  }
  const postMessage = (data: IComment) => {
    return postComment(data)
  }
  return <div className="card">
    <Divider>留言区</Divider>
    {/* 表情，图片 slot */}
    <CommentBox callback={callback}
      addMessage={postMessage}
      btnPosition="right"
      btnText="提交评论"
    />
    <div className={cns([styles.commentWrapper])}>
      <AComment
        actions={[<span key="comment-nested-reply-to">回复</span>]}
        author={<a>Han Solo</a>}
        avatar={<Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />}
        content={
          <p>
        We supply a series of design principles, practical patterns and high quality design
        resources (Sketch and Axure).
          </p>
        }
      >
        {/* {children} */}
      </AComment>

    </div>
   
  </div>
}
export default Comment