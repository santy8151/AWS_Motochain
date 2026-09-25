import React, { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import '../../styles/tools/Oscilloscope.css'

export default function Oscilloscope() {
  const [data, setData] = useState([])
  const [running, setRunning] = useState(false)
  const [frequency, setFrequency] = useState(60)

  useEffect(() => {
    if (!running) return undefined

    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev]
        const x = newData.length * 0.1
        const y = 230 + 20 * Math.sin((x * frequency * 2 * Math.PI) / 100) + (Math.random() - 0.5) * 5
        newData.push({ x: x.toFixed(2), y: y.toFixed(1) })
        return newData.slice(-100)
      })
    }, 50)

    return () => clearInterval(interval)
  }, [running, frequency])

  return (
    <div className="scope-layout">
      <div className="scope-card">
        <div className="scope-controls">
          <div>
            <label>Frecuencia de referencia</label>
            <input
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              min="50"
              max="70"
              step="0.5"
              disabled={running}
            />
          </div>
          <button onClick={() => setRunning(!running)} className={running ? 'scope-stop' : 'scope-start'}>
            {running ? 'Detener captura' : 'Iniciar captura'}
          </button>
        </div>

        <div className="scope-chart">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(7, 17, 15, 0.08)" />
                <XAxis dataKey="x" stroke="rgba(7, 17, 15, 0.45)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(7, 17, 15, 0.45)" tick={{ fontSize: 12 }} domain={[200, 260]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(7, 17, 15, 0.12)', color: '#07110f' }}
                  labelStyle={{ color: '#07110f' }}
                />
                <Line type="monotone" dataKey="y" stroke="#128c7e" dot={false} isAnimationActive={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="scope-empty">Inicia una captura para visualizar la senal del compresor.</div>
          )}
        </div>

        <div className="scope-stats">
          <StatBox label="RMS" value={running ? (230 + (Math.random() - 0.5) * 10).toFixed(1) : '0'} unit="V" />
          <StatBox label="Frecuencia" value={frequency.toFixed(1)} unit="Hz" />
          <StatBox label="THD" value={running ? (Math.random() * 10).toFixed(1) : '0'} unit="%" />
        </div>
      </div>

      <div className="scope-side-grid">
        <div className="scope-card">
          <h3>Espectro de frecuencia</h3>
          <FreqBar freq="50 Hz" value={72} />
          <FreqBar freq="60 Hz" value={96} />
          <FreqBar freq="100 Hz" value={38} />
          <FreqBar freq="120 Hz" value={44} />
        </div>

        <div className="scope-card">
          <h3>Parametros electricos</h3>
          <ParamBox label="Voltaje pico" value="254 V" />
          <ParamBox label="Factor de potencia" value="0.98" />
          <ParamBox label="Potencia aparente" value="2.4 kVA" />
          <ParamBox label="Desbalance" value="1.2%" />
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, unit }) {
  return (
    <div className="scope-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{unit}</small>
    </div>
  )
}

function FreqBar({ freq, value }) {
  return (
    <div className="freq-row">
      <span>{freq}</span>
      <div className="freq-track">
        <div style={{ width: `${value}%` }}></div>
      </div>
      <strong>{value.toFixed(0)}%</strong>
    </div>
  )
}

function ParamBox({ label, value }) {
  return (
    <div className="param-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
