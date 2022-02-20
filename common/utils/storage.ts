export const localStorage = {
  set(key: string, value: any) { 
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  get(key: string) {
    const value = window.localStorage.getItem(key)
    if (!value) return null
    return JSON.parse(value)
  },
  remove(key: string) {
    window.localStorage.removeItem(key)
  },
}

export const sessionStorage = {}