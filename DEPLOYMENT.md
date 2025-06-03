# Guía de Despliegue en Google Cloud

Esta guía detalla los pasos necesarios para desplegar la aplicación "Around the U.S." en un servidor de Google Cloud Platform.

## Información del Servidor

- **IP Pública**: 34.136.30.19
- **Dominios**:
  - Frontend: www.arounadaly.mooo.com
  - API: api.backaround.mooo.com

## Requisitos Previos

1. Acceso SSH al servidor de Google Cloud
2. Conocimientos básicos de línea de comandos Linux
3. Dominios configurados para apuntar a la IP del servidor

## Pasos para el Despliegue

### 1. Conectarse al Servidor

```bash
ssh usuario@34.136.30.19
```

### 2. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Instalar Dependencias

```bash
# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MongoDB
sudo apt install -y mongodb
sudo systemctl enable mongodb
sudo systemctl start mongodb

# Instalar Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Certbot para SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 4. Clonar el Repositorio

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/luxenherondale/web_project_api_full.git
cd web_project_api_full
```

### 5. Configurar el Backend

```bash
cd backend
npm install

# Crear archivo .env
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)
EOF
```

### 6. Configurar el Frontend

```bash
cd ../frontend
npm install
npm run build
```

### 7. Configurar Nginx

```bash
# Crear archivo de configuración para Nginx
sudo cp ~/projects/web_project_api_full/nginx.conf /etc/nginx/sites-available/around.conf

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/around.conf /etc/nginx/sites-enabled/

# Verificar la configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 8. Configurar SSL con Certbot

```bash
# Obtener certificados SSL para ambos dominios
sudo certbot --nginx -d www.arounadaly.mooo.com -d api.backaround.mooo.com
```

### 9. Iniciar la Aplicación con PM2

```bash
cd ~/projects/web_project_api_full
pm2 start ecosystem.config.js

# Configurar PM2 para iniciar automáticamente al reiniciar
pm2 save
pm2 startup
```

### 10. Verificar el Despliegue

1. Visitar https://www.arounadaly.mooo.com para verificar el frontend
2. Visitar https://api.backaround.mooo.com/crash-test para probar el backend

### 11. Eliminar la Ruta de Prueba de Caída

Una vez verificado que todo funciona correctamente, elimina la ruta `/crash-test` del archivo `app.js` en el backend:

```bash
cd ~/projects/web_project_api_full/backend
# Editar app.js para eliminar la ruta /crash-test
pm2 restart around-backend
```

## Solución de Problemas

### Verificar Logs

```bash
# Logs de PM2
pm2 logs

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs de la aplicación
tail -f ~/projects/web_project_api_full/backend/logs/request.log
tail -f ~/projects/web_project_api_full/backend/logs/error.log
```

### Reiniciar Servicios

```bash
# Reiniciar MongoDB
sudo systemctl restart mongodb

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar la aplicación
pm2 restart around-backend
```

## Mantenimiento

### Actualizar la Aplicación

```bash
cd ~/projects/web_project_api_full
git pull

# Actualizar backend
cd backend
npm install

# Actualizar frontend
cd ../frontend
npm install
npm run build

# Reiniciar la aplicación
pm2 restart around-backend
```

### Monitoreo con PM2

```bash
# Ver estado de las aplicaciones
pm2 status

# Monitoreo en tiempo real
pm2 monit
```
