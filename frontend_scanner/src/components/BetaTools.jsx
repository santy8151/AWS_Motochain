import React, { useEffect, useMemo, useState } from 'react'
import { Activity, BatteryCharging, Bluetooth, BrainCircuit, Gauge, HardDrive, Pause, Play, RotateCcw, Settings, Signal, SlidersHorizontal, Zap } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import Manometer from './tools/Manometer'
import Oscilloscope from './tools/Oscilloscope'
import NeuralNetworkViz from './tools/NeuralNetworkViz'
import '../styles/BetaTools.css'

export default function BetaTools() {
  const [selectedTab, setSelectedTab] = useState('readings')
  const [epochs, setEpochs] = useState(120)
  const [selectedNodeId, setSelectedNodeId] = useState('compressor')
  const [captureRunning, setCaptureRunning] = useState(false)
  const [pumpActive, setPumpActive] = useState(false)
  const [cycleActive, setCycleActive] = useState(false)
  const [trainingState, setTrainingState] = useState('idle')
  const [scannerDevice, setScannerDevice] = useState(null)
  const [scannerError, setScannerError] = useState('')
  const [scannerStatus, setScannerStatus] = useState('idle')
  const [gaugeValues, setGaugeValues] = useState({
    low: 31.8,
    high: 226.4,
    vacuum: 420,
  })
  const [nodeModels, setNodeModels] = useState({
    compressor: 'decision_tree',
    evaporator: 'mlp',
    condenser: 'mlp',
    chiller: 'linear_regression',
    ac_motor: 'bayesian',
  })
  const { scannerConnected, connectScanner, disconnectScanner } = useAppStore()

  useEffect(() => {
    if (!scannerConnected) {
      setCaptureRunning(false)
      setPumpActive(false)
      setCycleActive(false)
    }
  }, [scannerConnected])

  useEffect(() => {
    if (!scannerConnected || !captureRunning) return undefined

    const interval = setInterval(() => {
      setGaugeValues((current) => {
        const lowTarget = cycleActive ? 34.5 : 31.8
        const highTarget = cycleActive ? 242 : 226.4
        const vacuumTarget = pumpActive ? 285 : 420

        return {
          low: moveValue(current.low, lowTarget, 0.9, 0.35, 0, 60),
          high: moveValue(current.high, highTarget, 3.4, 1.2, 120, 320),
          vacuum: moveValue(current.vacuum, vacuumTarget, 28, 9, 0, 1000),
        }
      })
    }, 700)

    return () => clearInterval(interval)
  }, [captureRunning, cycleActive, pumpActive, scannerConnected])

  useEffect(() => {
    if (trainingState !== 'running') return undefined

    const timeout = setTimeout(() => {
      setTrainingState('done')
    }, 1400)

    return () => clearTimeout(timeout)
  }, [trainingState])

  const gauges = [
    { id: 'low', color: 'blue', label: 'Linea baja', value: gaugeValues.low, unit: 'PSI', min: 0, max: 60, active: captureRunning },
    { id: 'high', color: 'yellow', label: 'Linea alta', value: gaugeValues.high, unit: 'PSI', min: 120, max: 320, active: captureRunning },
    { id: 'vacuum', color: 'red', label: 'Vacio', value: gaugeValues.vacuum, unit: 'micrones', min: 0, max: 1000, active: captureRunning },
  ]

  const nodes = [
    { id: 'compressor', name: 'Compresor electrico', accuracy: 94, status: 'Validado', channel: 'HVAC-CMP-01' },
    { id: 'evaporator', name: 'Evaporador', accuracy: 92, status: 'Validado', channel: 'TEMP-EVP-02' },
    { id: 'condenser', name: 'Condensador', accuracy: 91, status: 'Observacion', channel: 'PRESS-CND-03' },
    { id: 'chiller', name: 'Chiller bateria', accuracy: 89, status: 'Validado', channel: 'BATT-CHL-04' },
    { id: 'ac_motor', name: 'Inversor AC', accuracy: 93, status: 'Validado', channel: 'INV-AC-05' },
  ]

  const algorithms = [
    { value: 'decision_tree', label: 'Decision Tree', latency: '32 ms', parameters: '0.4M', useCase: 'fallas discretas' },
    { value: 'linear_regression', label: 'Linear Regression', latency: '18 ms', parameters: '0.1M', useCase: 'tendencias analogas' },
    { value: 'bayesian', label: 'Bayesian Network', latency: '51 ms', parameters: '1.1M', useCase: 'probabilidad causal' },
    { value: 'mlp', label: 'MLP Neural Network', latency: '45 ms', parameters: '2.3M', useCase: 'patrones no lineales' },
  ]

  const nodesWithModels = useMemo(
    () => nodes.map((node) => ({
      ...node,
      algorithm: algorithms.find((algorithm) => algorithm.value === nodeModels[node.id])?.label || 'Sin modelo',
    })),
    [algorithms, nodeModels, nodes]
  )

  const selectedNode = useMemo(
    () => nodesWithModels.find((node) => node.id === selectedNodeId) || nodesWithModels[0],
    [nodesWithModels, selectedNodeId]
  )

  const activeAlgorithm = useMemo(
    () => algorithms.find((algorithm) => algorithm.value === nodeModels[selectedNodeId]),
    [algorithms, nodeModels, selectedNodeId]
  )

  const handleModelChange = (model) => {
    setNodeModels((current) => ({
      ...current,
      [selectedNodeId]: model,
    }))
  }

  const disconnectPhysicalScanner = () => {
    scannerDevice?.gatt?.disconnect()
    setScannerDevice(null)
    setScannerStatus('idle')
    setScannerError('')
    disconnectScanner()
  }

  const connectPhysicalScanner = async () => {
    setScannerError('')

    if (!navigator.bluetooth) {
      setScannerStatus('error')
      setScannerError('Tu navegador no permite Bluetooth Web. Abre esta pagina en Chrome o Edge desde localhost.')
      return false
    }

    try {
      setScannerStatus('searching')
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information'],
      })

      setScannerDevice(device)
      device.addEventListener('gattserverdisconnected', () => {
        setScannerStatus('idle')
        disconnectScanner()
      })

      if (!device.gatt) {
        setScannerStatus('error')
        setScannerError('El dispositivo fue seleccionado, pero no expone conexion GATT compatible con el navegador.')
        return false
      }

      setScannerStatus('connecting')
      await device.gatt.connect()
      connectScanner()
      setScannerStatus('connected')
      return true
    } catch (error) {
      const cancelled = error?.name === 'NotFoundError'
      setScannerStatus(cancelled ? 'idle' : 'error')
      setScannerError(cancelled ? 'Seleccion de Bluetooth cancelada.' : error?.message || 'No se pudo conectar el scanner Bluetooth.')
      return false
    }
  }

  const toggleScannerConnection = async () => {
    if (scannerConnected) {
      disconnectPhysicalScanner()
      return
    }
    await connectPhysicalScanner()
  }

  const ensureScannerReady = async () => {
    if (scannerConnected) return true
    return connectPhysicalScanner()
  }

  const toggleCapture = async () => {
    if (!scannerConnected) {
      const connected = await ensureScannerReady()
      setCaptureRunning(connected)
      return
    }
    setCaptureRunning((running) => !running)
  }

  const resetReadings = () => {
    setCaptureRunning(false)
    setPumpActive(false)
    setCycleActive(false)
    setGaugeValues({
      low: 31.8,
      high: 226.4,
      vacuum: 420,
    })
  }

  const runTraining = () => {
    setTrainingState('running')
  }

  const resetTraining = () => {
    setTrainingState('idle')
    setEpochs(120)
    setNodeModels((current) => ({
      ...current,
      [selectedNodeId]: 'mlp',
    }))
  }

  const tabs = [
    { id: 'readings', label: 'Lecturas', icon: Gauge },
    { id: 'scope', label: 'Senal', icon: Signal },
    { id: 'model', label: 'Modelo IA', icon: BrainCircuit },
  ]

  return (
    <div className="beta-tools">
      <header className="beta-header">
        <div>
          <span className="beta-eyebrow">Espacio beta</span>
          <h1>Banco de diagnostico EV</h1>
          <p>Modulo experimental para validar lecturas de climatizacion, bateria e inversor antes de habilitar el resto del sistema.</p>
        </div>
        <button
          type="button"
          onClick={toggleScannerConnection}
          className={`scanner-connect ${scannerConnected ? 'connected' : ''}`}
        >
          <span className="scanner-device-icon">
            <HardDrive className="w-5 h-5" />
            <Bluetooth className="w-3 h-3" />
          </span>
          <span>
            <strong>{scannerConnected ? 'Scanner conectado' : scannerStatus === 'searching' ? 'Buscando dispositivos' : scannerStatus === 'connecting' ? 'Conectando scanner' : 'Conectar scanner'}</strong>
            <small>{scannerConnected ? `${scannerDevice?.name || 'Scanner Bluetooth'} via Bluetooth` : 'Abrir Bluetooth y buscar dispositivos'}</small>
          </span>
        </button>
      </header>

      {scannerError && <div className="scanner-error">{scannerError}</div>}

      <section className="beta-summary-grid">
        <SummaryCard icon={BatteryCharging} label="Vehiculo" value="EV-Prototype 02" detail="VIN demo activo" />
        <SummaryCard icon={Zap} label="Pack HV" value="382 V" detail="Aislacion normal" />
        <SummaryCard icon={Activity} label="Telemetria" value={scannerConnected ? '24 Hz' : 'En espera'} detail={scannerConnected ? 'Captura desde scanner' : 'Conecta el scanner fisico'} />
        <SummaryCard icon={SlidersHorizontal} label="Modo" value="Beta controlada" detail="Sin escritura a ECU" />
      </section>

      <div className="beta-tabs" role="tablist" aria-label="Herramientas beta">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedTab(tab.id)}
            className={`beta-tab ${selectedTab === tab.id ? 'active' : ''}`}
            role="tab"
            aria-selected={selectedTab === tab.id}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'readings' && (
        <section className="beta-panel">
          <div className="panel-title-row">
            <div>
              <span className="beta-eyebrow">Circuito termico</span>
              <h2>Lecturas en vivo</h2>
            </div>
            <div className="panel-actions">
              <button className="secondary-button" type="button" onClick={resetReadings}>
                <RotateCcw className="w-4 h-4" />
                Reiniciar lecturas
              </button>
              <button className="professional-button" type="button" onClick={toggleCapture}>
                {captureRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!scannerConnected ? 'Conectar primero' : captureRunning ? 'Detener captura' : 'Iniciar captura'}
              </button>
            </div>
          </div>

          <div className="gauge-grid">
            {gauges.map((gauge) => (
              <Manometer key={gauge.id} {...gauge} />
            ))}
          </div>

          <div className="operations-grid">
            <OperationPanel
              title="Bomba de vacio"
              rows={[
                ['Estado', pumpActive ? 'Extrayendo' : 'Operativo', 'ok'],
                ['Velocidad', pumpActive ? 'Alta' : 'Reposo', 'default'],
                ['Temperatura', pumpActive ? '46 C' : '42 C', 'default'],
                ['Objetivo', '450 micrones', 'default'],
              ]}
              action={pumpActive ? 'Detener bomba' : 'Activar bomba'}
              active={pumpActive}
              disabled={!scannerConnected}
              valveLabel="Valvula de vacio"
              onAction={() => {
                ensureScannerReady().then((connected) => {
                  if (!connected) return
                  setPumpActive((active) => !active)
                  setCaptureRunning(true)
                })
              }}
            />
            <OperationPanel
              title="Carga y recuperacion"
              rows={[
                ['Estado', cycleActive ? 'Regulando' : 'Listo', 'ok'],
                ['Presion actual', `${gaugeValues.high.toFixed(1)} PSI`, 'default'],
                ['Refrigerante', 'R1234yf', 'default'],
                ['Masa objetivo', cycleActive ? '734 g' : '720 g', 'default'],
              ]}
              action={cycleActive ? 'Pausar ciclo' : 'Preparar ciclo'}
              active={cycleActive}
              disabled={!scannerConnected}
              valveLabel="Valvula de carga"
              onAction={() => {
                ensureScannerReady().then((connected) => {
                  if (!connected) return
                  setCycleActive((active) => !active)
                  setCaptureRunning(true)
                })
              }}
            />
          </div>
        </section>
      )}

      {selectedTab === 'scope' && (
        <section className="beta-panel">
          <div className="panel-title-row">
            <div>
              <span className="beta-eyebrow">Inversor y compresor</span>
              <h2>Analisis de senal</h2>
            </div>
          </div>
          <Oscilloscope />
        </section>
      )}

      {selectedTab === 'model' && (
        <section className="beta-panel">
          <div className="model-layout">
            <div className="model-card">
              <span className="beta-eyebrow">Configuracion</span>
              <h2>{selectedNode.name}</h2>
              <p className="model-context">Canal {selectedNode.channel}. Cambia aqui el sistema de prediccion usado por este nodo.</p>

              <label className="field-label">Epocas de entrenamiento</label>
              <div className="range-control">
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={epochs}
                  onChange={(e) => setEpochs(e.target.value)}
                />
                <strong>{epochs}</strong>
              </div>

              <label className="field-label">Sistema de prediccion</label>
              <select value={nodeModels[selectedNodeId]} onChange={(e) => handleModelChange(e.target.value)} className="professional-select">
                {algorithms.map((algo) => (
                  <option key={algo.value} value={algo.value}>
                    {algo.label}
                  </option>
                ))}
              </select>

              <div className="model-actions">
                <button className="professional-button" type="button" onClick={runTraining} disabled={trainingState === 'running'}>
                  {trainingState === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {trainingState === 'running' ? 'Entrenando' : trainingState === 'done' ? 'Reentrenar' : 'Entrenar'}
                </button>
                <button className="secondary-button" type="button" onClick={resetTraining}>
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </button>
              </div>
            </div>

            <div className="model-card">
              <span className="beta-eyebrow">Runtime local</span>
              <h2>{activeAlgorithm?.label}</h2>
              <div className="technical-list">
                <ToolRow label="Version" value="EV-AI beta 1.0" />
                <ToolRow label="Nodo activo" value={selectedNode.name} />
                <ToolRow label="Uso recomendado" value={activeAlgorithm?.useCase} />
                <ToolRow label="Parametros" value={activeAlgorithm?.parameters} />
                <ToolRow label="Latencia" value={activeAlgorithm?.latency} />
                <ToolRow label="Scanner fisico" value={scannerConnected ? 'Conectado' : 'Desconectado'} status={scannerConnected ? 'ok' : 'warning'} />
                <ToolRow label="Estado" value={trainingState === 'running' ? 'Entrenando' : trainingState === 'done' ? 'Modelo actualizado' : 'Listo'} status="ok" />
              </div>
            </div>
          </div>

          <div className="nodes-table-card">
            <div className="panel-title-row compact">
              <div>
                <span className="beta-eyebrow">Nodos disponibles</span>
                <h2>Validacion del modelo</h2>
              </div>
            </div>

            <div className="nodes-table">
              <div className="nodes-row header">
                <span>Nodo</span>
                <span>Canal</span>
                <span>Algoritmo</span>
                <span>Precision</span>
                <span>Estado</span>
              </div>
              {nodesWithModels.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`nodes-row selectable ${selectedNodeId === node.id ? 'selected' : ''}`}
                >
                  <span>{node.name}</span>
                  <span>{node.channel}</span>
                  <span>{node.algorithm}</span>
                  <span>{node.accuracy}%</span>
                  <span className={node.status === 'Validado' ? 'status-ok-soft' : 'status-warning-soft'}>{node.status}</span>
                </button>
              ))}
            </div>
          </div>

          <NeuralNetworkViz nodes={nodesWithModels} />
        </section>
      )}
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="summary-card">
      <div className="summary-icon">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </div>
  )
}

