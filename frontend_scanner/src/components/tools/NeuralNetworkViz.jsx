import React from 'react'
import '../../styles/tools/NeuralNetworkViz.css'

export default function NeuralNetworkViz({ nodes }) {
  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-6 text-ssscaner-primary">Visualización de Red Neuronal</h3>
      
      <svg className="neural-network-viz" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Input Layer */}
        <text x="50" y="30" fontSize="16" fill="#00d4ff" fontWeight="bold">Entrada</text>
        <circle cx="50" cy="80" r="20" fill="none" stroke="#00d4ff" strokeWidth="2" />
        <circle cx="50" cy="150" r="20" fill="none" stroke="#00d4ff" strokeWidth="2" />
        <circle cx="50" cy="220" r="20" fill="none" stroke="#00d4ff" strokeWidth="2" />
        <circle cx="50" cy="290" r="20" fill="none" stroke="#00d4ff" strokeWidth="2" />
        <circle cx="50" cy="360" r="20" fill="none" stroke="#00d4ff" strokeWidth="2" />
        <text x="20" y="85" fontSize="10" fill="#00d4ff" opacity="0.7">P_S</text>
        <text x="20" y="155" fontSize="10" fill="#00d4ff" opacity="0.7">P_D</text>
        <text x="15" y="225" fontSize="10" fill="#00d4ff" opacity="0.7">T_EV</text>
        <text x="15" y="295" fontSize="10" fill="#00d4ff" opacity="0.7">T_CO</text>
        <text x="32" y="365" fontSize="10" fill="#00d4ff" opacity="0.7">I/V</text>

        {/* Hidden Layer 1 */}
        <text x="280" y="30" fontSize="16" fill="#00d4ff" fontWeight="bold">PCA (20)</text>
        {[80, 140, 200, 260, 320].map((y) => (
          <g key={y}>
            <line x1="70" y1={y} x2="280" y2="200" stroke="url(#connectionGradient)" strokeWidth="0.5" opacity="0.6" />
            <circle cx="320" cy="200" r="15" fill="none" stroke="#ffd700" strokeWidth="2" filter="url(#glow)" />
          </g>
        ))}
        <text x="310" y="210" fontSize="12" fill="#ffd700" fontWeight="bold">64</text>

        {/* Hidden Layer 2 */}
        <text x="520" y="30" fontSize="16" fill="#00d4ff" fontWeight="bold">Dense (32)</text>
        {[150, 250].map((y) => (
          <g key={y}>
            <line x1="335" y1="200" x2="520" y2={y} stroke="url(#connectionGradient)" strokeWidth="0.5" opacity="0.6" />
            <circle cx="550" cy={y} r="12" fill="none" stroke="#ff9500" strokeWidth="2" filter="url(#glow)" />
          </g>
        ))}

        {/* Output Layer */}
        <text x="740" y="30" fontSize="16" fill="#00d4ff" fontWeight="bold">Salida</text>
        {[150, 250].map((y) => (
          <g key={y}>
            <line x1="562" y1={y} x2="750" y2="200" stroke="url(#connectionGradient)" strokeWidth="0.5" opacity="0.6" />
          </g>
        ))}
        <circle cx="780" cy="200" r="20" fill="none" stroke="#ff3366" strokeWidth="2" filter="url(#glow)" />
        <text x="768" y="210" fontSize="14" fill="#ff3366" fontWeight="bold">Fallo</text>

        {/* Nodos específicos */}
        <text x="850" y="100" fontSize="14" fill="#00d4ff" fontWeight="bold">Nodos</text>
        {nodes.slice(0, 5).map((node, i) => (
          <g key={node.id}>
            <circle cx="870" cy={140 + i * 35} r="8" fill="none" stroke="#00d4ff" strokeWidth="1" />
            <text x="885" y={145 + i * 35} fontSize="11" fill="#00d4ff">{node.name}</text>
            <text x="885" y={158 + i * 35} fontSize="9" fill="#00d4ff" opacity="0.5">
              {node.accuracy}%
            </text>
          </g>
        ))}
      </svg>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        {nodes.map((node) => (
          <div key={node.id} className="text-center">
            <div className="text-2xl font-bold text-ssscaner-success mb-1">{node.accuracy}%</div>
            <div className="text-sm text-ssscaner-primary font-semibold">{node.name}</div>
            <div className="text-xs text-ssscaner-primary/50">{node.algorithm.replace('_', ' ')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
