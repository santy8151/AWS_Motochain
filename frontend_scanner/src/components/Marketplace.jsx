import React, { useState } from 'react'
import { ShoppingCart, Zap, Star, ChevronRight, Search, SlidersHorizontal, Battery, Gauge, Shield, Tag, BatteryCharging, Bike, Car, ArrowRight, X, CheckCircle } from 'lucide-react'
import '../styles/Marketplace.css'

const PRODUCTS = [
  {
    id: 'moto-1', category: 'moto',
    name: 'Moto Eléctrica SS-X1', brand: 'SSScaner Motors',
    price: 5800, currency: 'USD',
    range: '180 km', power: '8 kW', charge: '3h',
    battery: 'LFP 72V 60Ah', rating: 4.8, reviews: 142,
    badge: 'Más vendido', badgeColor: 'green',
    specs: ['0-80 km/h en 4.2s', 'IP67 resistente al agua', 'App conectada BLE', 'Frenos regenerativos'],
    description: 'Moto urbana de alto rendimiento con diagnóstico integrado OBD-EV. Perfecta para ciudad y carretera.',
    img: 'moto',
  },
  {
    id: 'moto-2', category: 'moto',
    name: 'Moto EV Pro RS', brand: 'VoltRide',
    price: 8200, currency: 'USD',
    range: '260 km', power: '15 kW', charge: '2.5h',
    battery: 'NMC 96V 80Ah', rating: 4.6, reviews: 89,
    badge: 'Premium', badgeColor: 'gold',
    specs: ['Pantalla TFT 7"', 'Carga rápida DC 40A', 'GPS integrado', 'Modo Sport/Eco/City'],
    description: 'La moto eléctrica de alta gama con pantalla TFT y conectividad total. Para el piloto exigente.',
    img: 'moto-pro',
  },
  {
    id: 'bici-1', category: 'bici',
    name: 'E-Bike Urban Cargo', brand: 'GreenCycle',
    price: 1950, currency: 'USD',
    range: '90 km', power: '750 W', charge: '4h',
    battery: 'Li-ion 48V 20Ah', rating: 4.9, reviews: 312,
    badge: 'Nuevo', badgeColor: 'blue',
    specs: ['Motor mid-drive Bosch', 'Display Kiox 300', '9 velocidades Shimano', 'Portaequipaje 25kg'],
    description: 'Bicicleta eléctrica de carga ideal para última milla, delivery y uso diario con asistente al pedaleo.',
    img: 'bici',
  },
  {
    id: 'bici-2', category: 'bici',
    name: 'E-Bike MTB Extreme', brand: 'TrailVolt',
    price: 3400, currency: 'USD',
    range: '120 km', power: '1000 W', charge: '3.5h',
    battery: 'Li-ion 52V 28Ah', rating: 4.7, reviews: 67,
    badge: 'Off-road', badgeColor: 'orange',
    specs: ['Suspensión full 160mm', 'Frenos hidráulicos 4p', 'Neumáticos 29"x2.6"', 'Modos: Trail/Boost/ECO'],
    description: 'MTB eléctrica para terrenos extremos. Control de tracción inteligente y telemetría en tiempo real.',
    img: 'bici-mtb',
  },
  {
    id: 'auto-1', category: 'auto',
    name: 'EV Compacto City S', brand: 'UrbanWave EV',
    price: 24900, currency: 'USD',
    range: '340 km', power: '120 kW', charge: '45min',
    battery: 'NMC 60kWh', rating: 4.5, reviews: 34,
    badge: 'Pre-venta', badgeColor: 'purple',
    specs: ['Autopilot nivel 2', 'V2H bidireccional', 'ADAS completo', 'OTA updates'],
    description: 'Automóvil eléctrico compacto con historial verificado en blockchain. Carga rápida DC 150kW.',
    img: 'auto',
  },
  {
    id: 'moto-3', category: 'moto',
    name: 'Scooter EV-50 Urban', brand: 'FlashRide',
    price: 2200, currency: 'USD',
    range: '100 km', power: '3 kW', charge: '5h',
    battery: 'LFP 60V 30Ah', rating: 4.4, reviews: 223,
    badge: 'Económico', badgeColor: 'teal',
    specs: ['Baúl 35L integrado', 'USB-A/C en tablero', 'Alarma anti-robo', 'Luz LED full'],
    description: 'El scooter más práctico de la ciudad. Batería extraíble para carga en casa sin mover el vehículo.',
    img: 'scooter',
  },
]

