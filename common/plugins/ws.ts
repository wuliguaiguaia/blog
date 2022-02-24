import { isBrowser } from 'common/utils'
console.log('dddddd  ws')

let ws:any = null
if (isBrowser) {
  ws = new WebSocket('ws://localhost:3002/blog-front')

  ws.onopen = function (evt: any) {
    console.log('Connection open ...', evt)
  }

  ws.onmessage = function (evt: { data: any }) {
    console.log(`Received Message: ${evt.data}`)
  }

  ws.onclose = function (evt: any) {
    console.log('Connection closed.')
  }

  // readyState 属性返回实例对象的当前状态，共有四种。
  switch (ws.readyState) {
  case WebSocket.CONNECTING: // 值为0，表示正在连接。
    break
  case WebSocket.OPEN: // 值为1，表示连接成功，可以通信了。
    break
  case WebSocket.CLOSING: // 值为2，表示连接正在关闭。
    break
  case WebSocket.CLOSED: // 值为3，表示连接已经关闭，或者打开连接失败。
    break
  default:
  // this never happens
    break
  }
}

export interface WsData {
  type: 'message' | 'comment',
  id: number
}
export const wsSend = (data:WsData) => {
  ws?.send(JSON.stringify({
    event: 'newComment',
    data: {
      whois: 'blog-front', ...data
    }
  }))
}