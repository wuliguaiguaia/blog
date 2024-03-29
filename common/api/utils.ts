import $http from '.'

/**
 * 获取分类
 */
export const getCategory = async () => {
  const response = await $http.getcategorylist({published: 1})
  const { data: { list } } = response
  return list
}

/**
 * 获取文章列表
 */
export const getArticleList = async (
  params: {
    page: number;
    prepage: number;
    categories: number[];
    type?: number | number[] | undefined
  },
  other = {}
) => {
  params = { ...params, ...other }
  const response = await $http.getarticlelist({ ...params, published: 1 })
  const { data: { list, total } } = response
  return [list, total]
}

/**
 * 模糊查询文章列表
 */
export const getArticleListFromSearch = async (params: { page: number; prepage: number; words: string | string[] | undefined }, other = {}) => {
  params = { ...params, ...other }
  const response = await $http.search({ ...params, published: 1 })
  const { data: { list, total } } = response
  return [list, total]
}

/**
 * 获取文章详情
 */
export const getArticle = async (params: { id: string | string[] | undefined }) => {
  const { data } = await $http.getarticle({ ...params, published: 1 })
  return data
}

/**
 * 获取评论
 */
export const getCommentList = async (articleId: number) => {
  const { data } = await $http.getcommentlist({ articleId })
  return data
}

