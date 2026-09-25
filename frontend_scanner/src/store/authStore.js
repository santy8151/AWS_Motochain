import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || '{}'),
  
  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ isAuthenticated: true, token, user })
  },
  
  register: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ isAuthenticated: true, token, user })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ isAuthenticated: false, token: null, user: {} })
  }
}))
