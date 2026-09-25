import React, { useState } from 'react'
import { Zap, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import axios from 'axios'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuthStore()
  const { setCurrentPage } = useAppStore()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/register`,
        { email, password, name }
      )
      
      if (response.data.access_token) {
        register(response.data.access_token, { email, name })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error en registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ssscaner-darker flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-ssscaner-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ssscaner-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-ssscaner-primary" />
            <h1 className="text-4xl font-bold text-ssscaner-primary">SSSCANER</h1>
          </div>
          <p className="text-ssscaner-primary/70">Crea tu cuenta de diagnóstico</p>
        </div>

        <div className="bg-ssscaner-dark/80 backdrop-blur border border-ssscaner-primary/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Registro</h2>

          {error && (
            <div className="bg-ssscaner-danger/20 border border-ssscaner-danger/50 rounded-lg p-3 mb-4 text-ssscaner-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-ssscaner-primary/80 text-sm font-semibold mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="input-field"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-ssscaner-primary/80 text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-field"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-ssscaner-primary/80 text-sm font-semibold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-ssscaner-primary/80 text-sm font-semibold mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mb-4"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <button
            onClick={() => setCurrentPage('login')}
            className="w-full flex items-center justify-center gap-2 text-ssscaner-primary/70 hover:text-ssscaner-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