const CATEGORY_ICONS = { moto: Car, bici: Bike, auto: Car }
const BADGE_STYLES = {
  green: 'bg-ssscaner-success/20 text-ssscaner-success border-ssscaner-success/40',
  gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  teal: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
}

export default function Marketplace() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [selected, setSelected] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [purchased, setPurchased] = useState(null)

  const filtered = PRODUCTS.filter(p => {
    const matchCat = filter === 'all' || p.category === filter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setSelected(null)
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const handleCheckout = () => {
    setPurchased(cart)
    setCart([])
    setCartOpen(false)
  }

  return (
    <div className="marketplace-container space-y-6">
      {/* Header */}
      <div className="marketplace-header">
        <div>
          <span className="text-ssscaner-primary/50 text-sm font-medium uppercase tracking-widest">EV Marketplace</span>
          <h1 className="text-3xl font-bold text-ssscaner-primary mt-1">Vehículos Eléctricos Certificados</h1>
          <p className="text-ssscaner-primary/60 mt-1">Cada vehículo con historial blockchain y diagnóstico SSScaner verificado</p>
        </div>
        <button onClick={() => setCartOpen(true)} className="cart-button relative">
          <ShoppingCart className="w-5 h-5" />
          <span>Carrito</span>
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </button>
      </div>

      {/* Trust bar */}
      <div className="trust-bar">
        {[
          { icon: Shield, label: 'Historial en Blockchain' },
          { icon: Zap, label: 'Diagnóstico SSScaner Incluido' },
          { icon: BatteryCharging, label: 'Batería Certificada' },
          { icon: CheckCircle, label: 'Garantía 12 meses' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="trust-item">
            <Icon className="w-4 h-4 text-ssscaner-primary" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="marketplace-filters">
        <div className="search-box">
          <Search className="w-4 h-4 text-ssscaner-primary/40" />
          <input
            type="text"
            placeholder="Buscar vehículo o marca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'moto', label: '🏍 Motos' },
            { id: 'bici', label: '🚲 Bicicletas' },
            { id: 'auto', label: '🚗 Autos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`filter-tab ${filter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="products-grid">
        {filtered.map(product => (
          <div key={product.id} className="product-card" onClick={() => setSelected(product)}>
            <div className="product-image">
              <ProductIllustration type={product.img} />
              <span className={`product-badge border ${BADGE_STYLES[product.badgeColor]}`}>
                {product.badge}
              </span>
            </div>
            <div className="product-body">
              <div className="product-meta">
                <span className="product-brand">{product.brand}</span>
                <div className="product-rating">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{product.rating}</span>
                  <span className="text-ssscaner-primary/30">({product.reviews})</span>
                </div>
              </div>
              <h3 className="product-name">{product.name}</h3>

              <div className="product-specs-mini">
                <span><Gauge className="w-3 h-3 inline mr-1" />{product.range}</span>
                <span><Zap className="w-3 h-3 inline mr-1" />{product.power}</span>
                <span><Battery className="w-3 h-3 inline mr-1" />{product.charge}</span>
              </div>

              <div className="product-footer">
                <div>
                  <span className="product-price">\${product.price.toLocaleString()}</span>
                  <span className="product-currency"> {product.currency}</span>
                </div>
                <button
                  className="btn-add-cart"
                  onClick={e => { e.stopPropagation(); addToCart(product) }}
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Search className="w-12 h-12 text-ssscaner-primary/20 mx-auto mb-3" />
          <p className="text-ssscaner-primary/40">No se encontraron vehículos</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              <X className="w-5 h-5" />
            </button>
            <div className="modal-image">
              <ProductIllustration type={selected.img} large />
              <span className={`product-badge border ${BADGE_STYLES[selected.badgeColor]}`}>{selected.badge}</span>
            </div>
            <div className="modal-body">
              <span className="product-brand">{selected.brand}</span>
              <h2 className="text-2xl font-bold text-ssscaner-primary mt-1">{selected.name}</h2>
              <p className="text-ssscaner-primary/60 mt-2 text-sm">{selected.description}</p>

              <div className="modal-specs">
                {[
                  { icon: Gauge, label: 'Autonomía', value: selected.range },
                  { icon: Zap, label: 'Potencia', value: selected.power },
                  { icon: BatteryCharging, label: 'Carga', value: selected.charge },
                  { icon: Battery, label: 'Batería', value: selected.battery },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="spec-box">
                    <Icon className="w-4 h-4 text-ssscaner-primary/50" />
                    <span className="spec-label">{label}</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="modal-features">
                <h4 className="text-sm font-semibold text-ssscaner-primary/70 mb-2">Características</h4>
                <ul className="space-y-1">
                  {selected.specs.map(s => (
                    <li key={s} className="flex items-center gap-2 text-sm text-ssscaner-primary/70">
                      <CheckCircle className="w-4 h-4 text-ssscaner-success flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal-scan-badge">
                <Zap className="w-4 h-4 text-ssscaner-primary" />
                <span>Diagnóstico SSScaner verificado incluido con la compra</span>
              </div>

              <div className="modal-footer">
                <div>
                  <span className="text-3xl font-bold text-ssscaner-primary">\${selected.price.toLocaleString()}</span>
                  <span className="text-ssscaner-primary/50 ml-1">{selected.currency}</span>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={() => addToCart(selected)}>
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h3 className="font-bold text-ssscaner-primary text-lg">Tu Carrito</h3>
              <button onClick={() => setCartOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart className="w-12 h-12 text-ssscaner-primary/20 mx-auto mb-3" />
                  <p className="text-ssscaner-primary/40 text-center">El carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-icon"><ProductIllustration type={item.img} small /></div>
                    <div className="cart-item-info">
                      <p className="font-semibold text-ssscaner-primary text-sm">{item.name}</p>
                      <p className="text-xs text-ssscaner-primary/50">\${item.price.toLocaleString()} × {item.qty}</p>
                    </div>
                    <div className="cart-item-right">
                      <span className="font-bold text-ssscaner-primary">\${(item.price * item.qty).toLocaleString()}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-ssscaner-danger/70 hover:text-ssscaner-danger">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span className="text-ssscaner-primary/70">Total</span>
                  <span className="text-2xl font-bold text-ssscaner-primary">\${total.toLocaleString()} USD</span>
                </div>
                <div className="cart-scan-note">
                  <Zap className="w-3 h-3" />
                  <span>Incluye diagnóstico SSScaner para cada vehículo</span>
                </div>
                <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleCheckout}>
                  Confirmar con Blockchain
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Toast */}
      {purchased && (
        <div className="success-toast">
          <CheckCircle className="w-5 h-5 text-ssscaner-success" />
          <div>
            <p className="font-semibold text-ssscaner-primary">¡Compra registrada en blockchain!</p>
            <p className="text-xs text-ssscaner-primary/60">{purchased.length} vehículo(s) — Diagnóstico SSScaner programado</p>
          </div>
          <button onClick={() => setPurchased(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  )
}

function ProductIllustration({ type, large, small }) {
  const size = large ? 'h-40' : small ? 'h-12 w-12' : 'h-32'
  const icons = {
    moto: '🏍️', 'moto-pro': '⚡🏍️', bici: '🚲', 'bici-mtb': '🚵', auto: '🚗', scooter: '🛵'
  }
  return (
    <div className={`product-illustration ${size} flex items-center justify-center text-6xl`}>
      {icons[type] || '⚡'}
    </div>
  )
}
