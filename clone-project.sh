#!/bin/bash

# Script para clonar o actualizar el proyecto desde GitHub
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
    error "Este script debe ejecutarse como root. Intenta 'sudo ./clone-project.sh'"
fi

log "Iniciando clonación o actualización del proyecto..."

# Directorio donde se clonará el proyecto
PROJECT_DIR="/opt/around-the-us"

# URL del repositorio de GitHub
REPO_URL="https://github.com/luxenherondale/web_project_around_express.git"

# Verificar si el directorio ya existe
if [ -d "$PROJECT_DIR" ]; then
    log "El directorio $PROJECT_DIR ya existe. Intentando actualizar el repositorio..."
    cd "$PROJECT_DIR" || error "No se pudo cambiar al directorio $PROJECT_DIR"
    if [ -d ".git" ]; then
        git pull origin main || warning "No se pudo actualizar el repositorio. Continuando..."
    else
        warning "El directorio existe pero no es un repositorio git. Se eliminará y clonará de nuevo."
        rm -rf "$PROJECT_DIR"
        git clone "$REPO_URL" "$PROJECT_DIR" || error "No se pudo clonar el repositorio"
    fi
else
    log "Clonando el repositorio en $PROJECT_DIR..."
    mkdir -p "$PROJECT_DIR" || error "No se pudo crear el directorio $PROJECT_DIR"
    git clone "$REPO_URL" "$PROJECT_DIR" || error "No se pudo clonar el repositorio"
fi

log "Clonación o actualización del proyecto completada."
log "El código fuente está ahora en $PROJECT_DIR"
log "Puedes proceder a reiniciar el backend si es necesario."
