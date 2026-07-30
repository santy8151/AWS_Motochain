# ⚡ ElectroVault
## Blockchain Marketplace para Vehículos Eléctricos sobre AWS

ElectroVault es una plataforma moderna para la compra y venta de vehículos eléctricos utilizando tecnología blockchain sobre Ethereum.

El proyecto fue diseñado con una arquitectura escalable basada en **Onion Architecture**, preparada para ejecutarse mediante **Docker** y desplegarse en **Amazon Web Services (AWS)**.

El objetivo principal es demostrar conocimientos en:

- ☁️ AWS Cloud Practitioner
- 🔗 Blockchain (Solidity + Ethereum)
- 🐳 Docker
- ⚡ FastAPI
- 🏗️ Arquitectura Onion
- 🔒 Seguridad Web3
- 🚀 CI/CD con GitHub Actions

---

# 🚀 Tecnologías

## Backend

- FastAPI
- Python 3.12
- SQLAlchemy
- JWT Authentication
- Onion Architecture

## Blockchain

- Solidity
- Hardhat
- Ethers.js
- OpenZeppelin
- MetaMask

## Frontend

- HTML5
- CSS3
- JavaScript
- Web3.js

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- Nginx

## AWS

- Amazon EC2
- Amazon ECS
- Amazon S3
- Amazon IAM
- Amazon CloudWatch
- Amazon ECR
- Amazon CloudFront
- AWS Secrets Manager
- AWS Parameter Store

---

# 🏛 Arquitectura

```
AWS-MotoChain/

backend/
│
├── src/
│   ├── Domain/
│   ├── Application/
│   ├── Infrastructure/
│   └── Presentation/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── profiles/
│   ├── menu/
│   ├── purchases/
│   ├── stock/
│   ├── sales/
│   ├── scraper/
│   └── blockchain/
│
├── Dockerfile
└── docker-compose.yml

frontend/

smart-contracts/

aws/

docs/

.github/
```

La aplicación implementa **Onion Architecture**, separando completamente:

- Dominio
- Casos de uso
- Infraestructura
- Presentación

permitiendo desacoplamiento, escalabilidad y facilidad para realizar pruebas.

---

# 📦 Módulos

El backend está dividido en módulos independientes.

```
Auth

Gestión de Usuarios

Perfiles

Inventario

Compras

Ventas

Menús

Blockchain

Scraper

Dashboard
```

Cada módulo contiene:

```
controllers/

services/

repositories/

schemas/

models/

validators/

routes/
```

---

# 🔗 Blockchain

El sistema incorpora contratos inteligentes desarrollados en Solidity para administrar el marketplace.

## Funcionalidades

✅ Publicar vehículos

✅ Comprar con ETH

✅ Historial de propietarios

✅ Registro de mantenimientos

✅ Vehículos verificados

✅ Comisión configurable

✅ Protección Reentrancy

---

# ⛽ Optimización de Gas

Los contratos fueron diseñados siguiendo buenas prácticas para minimizar costos:

- uso de eventos
- almacenamiento mínimo
- structs optimizados
- validaciones tempranas
- OpenZeppelin Security

---

# ☁ Arquitectura AWS

El proyecto está preparado para desplegarse sobre AWS.

```
Internet

↓

CloudFront

↓

Amazon S3
(Frontend)

↓

Application Load Balancer

↓

Amazon ECS

↓

FastAPI

↓

Amazon RDS

↓

Smart Contract Ethereum
```

Servicios contemplados:

- Amazon ECS
- Amazon EC2
- Amazon S3
- Amazon ECR
- IAM
- CloudWatch
- Secrets Manager
- CloudFront

---

# 🐳 Docker

El proyecto incluye:

- Dockerfile
- docker-compose
- Variables de entorno
- Healthcheck
- Multi-stage Build

Ejecutar:

```bash
docker compose up --build
```

---

# ⚡ FastAPI

Se implementó un microservicio independiente para consulta de precios de motocicletas.

Ejemplo:

```
GET /prices/yamaha

GET /prices/honda

GET /prices/suzuki
```

El servicio consulta información pública de mercado (respetando los términos de uso de cada sitio) y permite acceder directamente a publicaciones relacionadas mediante un botón con enlace a Mercado Libre.

---

# 🔒 Autenticación

JWT Authentication

Roles:

- Administrador
- Comprador
- Vendedor

---

# 🚀 CI/CD

GitHub Actions automatiza:

✔ Build

✔ Tests

✔ Docker Build

✔ Deploy AWS

---

# 📁 Documentación

```
docs/

architecture.md

deployment.md

aws.md

api.md

security.md
```

---

# 🧪 Testing

```bash
npm test

pytest

coverage
```

Incluye pruebas para:

- Smart Contracts
- API
- Servicios
- Repositorios

---

# 🔮 Roadmap

- [x] Marketplace Blockchain
- [x] Docker
- [x] Onion Architecture
- [x] FastAPI
- [x] AWS Ready
- [ ] Terraform
- [ ] Amazon Cognito
- [ ] Amazon API Gateway
- [ ] AWS Lambda
- [ ] Kubernetes (EKS)
- [ ] Monitoreo con Prometheus y Grafana

---

# 📄 Licencia

MIT License

---

# 👨‍💻 Autor

Desarrollado como proyecto académico y de portafolio para demostrar competencias en:

- AWS Cloud Practitioner
- Blockchain
- Backend Development
- Cloud Computing
- DevOps
- Arquitectura de Software

---

> **Nota:** Este proyecto tiene fines educativos y de demostración. Las integraciones con AWS y Ethereum están preparadas para facilitar un despliegue real, pero requieren configurar credenciales, infraestructura y recursos antes de usarse en producción.
