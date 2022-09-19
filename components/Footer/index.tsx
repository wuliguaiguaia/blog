import styles from './index.module.scss'

export default function Footer() {
  return (
    <div className={styles.footer}>
      <div>
        <span>©哇唧唧哇制作啊哈哈哈快乐集团 </span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">陕ICP备2022000475号-1</a>
      </div>
    </div>
  )
}
