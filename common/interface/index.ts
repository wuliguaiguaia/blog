export interface ICategory {
  id: number;
  name: string;
  articlesLen: number;
}

export interface IArticle {
  id: number;
  title: string;
  content: string;
  createTime: string;
  updateTime: string;
  viewCount: number;
  categories: number[],
  messages?: number
  desc: string
}

export interface NavList {
  level: number;
  text: string;
  children?: NavList[]
}


export interface IUser { 
  username: string,
  website: string,
  email: string,
}
export interface IMessage extends IUser{
  id?: number
  content: string
  createTime?: string;
}

export interface IComment extends IMessage{
  id?: number,
  articleId?: number
  replyId?: number
  replyToReplyId?: number
  replyInfo?: IComment[]
}

export interface ICount { 
  articleLen: number
  messageLen: number
}