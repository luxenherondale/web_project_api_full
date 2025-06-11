#!/bin/bash

# Script para reiniciar el backend y aplicar los cambios
# Autor: Cascade
# Fecha: 2025-06-11

# Color codes para mejor legibilidad
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ADVERTENCIA: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar si se está ejecutando como root
if [ "$(id -u)" -ne 0 ]; then
    error "Este script debe ejecutarse como root. Intenta 'sudo ./restart-backend.sh'"
fi

# Directorio del proyecto
PROJECT_DIR="/opt/around-the-us"
BACKEND_DIR="${PROJECT_DIR}/backend"

log "Iniciando reinicio del backend de Around the U.S."

# Verificar si el directorio del backend existe
if [ ! -d "$BACKEND_DIR" ]; then
    error "El directorio del backend no existe en $BACKEND_DIR"
fi

# Cambiar al directorio del backend
cd "$BACKEND_DIR" || error "No se pudo acceder al directorio $BACKEND_DIR"

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    warning "PM2 no está instalado. Instalando..."
    npm install -g pm2 || error "No se pudo instalar PM2"
fi

# Detener el backend si está en ejecución
log "Deteniendo el backend..."
pm2 stop around-backend || warning "No se pudo detener el backend, posiblemente no estaba en ejecución"

# Configurar el entorno para desarrollo (opcional)
log "Configurando el entorno para desarrollo..."
echo "NODE_ENV=development
JWT_SECRET=clave-secreta" > .env

# Reiniciar el backend
log "Reiniciando el backend..."
pm2 start ../ecosystem.config.js || error "No se pudo iniciar el backend"

# Guardar la configuración de PM2
pm2 save || warning "No se pudo guardar la configuración de PM2"

# Verificar el estado del backend
log "Verificando el estado del backend..."
pm2 status around-backend

# Probar la ruta de salud para verificar que el servidor está funcionando
log "Probando la ruta de salud del servidor..."
curl -s http://localhost:3000/health || warning "No se pudo acceder a la ruta de salud"

log "Reinicio del backend completado."
log "Ahora puedes acceder a las páginas de registro e inicio de sesión sin restricciones."
log "Frontend: https://www.arounadaly.mooo.com"
log "API: https://api.backaround.mooo.com"
