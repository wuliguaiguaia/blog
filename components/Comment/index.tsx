import { Avatar, Divider, Comment as AComment, Input, Button } from 'antd'
import styles from './index.module.scss'
import cns from 'classnames'
const { TextArea } = Input

const Comment = () => {
  return <div className="card">
    <Divider>留言区</Divider>
    <TextArea
      className={cns([styles.input])}
      placeholder="输入评论（Enter换行，⌘ / Ctrl + Enter发送）"
      autoSize={{ minRows: 2, maxRows: 6 }}
    />
    {/* 姓名，个人网址 */}
    <div className={cns(['jusBetween-alignCenter'])}>
      <div>
        <span>表情</span>
        <span>图片</span>
      </div>
      <Button type="primary" loading={false}>发表评论</Button>
    </div>
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