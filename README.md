### IOT DASHBOARD -------------------------------------------------------

# Crear proyecto Vite + React
npm create vite@latest iot-dashboard -- --template react

# Entrar al proyecto
cd iot-dashboard

# Instalar dependencias base
npm install

# Instalar Tailwind y otras dependencias
npm install -D tailwindcss postcss autoprefixer
npm install recharts lucide-react axios
npm install -D @tailwindcss/postcss

# Crear configs de Tailwind manualmente: tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

# Crear configs de Postcss: postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

# Cambiar index.css
@import "tailwindcss";

# Borrar contenido App.css


