# ──────────────────────────────────────────────────────
#  ElectroVault — Deploy a AWS S3 + CloudFront
#  Ejecuta: bash scripts/aws-deploy.sh
# ──────────────────────────────────────────────────────

#!/bin/bash
set -e

# ── CONFIGURACIÓN ── Edita estos valores
S3_BUCKET="electrovault-app"          # Nombre único de tu bucket S3
CLOUDFRONT_DISTRIBUTION_ID=""        # ID de distribución CloudFront (opcional)
AWS_REGION="us-east-1"               # Región de AWS
BUILD_DIR="./frontend"               # Directorio del frontend

echo "🚀 ElectroVault — Desplegando a AWS S3..."
echo "   Bucket: $S3_BUCKET"
echo "   Región: $AWS_REGION"
echo ""

# Verificar que aws cli está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI no encontrado. Instala con: brew install awscli"
    exit 1
fi

# Crear el bucket S3 si no existe
echo "📦 Verificando bucket S3..."
if ! aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q 'NoSuchBucket\|AccessDenied'; then
    echo "   Bucket ya existe ✓"
else
    echo "   Creando bucket..."
    aws s3 mb "s3://$S3_BUCKET" --region "$AWS_REGION"
fi

# Configurar el bucket para hosting web estático
echo "⚙️  Configurando hosting estático..."
aws s3 website "s3://$S3_BUCKET" \
    --index-document index.html \
    --error-document index.html

# Política de acceso público para el bucket
echo "🔓 Configurando política de acceso público..."
aws s3api put-bucket-policy \
    --bucket "$S3_BUCKET" \
    --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [{
            \"Sid\": \"PublicReadGetObject\",
            \"Effect\": \"Allow\",
            \"Principal\": \"*\",
            \"Action\": \"s3:GetObject\",
            \"Resource\": \"arn:aws:s3:::$S3_BUCKET/*\"
        }]
    }"

# Bloquear acceso público (descomenta si usas CloudFront)
# aws s3api put-public-access-block \
#     --bucket "$S3_BUCKET" \
#     --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Subir archivos del frontend
echo "📤 Subiendo archivos del frontend..."
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
    --exclude "node_modules/*" \
    --exclude ".env*" \
    --cache-control "max-age=86400" \
    --delete

# Forzar cache control para index.html (no cachear)
aws s3 cp "$BUILD_DIR/index.html" "s3://$S3_BUCKET/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

echo ""
echo "✅ Frontend desplegado exitosamente!"
echo "🌐 URL: http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"

# Invalidar caché de CloudFront si se configuró
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo ""
    echo "🔄 Invalidando caché de CloudFront..."
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*"
    echo "✅ Caché invalidado!"
    echo "🌐 CDN URL: https://$CLOUDFRONT_DISTRIBUTION_ID.cloudfront.net"
fi

echo ""
echo "🎉 ¡ElectroVault está live en AWS!"
