import React from 'react'
import { Lock, X, LogOut, Sparkles } from 'lucide-react'
import CarModel360 from './CarModel360'
import '../styles/Sidebar.css'

export default function Sidebar({ pages, currentPage, setCurrentPage, onLogout, open, setOpen }) {
  const activePages = pages.filter((page) => !page.locked).length

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="sidebar-logo">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-ssscaner-primary text-lg">SSSCANER</h1>
              <p className="text-xs text-ssscaner-primary/50">Electric Mobility Lab</p>
            </div>
          </div>
          <button className="close-button md:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menu">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Menu lateral</div>
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  if (page.locked) return
                  setCurrentPage(page.id)
                  setOpen(false)
                }}
                disabled={page.locked}
                className={`nav-item ${currentPage === page.id ? 'active' : ''} ${page.locked ? 'locked' : ''}`}
                title={page.locked ? 'Espacio bloqueado en esta beta' : page.label}
              >
                <div className="nav-item-content">
                  <page.icon className="w-6 h-6" />
                  <div className="nav-item-text">
                    <span className="nav-item-label">{page.label}</span>
                    <span className="nav-item-desc">
                      {page.locked ? 'Bloqueado' : page.id === 'ai-chat' ? 'Chat inteligente con IA' : 'Zona beta disponible'}
                    </span>
                  </div>
                </div>
                {page.locked && <Lock className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="workspace-card">
            <CarModel360 />
            <div className="workspace-card-header">
              <span>Workspace</span>
              <strong>SSSCANER Lab</strong>
            </div>
            <div className="workspace-connections">
              <span>RAG</span>
              <span>MCP</span>
              <span>OpenRouter</span>
              <span>HuggingFace</span>
              <span>OpenCode</span>
            </div>
            <div className="workspace-status">
              <span>{activePages} espacios activos</span>
              <strong>{activePages > 2 ? 'Conectado' : 'IA + Beta'}</strong>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)}></div>}
    </>
  )
}
