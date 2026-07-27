# AstraNovousWebappV1.0 🌌✨
> **Calculadora Astrológica de Alta Precisión & Suite Avanzada Astro-Seek**

**AstraNovousWebappV1.0** es una aplicación web astrológica profesional inspirada en el estándar de **Astro-Seek** y construida con una interfaz cinematográfica **Orrery Edition (Oro & Obsidiana)**, glassmorphism, lienzo con parallax estelar interactivo y motor astronómico de alta precisión geocéntrica tropical (**VSOP87 / JPL**).

---

## 🌟 Características Principales

### ☸ 1. Módulo Carta Natal (Single Wheel)
- **Cálculo Astronómico de Precisión:** Efemérides de los 10 cuerpos celestes principales + Nodos Lunares (Norte/Sur).
- **Sistemas de Casas Soportados:** Placidus, Casas Iguales, Whole Sign, Koch, Regiomontanus, Campanus, Porfirio, Alcabitius y Topocéntrico.
- **Rueda Natal Orrery:** Rotación constante de anillos estelares, ejes cardinales resaltados (ASC, DSC, MC, IC), Sol central pulsante y paleta de tonos joya por elemento.
- **Validación Automatizada:** Comprobación rigurosa de 10 reglas de coherencia astronómica.

### 🪐 2. Módulo de Tránsitos Astrológicos (Bi-Wheel Astro-Seek)
- **Rueda Doble (Bi-Wheel):** Superposición de planetas en tránsito (anillo exterior en cian) sobre la Carta Natal (anillo interior).
- **Aspectos Cruzados (Tránsito ➔ Natal):** Conexiones geométricas dinámicas entre planetas en tránsito y puntos natales con orbes y fases (aplicativo/separativo).
- **Controles de Fecha en Tiempo Real:** Botón *"Ahora"* para carga instantánea o fecha/hora personalizada.
- **Vistas Alternables:** Rueda Doble, Rueda Simple de Tránsitos y Tabla de Aspectos en Tránsito con análisis de IA.

### ☀️ 3. Módulo de Revolución Solar (Retorno Solar Exacto)
- **Solver Numérico de Alta Precisión:** Encuentra el segundo de arco UTC exacto en el año objetivo donde \(\text{Sun}_{\text{transit}}(t) = \text{Sun}_{\text{natal}}\).
- **Superposición de Casas Natales:** Identifica en qué Casa Natal se ubica el Ascendente y Medio Cielo de Revolución Solar.
- **Rueda Doble de Revolución Solar:** Visualización interactiva y tabla de aspectos de retorno.

### 🌙 4. Progresiones Secundarias
- Técnica simbólica **1 Día = 1 Año** con seguimiento del ciclo de la Luna Progresada y avances del Sol Progresado.

### 📚 5. Base Documental & Interpretación RAG / IA
- Centro de carga para libros y tratados astrológicos en formato PDF o texto.
- Asistente de inteligencia artificial que contextualiza aspectos, tránsitos y posiciones en base a tus textos de referencia.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js:** v18+ o v20+
- **npm** o **bun**

### Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/AstraNovousWebappV1.0.git
cd AstraNovousWebappV1.0

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor astrológico local
npx tsx server.ts
```

Abre tu navegador en: **http://localhost:3000**

---

## 📜 Licencia

MIT License. Desarrollado con excelencia técnica e innovación astrológica.
