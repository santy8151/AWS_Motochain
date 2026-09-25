#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  ElectroVault — Configurar y subir a GitHub
#  Uso: bash scripts/github-setup.sh TU_USUARIO_GITHUB
# ─────────────────────────────────────────────────────────────────

GITHUB_USER=${1:-"TU_USUARIO_GITHUB"}
REPO_NAME="electrovault"

echo "🚀 Configurando ElectroVault para GitHub..."
echo "   Usuario: $GITHUB_USER"
echo "   Repo:    $REPO_NAME"
echo ""

# Inicializar git si no está inicializado
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositorio Git..."
    git init
    git branch -M main
fi

# Configurar remote
echo "🔗 Configurando remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Primer commit
echo "📝 Creando commit inicial..."
git add .
git commit -m "🚀 feat: ElectroVault — Blockchain marketplace para vehículos eléctricos

- Smart contract ElectroVaultMarketplace en Solidity 0.8.20
- Soporte para automóviles, motos y bicicletas eléctricas
- Compra/venta con ETH mediante smart contracts seguros
- Frontend web con integración MetaMask
- Tests completos con Hardhat + Chai
- Deploy automatizado a AWS S3 con GitHub Actions
- Scripts de despliegue para Ethereum Sepolia/Mainnet"

echo ""
echo "✅ Repositorio listo para subir a GitHub."
echo ""
echo "📌 Pasos siguientes:"
echo "   1. Crea el repositorio en https://github.com/new"
echo "      Nombre: $REPO_NAME"
echo "      Visibilidad: Public o Private"
echo "      ⚠️  NO inicialices con README (ya tenemos uno)"
echo ""
echo "   2. Luego ejecuta:"
echo "      git push -u origin main"
echo ""
echo "   3. Configura los Secrets en GitHub:"
echo "      Settings → Secrets → Actions"
echo "      → AWS_ACCESS_KEY_ID"
echo "      → AWS_SECRET_ACCESS_KEY"
echo "      → DEPLOYER_PRIVATE_KEY"
echo "      → SEPOLIA_RPC_URL"
echo ""
echo "🎉 ¡Listo! Cada push a main desplegará automáticamente a AWS."
