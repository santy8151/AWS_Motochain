import React, { useState } from 'react'
import { Zap, ChevronRight, Car, BatteryCharging, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import axios from 'axios'
import '../styles/LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const { login } = useAuthStore()
  const { setCurrentPage } = useAppStore()

  const enterDemo = () => {
    login('demo-electric-session', { email: email || 'demo@ssscaner.ev', name: name || 'Piloto EV' })
    setCurrentPage('ai-chat')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/login`,
        { email, password }
      )

      if (response.data.access_token) {
        login(response.data.access_token, { email })
        setCurrentPage('ai-chat')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo conectar. Puedes entrar en modo demo.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/register`,
        { email, password, name }
      )

      if (response.data.access_token) {
        login(response.data.access_token, { email, name })
        setCurrentPage('ai-chat')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo registrar. Puedes entrar en modo demo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    if (isRegister) {
      handleRegister(e)
      return
    }
    handleLogin(e)
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-overlay"></div>
      </div>

      <div className="login-content">
        <section className="login-branding">
          <div className="branding-header">
            <div className="logo-container">
              <div className="logo-badge">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <span className="scene-label">Escena 1</span>
                <h1 className="gradient-text">SSSCANER EV</h1>
                <p>Diagnostico inteligente para autos electricos con asistencia IA.</p>
              </div>
            </div>
          </div>

          <div className="branding-features">
            <div className="feature-item">
              <Sparkles className="w-6 h-6 text-ssscaner-primary" />
              <span>Chat IA listo al entrar</span>
            </div>
            <div className="feature-item">
              <Car className="w-6 h-6 text-ssscaner-primary" />
              <span>Experiencia moderna de vehiculos electricos</span>
            </div>
            <div className="feature-item">
              <ShieldCheck className="w-6 h-6 text-ssscaner-primary" />
              <span>Modulos protegidos para la beta</span>
            </div>
          </div>
        </section>

        <section className="login-form-section">
          <div className="login-form-card">
            <div className="form-header">
              <div className="form-icon">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <h2>{isRegister ? 'Crear cuenta' : 'Iniciar sesion'}</h2>
              <p>{isRegister ? 'Registra tu acceso a la consola EV.' : 'Entra a la consola con IA y espacio beta.'}</p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertIcon />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="form-input"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contrasena</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary-large w-full">
                {loading ? 'Cargando...' : (isRegister ? 'Registrarme' : 'Entrar')}
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </form>

            <div className="form-divider">
              <span>{isRegister ? 'Ya tienes cuenta' : 'Nuevo usuario'}</span>
            </div>

            <button onClick={() => setIsRegister(!isRegister)} className="btn-secondary-large w-full" type="button">
              {isRegister ? 'Iniciar sesion' : 'Crear cuenta'}
            </button>

            <button onClick={enterDemo} className="btn-demo w-full" type="button">
              Entrar demo
            </button>

            <div className="footer-text">
              <Zap className="w-4 h-4" />
              <span>Despues del acceso se abre la escena 2</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}