function OperationPanel({ title, rows, action, active, disabled, valveLabel, onAction }) {
  return (
    <div className={`operation-panel ${active ? 'active' : ''}`}>
      <div className="operation-header">
        <h3>{title}</h3>
        <ValveIndicator active={active} label={valveLabel} />
      </div>
      <div className="technical-list">
        {rows.map(([label, value, status]) => (
          <ToolRow key={label} label={label} value={value} status={status} />
        ))}
      </div>
      <button className="secondary-button full" type="button" onClick={onAction}>
        <Settings className="w-4 h-4" />
        {disabled ? 'Conectar y activar' : action}
      </button>
    </div>
  )
}

function ValveIndicator({ active, label }) {
  return (
    <div className={`valve-indicator ${active ? 'open' : ''}`} aria-label={label}>
      <span className="valve-flow"></span>
      <span className="valve-body">
        <span className="valve-handle"></span>
      </span>
      <small>{active ? 'Abierta' : 'Cerrada'}</small>
    </div>
  )
}

function ToolRow({ label, value, status = 'default' }) {
  return (
    <div className="tool-row">
      <span>{label}</span>
      <strong className={status === 'ok' ? 'status-ok-soft' : status === 'warning' ? 'status-warning-soft' : ''}>{value}</strong>
    </div>
  )
}

function moveValue(current, target, speed, noise, min, max) {
  const direction = target - current
  const next = current + Math.sign(direction) * Math.min(Math.abs(direction), speed) + (Math.random() - 0.5) * noise
  return Math.max(min, Math.min(max, next))
}
