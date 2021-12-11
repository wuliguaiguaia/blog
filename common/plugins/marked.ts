import hljs from 'highlight.js'
import { marked } from 'marked'

const renderer = new marked.Renderer()
marked.setOptions({
  renderer: renderer,
  gfm: true,
  pedantic: false,
  sanitize: false,
  breaks: false,
  smartLists: true,
  smartypants: false,
  highlight: function (code: string) {
    return hljs.highlightAuto(code).value
  }
})

export default marked