# ⚡ Motochain & SSScaner: E-Commerce Automotriz con Diagnóstico EV de Alto Nivel

Motochain & SSScaner redefine la confianza en el mercado de vehículos eléctricos (EV). Este proyecto **combina por primera vez un marketplace de E-commerce transaccional con una suite avanzada de escaneo y diagnóstico de hardware de alto nivel**. 

La innovación principal radica en **eliminar la asimetría de información** al comprar un vehículo usado: la plataforma no solo publica el vehículo y gestiona la compra (a través de tecnología Blockchain), sino que integra telemetría física real (aislamiento de alta tensión, termodinámica del sistema BTM, análisis del compresor) extraída directamente del vehículo mediante instrumentación de taller, evaluada con Inteligencia Artificial.

---

## 🚀 La Innovación: E-Commerce + Diagnóstico Profundo

En un mercado tradicional de vehículos eléctricos, el comprador debe confiar ciegamente en el estado de la batería y los sistemas de alta tensión. Nuestra solución une ambos mundos:

1. **Marketplace Seguro (Web3)**: Gestión de compras, historial de propietarios y transacciones seguras mediante Smart Contracts en Solidity.
2. **Scanner EV de Alta Tensión Integrado**: Interfaz en tiempo real que se conecta a instrumentación de taller (osciloscopios, manómetros) para evaluar el Aislamiento Dieléctrico ($R_{iso}$), el sistema HVAC/Chiller, y el inversor.
3. **Auditoría con IA y Machine Learning**: 5 nodos configurables evalúan anomalías mecánicas y eléctricas utilizando los datos recopilados por el escáner, dando un "Score de Salud" confiable al vehículo publicado.
4. **Seguridad de Nivel Taller (OTP)**: El acceso a las herramientas de escaneo y manipulación de parámetros críticos está restringido por un sistema de One-Time Password (OTP) de dos pasos.

---

## 🏛 Arquitectura Híbrida (Monorepo)

El proyecto está diseñado de forma modular, con capacidades para despliegue Cloud-Native (Vercel/AWS):

```text
AWS_Motochain/
├── frontend_scanner/     # (React + Vite + Zustand) 
│   ├── api/              # (FastAPI - Serverless backend unificado)
│   ├── src/              # Interfaz del E-Commerce y Consola del Escáner
│   └── vercel.json       # Configuración Zero-Config para despliegue en Vercel
│
├── smart-contracts/      # (Solidity + Hardhat)
│   └── contracts/        # Lógica Web3 para la venta de EVs
│
└── aws/                  # Plantillas de infraestructura nativa AWS (ECS, EC2, IAM)
```

## 🛠 Stack Tecnológico

- **Frontend**: React.js, Vite, Zustand, Tailwind CSS, Lucide Icons.
- **Backend**: Python, FastAPI, Pydantic (Preparado para entornos Serverless).
- **Inteligencia Artificial**: Nodos analíticos de Machine Learning para salud del Chiller/BTM.
- **Blockchain**: Ethereum, Solidity, Hardhat, Ethers.js.
- **Despliegue**: Vercel (Frontend & Serverless API), AWS (Infraestructura subyacente), Docker.

---

## 🔒 Seguridad e Integración OTP

Al fusionar la telemetría del escáner con el portal de E-commerce, garantizamos que solo técnicos autorizados u operadores validados puedan interactuar con la lectura de alta tensión:
- Al intentar acceder a la consola **Scanner EV**, el sistema invoca la ruta protegida `/api/v1/auth/otp/generate`.
- Se emite un código de un solo uso que el operario debe ingresar para iniciar la captura de métricas o telemetría en tiempo real.

---

## 💻 Ejecución Local

1. Instala las dependencias del frontend:
   ```bash
   cd frontend_scanner
   npm install
   ```
2. Inicia el servidor de desarrollo (Frontend):
   ```bash
   npm run dev
   ```
3. En otra terminal, levanta el backend localmente:
   ```bash
   cd frontend_scanner/api
   pip install -r ../requirements.txt
   uvicorn index:app --reload
   ```

## ☁️ Despliegue en Vercel

Este repositorio está optimizado para su despliegue nativo en Vercel (sin configuraciones *legacy*):
1. Configura el **Root Directory** a `frontend_scanner` en Vercel.
2. Vercel desplegará automáticamente la aplicación de Vite.
3. El directorio `api/` será detectado y FastAPI se servirá automáticamente a través de Vercel Serverless Functions.
4. (Importante) Configura la variable de entorno `VITE_API_URL` con tu dominio en producción.

---
*Desarrollado para transformar el ecosistema de compra y venta de Vehículos Eléctricos mediante evidencia técnica comprobable.*
