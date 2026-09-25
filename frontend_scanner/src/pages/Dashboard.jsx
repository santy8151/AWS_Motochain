import React, { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Zap, Activity, Wrench, Gauge, AlertTriangle, BarChart3, Cpu, LogOut, Menu, X, Car, ShieldCheck, BatteryCharging } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'
import Sidebar from '../components/Sidebar'
import AIChat from '../components/AIChat'
import ScannerPanel from '../components/ScannerPanel'
import BetaTools from '../components/BetaTools'
import DiagnosticPanel from '../components/DiagnosticPanel'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const { currentPage, setCurrentPage, chatUnlocked } = useAppStore()
  const { logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const pages = useMemo(() => ([
    { id: 'dashboard', label: 'Resumen', icon: Activity, locked: !chatUnlocked },
    { id: 'ai-chat', label: 'IA Chat', icon: MessageCircle, locked: false },
    { id: 'scanner', label: 'Scanner EV', icon: Zap, locked: !chatUnlocked },
    { id: 'beta', label: 'Espacio Beta', icon: Cpu, locked: false },
    { id: 'frequency', label: 'Frecuencia', icon: Gauge, locked: !chatUnlocked },
    { id: 'ac-measure', label: 'Medida AC', icon: Activity, locked: !chatUnlocked },
    { id: 'motor', label: 'Motor', icon: Wrench, locked: !chatUnlocked },
    { id: 'energy', label: 'Bateria y fugas', icon: AlertTriangle, locked: !chatUnlocked },
    { id: 'diagnostics', label: 'Diagnostico', icon: BarChart3, locked: !chatUnlocked },
  ]), [chatUnlocked])

  useEffect(() => {
    const selected = pages.find((page) => page.id === currentPage)
    if (selected?.locked) {
      setCurrentPage('ai-chat')
    }
  }, [currentPage, pages, setCurrentPage])

  return (
    <div className="dashboard-container">
      <Sidebar
        pages={pages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={logout}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main className="main-content">
        <div className="top-bar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle md:hidden" aria-label="Abrir menu">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="top-bar-title">
            <span>Escena 2</span>
            <strong>Consola EV</strong>
          </div>

          <div className="flex items-center gap-4">
            <div className="top-status">
              <BatteryCharging className="w-4 h-4" />
              Beta activo
            </div>
            <button onClick={() => logout()} className="logout-icon" title="Cerrar sesion">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="page-container">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'ai-chat' && <AIChat />}
          {currentPage === 'scanner' && <ScannerPanel />}
          {currentPage === 'beta' && <BetaTools />}
          {currentPage === 'diagnostics' && <DiagnosticPanel />}
          {['frequency', 'ac-measure', 'motor', 'energy'].includes(currentPage) && <MeasurementPanel type={currentPage} />}
        </div>
      </main>
    </div>
  )
}

function DashboardPage() {
  return (
    <div className="dashboard-home">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Laboratorio electrico</span>
          <h1>Control moderno para diagnostico EV</h1>
          <p>Monitorea conversaciones, lecturas beta y estados de vehiculos electricos desde una consola enfocada.</p>
        </div>
        <div className="hero-car-mark">
          <Car className="w-12 h-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Vehiculos" value="3" icon={Zap} />
        <MetricCard label="Diagnosticos" value="47" icon={Activity} />
        <MetricCard label="Accuracy" value="91.8%" icon={BarChart3} />
        <MetricCard label="Estado" value="Online" icon={ShieldCheck} status="ok" />
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, status = 'default' }) {
  const statusColors = {
    ok: 'border-ssscaner-success/50',
    warning: 'border-ssscaner-warning/50',
    error: 'border-ssscaner-danger/50',
    default: 'border-ssscaner-primary/50'
  }

  return (
    <div className={`metric-box border ${statusColors[status]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ssscaner-primary/70 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-ssscaner-primary mt-2">{value}</p>
        </div>
        <Icon className="w-6 h-6 text-ssscaner-primary/50" />
      </div>
    </div>
  )
}

function MeasurementPanel({ type }) {
  const titles = {
    'frequency': 'Medicion de Frecuencia',
    'ac-measure': 'Medicion AC',
    'motor': 'Medicion Motor',
    'energy': 'Analisis de Fugas de Energia'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ssscaner-primary">{titles[type]}</h1>
      <div className="card">
        <p className="text-ssscaner-primary/70">Conecta tu scanner Bluetooth para comenzar mediciones en esta seccion.</p>
        <button className="btn-primary mt-4">Conectar Scanner</button>
      </div>
    </div>
  )
}
