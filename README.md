# 🌱 IoT Dashboard - Agrotech

[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.18-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> Dashboard interactivo en tiempo real para monitoreo de sistemas de riego industrial mediante sensores IoT. Conectado con backend Spring para consulta de información de sectores, sensores y lecturas.

## 📋 Descripción

**Agrotech IoT Dashboard** es una aplicación web moderna construida con React y Vite que proporciona:

- 📊 Visualización en tiempo real de datos de sensores IoT
- 🌾 Monitoreo de sectores industriales y sistemas de riego (balsas)
- 📈 Gráficas interactivas con datos históricos de lecturas
- ⚙️ Control de actuadores (válvulas, motores, etc.)
- 🎨 Interfaz responsive y moderna con Tailwind CSS
- 🔄 Integración REST con backend Spring
- 📱 Diseño mobile-first

## 🚀 Características

- ✅ Dashboard principal con esquema visual de balsas industriales
- ✅ Panel de sectores con información detallada
- ✅ Detalles de sensores con gráficas históricas
- ✅ Control manual de actuadores
- ✅ Predicción del tiempo integrada
- ✅ Interfaz intuitiva y responsiva
- ✅ Manejo de errores y estados de carga

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu sistema:

- **Node.js** >= 16.x ([Descargar](https://nodejs.org/))
- **npm** >= 8.x (incluido con Node.js)
- **Backend Spring** ejecutándose en `http://localhost:8080` (o configurable)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/iot-dashboard.git
cd iot-dashboard
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Verificar instalación

```bash
npm list
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL del backend Spring
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=10000

# Configuración de la aplicación
VITE_APP_NAME=Agrotech IoT Dashboard
VITE_APP_VERSION=1.0.0

# Modo de desarrollo/producción
VITE_MODE=development
```

### Configurar URL del Backend

**Para desarrollo**, edita `src/api/apiservice.jsx`:

```javascript
const API_BASE_URL = 'http://localhost:8080/'; // Desarrollo local
```

**Para producción**, usa la URL de tu servidor:

```javascript
const API_BASE_URL = 'https://api.tudominio.com/'; // Producción
```

O mejor aún, usa variables de entorno (recomendado).

## 🏃 Cómo Ejecutar

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

**El servidor Spring debe estar ejecutándose en `http://localhost:8080`**

### Compilar para Producción

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`

### Vista Previa de Producción

```bash
npm run preview
```

### Linting (ESLint)

```bash
npm run lint
```

## 📁 Estructura del Proyecto

```
iot-dashboard/
├── public/                          # Archivos estáticos
│   └── vite.svg
├── src/
│   ├── api/
│   │   └── apiservice.jsx          # Cliente API y servicios
│   ├── components/
│   │   ├── EsquemaBalsasIndustrial.jsx  # Esquema visual de balsas
│   │   ├── IoTDashboard.jsx             # Componente principal
│   │   ├── SectoresPanel.jsx            # Panel de sectores
│   │   ├── SensorDetailPanel.jsx        # Detalles del sensor
│   │   └── SensorIcon.jsx               # Iconos de sensores
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx                      # Componente raíz
│   ├── App.css
│   ├── index.css
│   └── main.jsx                     # Punto de entrada
├── .eslintrc.cjs                    # Configuración ESLint
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🔌 Endpoints de API Requeridos

El backend Spring debe proporcionar los siguientes endpoints:

### Sensores

```
GET    /sensors                          # Obtener todos los sensores
GET    /sensors/{sensorId}               # Obtener sensor por ID
PUT    /sensors/{sensorId}               # Actualizar estado del sensor
GET    /lecturas/{sensorId}/ultima       # Última lectura del sensor
GET    /lecturas/{sensorId}              # Lecturas históricas
                ?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
```

### Sectores

```
GET    /sectors                          # Obtener todos los sectores
```

### Modelos de Datos Esperados

#### Sensor
```json
{
  "id": 1,
  "nombre": "Sensor Humedad Sector 2",
  "tipo": "HUMEDAD|TEMPERATURA|ACTUADOR",
  "sector_id": 2,
  "estado": "ACTIVO|INACTIVO",
  "ultima_lectura": 65.5,
  "unidad": "%"
}
```

#### Lectura
```json
{
  "id": 1,
  "sensor_id": 1,
  "valor": 65.5,
  "timestamp": "2024-04-10T14:30:00Z"
}
```

#### Sector
```json
{
  "id": 2,
  "nombre": "Sector Industrial 2",
  "ubicacion": "Zona Norte",
  "area_ha": 15.5
}
```

## 🐳 Despliegue

### Opción 1: Servidor Tradicional (Nginx/Apache)

1. **Compilar para producción:**
   ```bash
   npm run build
   ```

2. **Copiar archivos a servidor:**
   ```bash
   scp -r dist/* usuario@servidor:/var/www/iot-dashboard/
   ```

3. **Configuración Nginx:**
   ```nginx
   server {
       listen 80;
       server_name tudominio.com;
       
       root /var/www/iot-dashboard;
       index index.html;
       
       # Reescribir para SPA (React Router)
       try_files $uri $uri/ /index.html;
       
       # Headers de seguridad
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

4. **Reiniciar Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

### Opción 2: Docker

Crea un `Dockerfile` en la raíz:

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Compilar y ejecutar:

```bash
docker build -t iot-dashboard:latest .
docker run -p 80:80 iot-dashboard:latest
```

### Opción 3: Vercel/Netlify

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy
```

## 🌍 Variables de Entorno en Producción

Para que funcione en producción, configura en tu servidor:

```bash
# .env.production
VITE_API_BASE_URL=https://api.tudominio.com
VITE_API_TIMEOUT=15000
```

## 🔒 Consideraciones de Seguridad

- ✅ Implementar HTTPS en producción
- ✅ Usar CORS correctamente en el backend
- ✅ Validar todas las entradas del usuario
- ✅ Implementar autenticación/autorización (JWT recomendado)
- ✅ Usar variables de entorno para URLs sensibles
- ✅ Implementar rate limiting en el backend
- ✅ Sanitizar datos antes de mostrar en la UI

## 📊 Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| react | 19.2.0 | Framework UI |
| react-dom | 19.2.0 | Renderizado DOM |
| react-router-dom | 7.13.0 | Enrutamiento |
| axios | 1.13.5 | Cliente HTTP |
| recharts | 3.7.0 | Gráficas interactivas |
| lucide-react | 0.564.0 | Iconos |
| tailwindcss | 4.1.18 | Estilos CSS |

Ver todas en `package.json`

## 🧪 Testing (Futuro)

```bash
npm run test       # Ejecutar tests
npm run test:cov   # Coverage
```

## 📝 Logs y Monitoreo

La aplicación registra:
- Peticiones a API en consola del navegador
- Errores de conexión y validación
- Estados de carga de componentes

Para producción, integra con:
- Sentry para error tracking
- Google Analytics o Mixpanel
- Monitoring con prometheus

## 🐛 Solución de Problemas

### Error: "Cannot GET /api/sensors"
- Verifica que el backend Spring esté ejecutándose
- Confirma la URL en `apiservice.jsx`
- Revisa la consola del navegador (F12)

### CORS Error
```javascript
// Backend Spring debe incluir:
@CrossOrigin(origins = "http://localhost:5173")
```

### Node Modules Corrupto
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/AmazingFeature`
3. Commit tus cambios: `git commit -m 'Add AmazingFeature'`
4. Push a la rama: `git push origin feature/AmazingFeature`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

## ✉️ Contacto y Soporte

- **Email:** soporte@agrotech.com
- **Issues:** [GitHub Issues](https://github.com/tu-usuario/iot-dashboard/issues)
- **Documentación:** [Wiki](https://github.com/tu-usuario/iot-dashboard/wiki)

## 🙏 Agradecimientos

- React team por el excelente framework
- Tailwind CSS por los estilos
- Recharts por las gráficas
- La comunidad de código abierto

---

<div align="center">

**Hecho con ❤️ para la agricultura inteligente**

[⬆ Volver arriba](#-iot-dashboard---agrotech)

</div>

