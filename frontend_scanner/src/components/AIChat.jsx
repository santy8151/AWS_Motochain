import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BatteryCharging, Bot, Car, FileCheck2, ImagePlus, Unlock, Send, Sparkles, X } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import '../styles/AIChat.css'

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hola, soy tu asistente IA para diagnostico EV. Escribe el carro del cliente y que quiere diagnosticar para abrir los demas espacios.',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [diagramOpen, setDiagramOpen] = useState(false)
  const [diagramVehicle, setDiagramVehicle] = useState('')
  const [diagramPrompt, setDiagramPrompt] = useState('')
  const [diagramModel, setDiagramModel] = useState('free-local')
  const [diagramResult, setDiagramResult] = useState(null)
  const messagesEndRef = useRef(null)
  const { chatUnlocked, diagnosticBrief, setCurrentPage, setDiagnosticBrief, unlockChat } = useAppStore()

  const userMessages = useMemo(
    () => messages.filter((message) => message.sender === 'user').map((message) => message.text),
    [messages]
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: generateAIResponse(input),
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages((current) => [...current, aiResponse])
      setLoading(false)
    }, 900)
  }

  const validateDiagnostic = () => {
    const source = userMessages.join(' ')
    const detected = extractDiagnosticBrief(source)

    if (!detected.vehicle || !detected.request) {
      addAssistantMessage('Necesito el carro y lo que quiere diagnosticar el cliente. Ejemplo: Tesla Model 3 con falla de carga rapida y alerta de bateria.')
      return
    }

    setDiagnosticBrief(detected)
    addAssistantMessage(`Diagnostico base guardado: ${detected.vehicle}. Solicitud: ${detected.request}. Ya puedes abrir los demas espacios.`)
  }

  const openWorkspaces = () => {
    if (!diagnosticBrief) {
      validateDiagnostic()
      return
    }

    unlockChat()
    setCurrentPage('scanner')
    addAssistantMessage('Espacios abiertos. Te envie al Scanner EV para continuar con mediciones fisicas.')
  }

  const openDiagramModal = () => {
    if (diagnosticBrief) {
      setDiagramVehicle(diagnosticBrief.vehicle)
      setDiagramPrompt(diagnosticBrief.request)
    }
    setDiagramOpen(true)
  }

  const generateDiagram = (e) => {
    e.preventDefault()
    const vehicle = diagramVehicle.trim() || diagnosticBrief?.vehicle || 'Vehiculo EV'
    const request = diagramPrompt.trim() || diagnosticBrief?.request || 'diagnostico general'
    setDiagramResult({
      vehicle,
      request,
      model: diagramModel === 'nano-banana' ? 'Nano Banana' : 'Modelo gratuito local',
      createdAt: new Date(),
    })
  }

  const addAssistantMessage = (text) => {
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        text,
        sender: 'ai',
        timestamp: new Date()
      }
    ])
  }

  const generateAIResponse = (userText) => {
    const normalized = userText.toLowerCase()
    if (normalized.includes('bateria') || normalized.includes('carga')) {
      return 'Revisaria estado de carga, temperatura de celdas y balance del pack. Cuando tengas carro y solicitud listos, guarda el diagnostico y abre los espacios.'
    }
    if (normalized.includes('motor') || normalized.includes('ruido')) {
      return 'Para motor electrico conviene revisar vibracion, inversor y frecuencia. Puedo crear un diagrama del flujo de diagnostico si lo necesitas.'
    }
    const responses = [
      'Entendido. Dime marca, modelo, ano y sintoma principal del cliente.',
      'Anotado. Si tienes codigo de falla o alerta del tablero, pegalo aqui y lo agrego al diagnostico.',
      'Buen dato. Para abrir los espacios necesito confirmar carro y objetivo del diagnostico.',
      'Con esa informacion podemos pasar a scanner, mediciones, motor, energia y diagnostico.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="chat-title">
          <div className="chat-icon">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2>Asistente IA</h2>
            <p>Diagnostico para autos electricos</p>
          </div>
        </div>
        <div className="chat-live">
          <BatteryCharging className="w-4 h-4" />
          Conectado
        </div>
      </div>

      <div className="chat-actions">
        <button type="button" onClick={openDiagramModal} className="chat-action-button">
          <ImagePlus className="w-4 h-4" />
          Hacer diagrama
        </button>
        <button type="button" onClick={validateDiagnostic} className="chat-action-button">
          <FileCheck2 className="w-4 h-4" />
          Guardar diagnostico
        </button>
        <button type="button" onClick={openWorkspaces} className={`chat-action-button primary ${chatUnlocked ? 'unlocked' : ''}`}>
          <Unlock className="w-4 h-4" />
          Abrir espacios
        </button>
      </div>

      {diagnosticBrief && (
        <div className="diagnostic-brief">
          <Car className="w-4 h-4" />
          <span>{diagnosticBrief.vehicle}</span>
          <strong>{diagnosticBrief.request}</strong>
        </div>
      )}

      <div className="ai-chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.sender}`}>
            <div className="message-bubble">{msg.text}</div>
            <span className="message-time">
              {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {loading && (
          <div className="message message-ai">
            <div className="message-bubble typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="ai-chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: Tesla Model 3, cliente quiere diagnosticar falla de carga..."
        />
        <button type="submit" disabled={!input.trim() || loading} className="send-button" aria-label="Enviar mensaje">
          <Send className="w-4 h-4" />
        </button>
      </form>

      {diagramOpen && (
        <div className="diagram-modal-backdrop">
          <div className="diagram-modal">
            <div className="diagram-modal-header">
              <div>
                <span>Generador de diagrama</span>
                <h3>Crear flujo de diagnostico</h3>
              </div>
              <button type="button" onClick={() => setDiagramOpen(false)} aria-label="Cerrar diagrama">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={generateDiagram} className="diagram-form">
              <label>
                Modelo del carro
                <input value={diagramVehicle} onChange={(e) => setDiagramVehicle(e.target.value)} placeholder="Tesla Model 3 2022" />
              </label>

              <label>
                Que diagrama necesita
                <textarea value={diagramPrompt} onChange={(e) => setDiagramPrompt(e.target.value)} placeholder="Flujo de diagnostico para carga, bateria, inversor..." />
              </label>

              <label>
                Modelo generador
                <select value={diagramModel} onChange={(e) => setDiagramModel(e.target.value)}>
                  <option value="free-local">Modelo gratuito local</option>
                  <option value="nano-banana">Nano Banana cuando este conectado</option>
                </select>
              </label>

              <button type="submit" className="diagram-generate-button">
                <Bot className="w-4 h-4" />
                Generar diagrama
              </button>
            </form>

            {diagramResult && <DiagnosticDiagram diagram={diagramResult} />}
          </div>
        </div>
      )}
    </div>
  )
}

function DiagnosticDiagram({ diagram }) {
  return (
    <div className="diagram-result">
      <div className="diagram-result-meta">
        <strong>{diagram.vehicle}</strong>
        <span>{diagram.model}</span>
      </div>
      <div className="diagram-flow">
        <DiagramNode label="Cliente" detail={diagram.request} />
        <DiagramArrow />
        <DiagramNode label="Scanner EV" detail="Bluetooth / memoria fisica" />
        <DiagramArrow />
        <DiagramNode label="IA" detail="Prediccion y prioridades" />
        <DiagramArrow />
        <DiagramNode label="Accion" detail="Medir, reparar o derivar" />
      </div>
    </div>
  )
}

function DiagramNode({ label, detail }) {
  return (
    <div className="diagram-node">
      <strong>{label}</strong>
      <span>{detail}</span>
    </div>
  )
}

function DiagramArrow() {
  return <div className="diagram-arrow">{'->'}</div>
}

function extractDiagnosticBrief(text) {
  const normalized = text.trim()
  const vehiclePattern = /(tesla|byd|nissan|chevrolet|ford|hyundai|kia|bmw|audi|mercedes|renault|toyota|volkswagen|vw|model\s?[3ysx]|leaf|bolt|ioniq|kona|id\.?4|e-tron|zoe|mustang mach-e)[\w\s.-]{0,28}/i
  const requestPattern = /(diagnosticar|revisar|analizar|mirar|chequear|falla|problema|alerta|ruido|carga|bateria|motor|inversor|aire|ac|climatizacion)[\w\s,.-]{0,90}/i
  const vehicleMatch = normalized.match(vehiclePattern)
  const requestMatch = normalized.match(requestPattern)

  return {
    vehicle: vehicleMatch?.[0]?.trim() || '',
    request: requestMatch?.[0]?.trim() || '',
  }
}
