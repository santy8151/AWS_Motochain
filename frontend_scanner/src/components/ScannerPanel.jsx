import React, { useState, useEffect } from 'react'
import { Zap, Bluetooth, Radio, Download, AlertCircle, Key } from 'lucide-react'
import axios from 'axios'
import '../styles/ScannerPanel.css'
import { useAppStore } from '../store/appStore'

export default function ScannerPanel() {
  const { otpVerified, setOtpVerified } = useAppStore()
  const [devices, setDevices] = useState([])
  const [connectedDevice, setConnectedDevice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [scanning, setScanning] = useState(false)
  
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')

  const requestOtp = async () => {
    try {
      setLoading(true)
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/otp/generate`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setOtpSent(true)
      setOtpError('')
    } catch (err) {
      setOtpError('Error generando OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/otp/verify`,
        { otp: otpCode },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setOtpVerified(true)
      setOtpError('')
    } catch (err) {
      setOtpError('OTP incorrecto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (otpVerified) {
      discoveryDevices()
    }
  }, [otpVerified])

  const discoveryDevices = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/scanner/devices`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setDevices(response.data.devices || [])
    } catch (err) {
      console.error('Error discovering devices:', err)
    } finally {
      setLoading(false)
    }
  }

  const connectDevice = async (deviceId) => {
    setLoading(true)
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/scanner/connect`,
        null,
        {
          params: { device_id: deviceId },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      setConnectedDevice(deviceId)
      setScanning(true)
      fetchLogs()
    } catch (err) {
      console.error('Error connecting device:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/scanner/logs?limit=50`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setLogs(response.data.logs || [])
    } catch (err) {
      console.error('Error fetching logs:', err)
    }
  }

  if (!otpVerified) {
    return (
      <div className="scanner-panel space-y-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="card max-w-md w-full p-8 text-center">
          <Key className="w-16 h-16 mx-auto mb-4 text-ssscaner-primary" />
          <h2 className="text-2xl font-bold mb-2">Verificación Requerida</h2>
          <p className="text-ssscaner-primary/70 mb-6">Esta sección es de alta sensibilidad. Requiere validación por OTP.</p>
          
          {otpError && <div className="text-ssscaner-danger mb-4">{otpError}</div>}
          
          {!otpSent ? (
            <button onClick={requestOtp} disabled={loading} className="btn-primary w-full">
              {loading ? 'Generando...' : 'Generar Código OTP'}
            </button>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <input
                type="text"
                placeholder="Ingrese OTP de 6 dígitos"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full p-3 rounded bg-ssscaner-darker border border-ssscaner-primary/30 text-center text-xl tracking-widest"
                maxLength={6}
              />
              <button type="submit" disabled={loading || otpCode.length < 6} className="btn-primary w-full">
                {loading ? 'Verificando...' : 'Verificar Acceso'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="scanner-panel space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ssscaner-primary flex items-center gap-2">
          <Bluetooth className="w-8 h-8" />
          Scanner Bluetooth
        </h1>
        <button onClick={discoveryDevices} disabled={loading} className="btn-primary flex items-center gap-2">
          <Radio className="w-4 h-4" />
          {loading ? 'Escaneando...' : 'Escanear'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-ssscaner-primary">Dispositivos Disponibles</h2>
          <div className="space-y-2">
            {devices.length === 0 ? (
              <div className="flex items-center gap-2 text-ssscaner-primary/50">
                <AlertCircle className="w-4 h-4" /> No hay dispositivos disponibles
              </div>
            ) : (
              devices.map((device) => (
                <button
                  key={device.device_id}
                  onClick={() => connectDevice(device.device_id)}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${connectedDevice === device.device_id ? 'border-ssscaner-success bg-ssscaner-success/10' : 'border-ssscaner-primary/30 hover:border-ssscaner-primary/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{device.name}</p>
                      <p className="text-xs text-ssscaner-primary/50">{device.device_id}</p>
                    </div>
                    {connectedDevice === device.device_id && <div className="w-3 h-3 bg-ssscaner-success rounded-full animate-pulse"></div>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-ssscaner-primary">Estado de Conexión</h2>
          <div className="space-y-3">
            <StatusBox label="Estado" value={connectedDevice ? 'Conectado' : 'Desconectado'} status={connectedDevice ? 'ok' : 'warning'} />
            <StatusBox label="Dispositivo" value={connectedDevice ? 'SSSCANNER-001' : 'N/A'} status={connectedDevice ? 'ok' : 'default'} />
            <StatusBox label="Señal" value={connectedDevice ? '-45 dBm' : 'N/A'} status={connectedDevice ? 'ok' : 'default'} />
            <StatusBox label="Datos Recibidos" value={logs.length + ' registros'} status="default" />
          </div>
        </div>
      </div>

      {connectedDevice && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-ssscaner-primary flex items-center gap-2">
            <Radio className="w-5 h-5" /> Logs en Tiempo Real
          </h2>
          <div className="bg-ssscaner-darker/50 rounded-lg p-4 font-mono text-xs text-ssscaner-success max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-ssscaner-primary/50">Esperando datos...</div>
            ) : (
              logs.slice(-20).map((log, idx) => (
                <div key={idx} className="mb-1">
                  <span className="text-ssscaner-primary/50">[{log.timestamp}]</span> <span className="text-ssscaner-warning">{log.data_type}:</span> <span className="text-ssscaner-success">{JSON.stringify(log.data).substring(0, 100)}...</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBox({ label, value, status = 'default' }) {
  const statusColors = { ok: 'text-ssscaner-success', warning: 'text-ssscaner-warning', error: 'text-ssscaner-danger', default: 'text-ssscaner-primary' }
  return (
    <div className="flex justify-between items-center py-2 border-b border-ssscaner-primary/20">
      <span className="text-ssscaner-primary/70">{label}</span>
      <span className={`font-semibold ${statusColors[status]}`}>{value}</span>
    </div>
  )
}
