import { apiPrefix } from '../constants/request'

export const get = {
  getcategorylist: `${apiPrefix}/category/list`,
  getarticlelist: `${apiPrefix}/article/list`,
  getcommentlist: `${apiPrefix}/comment/list`,
  getarticle: `${apiPrefix}/article`,
  search: `${apiPrefix}/article/search`,
  getcount: `${apiPrefix}/article/count`
}

export const post = {
  postcomment: `${apiPrefix}/comment`,
  postmessage: `${apiPrefix}/message`,
}

export const remove = {}

export const put = {}

export const patch = {}

export const head = {}

export const options = {}

export const file = {}

export const ws = {}