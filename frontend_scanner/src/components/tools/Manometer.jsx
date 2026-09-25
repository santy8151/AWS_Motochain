import React from 'react'
import '../../styles/tools/Manometer.css'

export default function Manometer({ color, label, value, unit, min, max, active = false }) {
  const percentage = ((value - min) / (max - min)) * 100
  const colorMap = {
    blue: '#128c7e',
    yellow: '#b7791f',
    red: '#b9402d'
  }

  return (
    <div className="manometer-card">
      <div className="manometer-topline">
        <div>
          <div className="manometer-label">{label}</div>
          <span>{active ? 'Captura en vivo' : 'Sensor calibrado'}</span>
        </div>
        <strong className={active ? 'active' : ''}>{active ? 'Live' : 'Standby'}</strong>
      </div>
      <div className="manometer-gauge">
        <svg viewBox="0 0 200 140" width="100%" height="140">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colorMap[color]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colorMap[color]} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke="rgba(7, 17, 15, 0.12)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke={colorMap[color]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 220} 220`}
          />

          <circle cx="100" cy="100" r="6" fill={colorMap[color]} />
          <line
            x1="100"
            y1="100"
            x2={100 + 60 * Math.cos((percentage / 100) * Math.PI - Math.PI / 2)}
            y2={100 + 60 * Math.sin((percentage / 100) * Math.PI - Math.PI / 2)}
            stroke={colorMap[color]}
            strokeWidth="3"
            strokeLinecap="round"
          />

          <text x="30" y="120" fontSize="10" fill="rgba(7, 17, 15, 0.45)" textAnchor="start">
            {min}
          </text>
          <text x="170" y="120" fontSize="10" fill="rgba(7, 17, 15, 0.45)" textAnchor="end">
            {max}
          </text>
        </svg>
      </div>
      <div className="manometer-value">
        <span className="value" style={{ color: colorMap[color] }}>{value.toFixed(1)}</span>
        <span className="unit">{unit}</span>
      </div>
    </div>
  )
}
