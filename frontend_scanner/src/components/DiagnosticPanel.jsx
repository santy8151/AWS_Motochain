import React, { useState } from 'react'
import { BarChart3, Send, AlertTriangle, CheckCircle } from 'lucide-react'
import axios from 'axios'
import '../styles/DiagnosticPanel.css'

export default function DiagnosticPanel() {
  const [diagnostics, setDiagnostics] = useState([])
  const [loading, setLoading] = useState(false)
  const [measurements, setMeasurements] = useState({
    pressure_suction: 28,
    pressure_discharge: 245,
    temperature_evaporator: 6,
    temperature_condenser: 47,
    voltage: 12.1,
    current: 5.3
  })

  const runDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/ml/diagnose`,
        null,
        {
          params: {
            vehicle_id: 'VH001',
            measurements: measurements
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setDiagnostics(response.data.diagnostics || [])
    } catch (err) {
      console.error('Diagnosis error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="diagnostic-panel space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ssscaner-primary flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Diagnóstico IA
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-ssscaner-primary">Parámetros de Entrada</h2>
          <div className="space-y-3">
            <MeasurementInput
              label="Presión Succión (PSI)"
              value={measurements.pressure_suction}
              onChange={(v) => setMeasurements({ ...measurements, pressure_suction: parseFloat(v) })}
              min="0"
              max="50"
            />
            <MeasurementInput
              label="Presión Descarga (PSI)"
              value={measurements.pressure_discharge}
              onChange={(v) => setMeasurements({ ...measurements, pressure_discharge: parseFloat(v) })}
              min="150"
              max="350"
            />
            <MeasurementInput
              label="Temperatura Evaporador (°C)"
              value={measurements.temperature_evaporator}
              onChange={(v) => setMeasurements({ ...measurements, temperature_evaporator: parseFloat(v) })}
              min="-5"
              max="25"
            />
            <MeasurementInput
              label="Temperatura Condensador (°C)"
              value={measurements.temperature_condenser}
              onChange={(v) => setMeasurements({ ...measurements, temperature_condenser: parseFloat(v) })}
              min="30"
              max="70"
            />
            <MeasurementInput
              label="Voltaje (V)"
              value={measurements.voltage}
              onChange={(v) => setMeasurements({ ...measurements, voltage: parseFloat(v) })}
              min="8"
              max="14"
              step="0.1"
            />
            <MeasurementInput
              label="Corriente (A)"
              value={measurements.current}
              onChange={(v) => setMeasurements({ ...measurements, current: parseFloat(v) })}
              min="0"
              max="15"
              step="0.1"
            />
          </div>

          <button
            onClick={runDiagnosis}
            disabled={loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Analizando...' : 'Ejecutar Diagnóstico'}
          </button>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-ssscaner-primary">Resumen</h2>
          
          {diagnostics.length === 0 ? (
            <div className="text-ssscaner-primary/50 text-center py-8">
              Ejecuta un diagnóstico para ver los resultados
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-ssscaner-darker/50 border border-ssscaner-warning/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-ssscaner-warning flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-ssscaner-warning">Diagnóstico Completado</p>
                    <p className="text-sm text-ssscaner-primary/70 mt-1">
                      Se detectaron {diagnostics.filter(d => d.fault_detected).length} problemas potenciales
                    </p>
                  </div>
                </div>
              </div>

              {diagnostics.map((diag, idx) => (
                <DiagnosticResult key={idx} diagnostic={diag} />
              ))}
            </div>
          )}
        </div>
      </div>

      {diagnostics.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-ssscaner-primary">Recomendaciones Detalladas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnostics.map((diag, idx) => (
              <div key={idx} className="bg-ssscaner-darker/50 border border-ssscaner-primary/30 rounded-lg p-4">
                <h3 className="font-semibold text-ssscaner-primary mb-2">{diag.node_id}</h3>
                <div className="space-y-1">
                  {(diag.recommendations || []).map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-ssscaner-primary/80">
                      <span className="text-ssscaner-secondary">→</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-ghost text-sm w-full mt-3">
                  Ver Diagrama
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MeasurementInput({ label, value, onChange, min, max, step = "1" }) {
  return (
    <div>
      <label className="block text-ssscaner-primary/70 text-sm font-semibold mb-2">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="input-field w-full"
      />
    </div>
  )
}

function DiagnosticResult({ diagnostic }) {
  const statusIcon = diagnostic.fault_detected ? '⚠️' : '✓'
  const statusColor = diagnostic.fault_detected ? 'text-ssscaner-warning' : 'text-ssscaner-success'
  const borderColor = diagnostic.fault_detected ? 'border-ssscaner-warning/50' : 'border-ssscaner-success/50'

  return (
    <div className={`bg-ssscaner-darker/50 border ${borderColor} rounded-lg p-3`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{statusIcon}</span>
          <p className={`font-semibold ${statusColor}`}>
            {diagnostic.node_id || 'Nodo Desconocido'}
          </p>
        </div>
        <span className="text-xs text-ssscaner-primary/50">
          Confianza: {(diagnostic.confidence * 100).toFixed(1)}%
        </span>
      </div>
      
      <div className="w-full bg-ssscaner-darker/50 rounded-full h-2 mb-3">
        <div
          className={`h-full rounded-full transition-all ${
            diagnostic.fault_detected ? 'bg-ssscaner-warning' : 'bg-ssscaner-success'
          }`}
          style={{ width: `${diagnostic.severity * 100}%` }}
        ></div>
      </div>

      <p className="text-xs text-ssscaner-primary/70">
        Severidad: {(diagnostic.severity * 100).toFixed(1)}%
      </p>
    </div>
  )
}
