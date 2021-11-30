export interface ICategory {
  id: number;
  name: string;
  articlesLen: number;
}

export interface IArticle {
  id: number;
  title: string;
  content: string;
  keywords: string;
  createTime: string;
  viewCount: number;
  categories: ICategory[]
}