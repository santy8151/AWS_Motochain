# ⚡ ElectroVault — Blockchain Marketplace de Vehículos Eléctricos

> Compra y vende automóviles, motos y bicicletas eléctricas con criptomonedas en Ethereum.  
> Smart contracts en Solidity · Frontend web · Deploy en AWS S3

![Deploy](https://img.shields.io/github/actions/workflow/status/TU_USUARIO/electrovault/deploy.yml?label=AWS%20Deploy)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue?logo=solidity)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple?logo=ethereum)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🏗️ Arquitectura

```
electrovault/
├── contracts/
│   └── ElectroVaultMarketplace.sol    ← Smart contract principal (Solidity)
├── scripts/
│   ├── deploy.js                      ← Script de despliegue a Ethereum
│   └── aws-deploy.sh                  ← Script de deploy a AWS S3
├── test/
│   └── ElectroVaultMarketplace.test.js ← Tests con Hardhat + Chai
├── frontend/
│   └── index.html                     ← Web app (Vanilla JS + Web3)
├── .github/
│   └── workflows/
│       └── deploy.yml                 ← CI/CD: GitHub Actions → AWS S3
├── hardhat.config.js
├── package.json
└── .env.example
```

---

## ✨ Funcionalidades del Smart Contract

| Función | Descripción |
|---|---|
| `listVehicle()` | Publica un vehículo eléctrico con precio en ETH |
| `purchaseVehicle()` | Compra un vehículo — transfiere ETH al vendedor |
| `updatePrice()` | El vendedor puede actualizar el precio |
| `removeVehicle()` | Retirar un vehículo del marketplace |
| `verifyVehicle()` | Admin puede marcar vehículos como verificados |
| `setPlatformFee()` | Admin ajusta la comisión (máx. 10%) |
| `withdrawFees()` | Admin retira comisiones acumuladas |

**Eventos on-chain:** `VehicleListed`, `VehiclePurchased`, `PriceUpdated`, `VehicleVerified`

---

## 🚀 Instalación rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/electrovault.git
cd electrovault
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Edita .env con tus claves
```

### 3. Compilar y probar el contrato
```bash
npm run compile    # Compila el contrato Solidity
npm test           # Ejecuta los tests
```

### 4. Desplegar localmente
```bash
# Terminal 1: levantar nodo local
npm run node

# Terminal 2: desplegar contrato
npm run deploy:local
```

### 5. Abrir el frontend
```bash
# Simplemente abre en tu navegador:
open frontend/index.html
```

---

## 🌐 Deploy a Ethereum (Testnet)

### Prerequisitos
1. Crea una cuenta en [Alchemy](https://alchemy.com) y obtén una API key
2. Consigue ETH de testnet en [Sepolia Faucet](https://sepoliafaucet.com)
3. Exporta la clave privada de tu wallet de desarrollo (¡NUNCA uses tu wallet principal!)

```bash
# Desplegar a Sepolia testnet
npm run deploy:sepolia

# Verificar el contrato en Etherscan
npx hardhat verify --network sepolia DIRECCION_DEL_CONTRATO
```

---

## ☁️ Deploy a AWS S3

### Opción A: Script manual
```bash
# Configura tus credenciales de AWS
aws configure

# Ejecutar deploy
bash scripts/aws-deploy.sh
```

### Opción B: GitHub Actions (automático)
Configura estos **secrets** en tu repositorio de GitHub:  
`Settings → Secrets and variables → Actions`

| Secret | Descripción |
|---|---|
| `AWS_ACCESS_KEY_ID` | Clave de acceso de IAM user |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta de IAM user |
| `CLOUDFRONT_DISTRIBUTION_ID` | (Opcional) Para invalidar caché CDN |
| `DEPLOYER_PRIVATE_KEY` | Clave privada para deploy del contrato |
| `SEPOLIA_RPC_URL` | URL de Alchemy/Infura para Sepolia |
| `ETHERSCAN_API_KEY` | Para verificación del contrato |

Cada push a `main` dispara automáticamente el deploy a S3. 🎉

---

## 🔧 Integrar MetaMask con el contrato desplegado

Después del deploy, actualiza `CONTRACT_ADDRESS` en `frontend/index.html`:

```javascript
// frontend/index.html línea ~430
const CONTRACT_ADDRESS = "0xTU_DIRECCION_DEL_CONTRATO";
```

---

## 🧪 Tests

```bash
npm test                  # Todos los tests
npm run test:coverage     # Reporte de cobertura
```

El contrato incluye tests para:
- ✅ Despliegue correcto
- ✅ Publicar vehículos con validaciones
- ✅ Compra con transferencia de fondos
- ✅ Cálculo correcto de fees
- ✅ Devolución de exceso de ETH
- ✅ Control de acceso (solo vendedor, solo owner)
- ✅ Prevención de reentrancy

---

## 📋 Redes soportadas

| Red | Uso | Chain ID |
|---|---|---|
| Localhost (Hardhat) | Desarrollo | 31337 |
| Ethereum Sepolia | Testing | 11155111 |
| Polygon Mumbai | Testing (gas barato) | 80001 |
| Ethereum Mainnet | Producción | 1 |

---

## 🔐 Seguridad

- **ReentrancyGuard** — Protección contra ataques de reentrada
- **Ownable** — Control de acceso para funciones de admin
- **Checks-Effects-Interactions** — Patrón seguro para transferencias
- **Input validation** — Validación estricta de todos los parámetros

---

## 📄 Licencia

MIT © ElectroVault

---

> **⚠️ Disclaimer:** Este proyecto es educativo. Para producción, se recomienda una auditoría de seguridad del smart contract.
