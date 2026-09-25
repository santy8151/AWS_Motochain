import React, { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useAppStore } from './store/appStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import './App.css'

export default function App() {
  const { isAuthenticated, token } = useAuthStore()
  const { currentPage } = useAppStore()

  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <RegisterPage />
    }
    return <LoginPage />
  }

  return <Dashboard />
}
