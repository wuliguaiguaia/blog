import { createStore } from 'redux'
import { UpdateCurCategory } from './actionTypes'

const initialState = {
  curCategory: 'null',
}

const reducer = (state: any, action: any) => {
  const { type, data } = action
  switch (type) {
  case UpdateCurCategory:
    return { ...state, curCategory: data }
  default:
    return state
  }
}

const store = createStore(reducer, initialState)

export default store