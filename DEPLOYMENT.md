# 🚀 Guía de Despliegue - IoT Dashboard

Esta guía contiene instrucciones detalladas para desplegar la aplicación en diferentes entornos.

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Despliegue Local](#despliegue-local)
- [Despliegue con Docker](#despliegue-con-docker)
- [Despliegue en Linux (Servidor Tradicional)](#despliegue-en-linux-servidor-tradicional)
- [Despliegue en la Nube](#despliegue-en-la-nube)
- [Verificación Post-Despliegue](#verificación-post-despliegue)
- [Troubleshooting](#troubleshooting)

## Requisitos

- Node.js >= 16.x
- npm >= 8.x
- Git
- Backend Spring ejecutándose

## Despliegue Local

### 1. Clonar y Instalar

```bash
git clone https://github.com/tu-usuario/iot-dashboard.git
cd iot-dashboard
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar `.env` y configurar `VITE_API_BASE_URL` con la URL del backend:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Acceder a `http://localhost:5173`

### 4. Compilar para Producción

```bash
npm run build
npm run preview
```

## Despliegue con Docker

### Opción 1: Dockerfile Individual

#### Construir imagen

```bash
docker build -t iot-dashboard:latest .
```

#### Ejecutar contenedor

```bash
docker run -d \
  --name iot-dashboard \
  -p 80:80 \
  -e VITE_API_BASE_URL=http://backend:8080 \
  iot-dashboard:latest
```

#### Ver logs

```bash
docker logs -f iot-dashboard
```

#### Detener contenedor

```bash
docker stop iot-dashboard
docker rm iot-dashboard
```

### Opción 2: Docker Compose (Recomendado)

#### Clonar y configurar

```bash
git clone https://github.com/tu-usuario/iot-dashboard.git
cd iot-dashboard
```

#### Editar `docker-compose.yml` si es necesario

```bash
nano docker-compose.yml
```

#### Iniciar servicios

```bash
docker-compose up -d
```

#### Ver logs

```bash
docker-compose logs -f iot-dashboard
```

#### Detener servicios

```bash
docker-compose down
```

#### Reconstruir imagen

```bash
docker-compose down
docker-compose up -d --build
```

## Despliegue en Linux (Servidor Tradicional)

### Requisitos Previos

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Nginx
sudo apt install -y nginx

# Instalar Git
sudo apt install -y git
```

### Paso 1: Clonar y Preparar Aplicación

```bash
cd /home/usuario
git clone https://github.com/tu-usuario/iot-dashboard.git
cd iot-dashboard

# Instalar dependencias
npm install

# Compilar
npm run build
```

### Paso 2: Copiar Archivos a Nginx

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/iot-dashboard

# Copiar archivos compilados
sudo cp -r dist/* /var/www/iot-dashboard/

# Asignar permisos
sudo chown -R www-data:www-data /var/www/iot-dashboard
sudo chmod -R 755 /var/www/iot-dashboard
```

### Paso 3: Configurar Nginx

```bash
# Copiar configuración
sudo cp nginx.conf /etc/nginx/sites-available/iot-dashboard

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/iot-dashboard /etc/nginx/sites-enabled/iot-dashboard

# Eliminar configuración por defecto si existe
sudo rm /etc/nginx/sites-enabled/default

# Verificar sintaxis
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 4: Configurar SSL con Let's Encrypt (Opcional pero Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generar certificado
sudo certbot --nginx -d tudominio.com

# Auto renovación
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Paso 5: Configurar Auto-actualización (Opcional)

Crear script de actualización:

```bash
sudo nano /usr/local/bin/update-iot-dashboard.sh
```

```bash
#!/bin/bash
cd /home/usuario/iot-dashboard
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/iot-dashboard/
sudo chown -R www-data:www-data /var/www/iot-dashboard
```

Hacer ejecutable y configurar cron:

```bash
sudo chmod +x /usr/local/bin/update-iot-dashboard.sh
crontab -e

# Agregar línea para ejecutar diariamente a las 2 AM
0 2 * * * /usr/local/bin/update-iot-dashboard.sh
```

## Despliegue en la Nube

### Vercel

```bash
# Instalar CLI
npm install -g vercel

# Desplegar
vercel

# Producción
vercel --prod
```

### Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Conectar e iniciar despliegue
netlify init

# Desplegar
netlify deploy

# Producción
netlify deploy --prod
```

### AWS S3 + CloudFront

```bash
# Instalar AWS CLI
pip install awscli

# Configurar credenciales
aws configure

# Compilar
npm run build

# Subir a S3
aws s3 sync dist/ s3://tu-bucket/iot-dashboard/

# Invalidar CloudFront (si está configurado)
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths "/*"
```

### Google Cloud Storage

```bash
# Instalar Google Cloud CLI
curl https://sdk.cloud.google.com | bash

# Compilar
npm run build

# Subir a GCS
gsutil -m cp -r dist/* gs://tu-bucket/iot-dashboard/
```

## Verificación Post-Despliegue

### 1. Verificar Accesibilidad

```bash
# Curl básico
curl -I https://tudominio.com

# Response esperado: 200 OK
```

### 2. Probar Conectividad con Backend

```bash
# En la consola del navegador (F12)
curl('http://api.tudominio.com/sensors')
```

### 3. Verificar HTTPS y Headers de Seguridad

```bash
curl -I https://tudominio.com

# Verificar headers de seguridad presentes
```

### 4. Monitoreo de Performance

- Google Lighthouse: `https://developers.google.com/web/tools/lighthouse`
- Pagespeed Insights: `https://pagespeed.web.dev`
- WebPageTest: `https://webpagetest.org`

## Troubleshooting

### Error 502 Bad Gateway

```bash
# Verificar Nginx está corriendo
sudo systemctl status nginx

# Revisar logs
sudo tail -f /var/log/nginx/error.log
```

### CORS Error

Backend debe incluir headers:

```java
@CrossOrigin(origins = "https://tudominio.com")
```

### 503 Service Unavailable

```bash
# Verificar backend está corriendo
curl http://backend-api:8080/health

# Verificar DNS
nslookup tudominio.com
```

### Aplicación Carga en Blanco

```bash
# En consola del navegador (F12)
# Buscar errores de red o JS

# Verificar dist/ compilado correctamente
ls -la dist/

# Verificar index.html existe
cat dist/index.html
```

### Cache Viejo después de Deploy

```bash
# Limpiar cache Nginx
sudo systemctl reload nginx

# En navegador: Ctrl+Shift+Delete y limpiar cache
```

## Mantenimiento

### Logs Regulares

```bash
# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Docker
docker logs -f iot-dashboard
```

### Actualizaciones

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Compilar nuevamente
npm run build
```

### Backups

```bash
# Backup de código
tar -czf iot-dashboard-backup.tar.gz /home/usuario/iot-dashboard

# Backup de configuración
tar -czf nginx-config-backup.tar.gz /etc/nginx/

# Subir a almacenamiento remoto
scp iot-dashboard-backup.tar.gz usuario@backup-server:/backups/
```

---

Para más ayuda, revisar el [README.md](README.md) principal o abrir un [issue](https://github.com/tu-usuario/iot-dashboard/issues).

