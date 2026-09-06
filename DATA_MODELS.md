# Hard Street - Estructura de Datos

Este documento describe la estructura de datos utilizada en la página web de Hard Street, diseñada para facilitar la integración futura con una base de datos.

---

## 📦 Paquetes (Packages)

Cada paquete representa un servicio completo que un cliente puede contratar.

### Esquema de Base de Datos (futuro)

```sql
CREATE TABLE packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  subtitulo VARCHAR(255),
  precio_numero DECIMAL(10,2) NOT NULL,
  precio_formato VARCHAR(50),  -- Ej: "$12,000"
  moneda VARCHAR(3) DEFAULT 'MXN',
  destacado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Clase JavaScript

```javascript
class Package {
  constructor(id, nombre, subtitulo, servicios, precio, precioNumero, moneda = 'MXN') {
    this.id = id;
    this.nombre = nombre;           // Ej: "Sesión de Boda - Premium"
    this.subtitulo = subtitulo;     // Ej: "Hard Street Estudio de Fotografía y Vídeo"
    this.servicios = servicios;     // Array de objetos Service
    this.precio = precio;           // Formateado: "$12,000"
    this.precioNumero = precioNumero; // Número: 12000
    this.moneda = moneda;           // "MXN"
    this.destacado = false;         // true = paquete destacado
  }
}
```

### Ejemplo de Uso

```javascript
// Crear un nuevo paquete
const miPaquete = new Package(
  5,
  'Sesión de Boda - Gold',
  'Hard Street Estudio',
  [servicesDB[0], servicesDB[4], servicesDB[5]],  // Servicios incluidos
  '$8,500',
  8500
).setDestacado(true);

// Agregar a la base de datos
packagesDB.push(miPaquete);

// Renderizar
packagesContainer.innerHTML = renderPackageCard(miPaquete);
```

---

## 🛠️ Servicios (Services)

Cada servicio representa un elemento incluido en un paquete.

### Esquema de Base de Datos (futuro)

```sql
CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  icon VARCHAR(50),  -- Emoji o clase de icono
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla pivote para relación muchos a muchos
CREATE TABLE package_services (
  package_id INT,
  service_id INT,
  PRIMARY KEY (package_id, service_id),
  FOREIGN KEY (package_id) REFERENCES packages(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

### Clase JavaScript

```javascript
class Service {
  constructor(id, nombre, icon, descripcion = '') {
    this.id = id;
    this.nombre = nombre;           // Ej: "Video cinematográfico"
    this.icon = icon;               // Ej: "🎬"
    this.descripcion = descripcion; // Ej: "Video artístico con narrativa"
  }
}
```

### Ejemplo de Uso

```javascript
// Crear un nuevo servicio
const nuevoServicio = new Service(
  23,
  'Sesión de Trash the Dress',
  '👗',
  'Sesión fotográfica después de la boda con vestido de novia'
);

// Agregar a la base de datos
servicesDB.push(nuevoServicio);

// Asignar a un paquete
miPaquete.servicios.push(nuevoServicio);
```

---

## 👤 Usuarios (Users) - Futuro

Para el sistema de login y dashboard.

### Esquema de Base de Datos (futuro)

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación usuario-paquete
CREATE TABLE user_packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  package_id INT,
  estado ENUM('pendiente', 'en_proceso', 'completado') DEFAULT 'pendiente',
  fecha_contratacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega DATE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES packages(id)
);
```

---

## 📸 Fotos (Photos) - Futuro

Para el módulo de "Drive" del dashboard.

### Esquema de Base de Datos (futuro)

```sql
CREATE TABLE photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_package_id INT,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  titulo VARCHAR(255),
  estado ENUM('pendiente', 'en_edicion', 'lista') DEFAULT 'pendiente',
  seleccionada BOOLEAN DEFAULT FALSE,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_package_id) REFERENCES user_packages(id)
);
```

---

## 🔄 Flujo de Datos

### 1. Renderizado de Paquetes

```
packagesDB → renderPackageCard() → HTML → packagesGrid
```

### 2. Sistema de Login (Demo)

```
loginForm → handleLogin() → currentUser → showDashboard()
```

### 3. Dashboard

```
currentUser.paquete → renderPackageCard()
currentUser.fotos → renderDriveGrid()
```

---

## 📝 Cómo Agregar un Nuevo Paquete

1. **Crear servicios** (si no existen):
```javascript
const s1 = new Service(23, 'Nuevo servicio', '📸', 'Descripción');
servicesDB.push(s1);
```

2. **Crear paquete**:
```javascript
const pkg = new Package(
  5,                          // ID único
  'Nombre del Paquete',       // Nombre
  'Subtítulo',                // Descripción corta
  [servicesDB[22], s1],       // Servicios incluidos
  '$5,000',                   // Precio formateado
  5000                        // Precio numérico
).setDestacado(true);         // Opcional: marcar como destacado
```

3. **Agregar a la base de datos**:
```javascript
packagesDB.push(pkg);
```

4. **El JS renderiza automáticamente** al cargar la página.

---

## 🎨 Variables de Color

La paleta de colores está definida en `:root` en `index.css`:

```css
:root {
  --gold: #c9a96e;           /* Color principal */
  --gold-light: #f0d48a;     /* Dorado claro */
  --bg: #0a0a0a;             /* Fondo principal */
  --bg-alt: #0e0e0e;         /* Fondo alternativo */
  --text: #f0f0f0;           /* Texto principal */
  --text-secondary: #ccc;    /* Texto secundario */
  /* ... más variables en index.css */
}
```

Para cambiar la paleta globalmente, solo modifica estas variables en `:root`.

---

## 🚀 Integración con Backend (Futuro)

Cuando estés listo para conectar con una base de datos real:

1. **API Endpoints** a crear:
   - `GET /api/packages` - Obtener todos los paquetes
   - `GET /api/packages/:id` - Obtener un paquete
   - `POST /api/packages` - Crear paquete (admin)
   - `PUT /api/packages/:id` - Actualizar paquete (admin)
   - `DELETE /api/packages/:id` - Eliminar paquete (admin)

2. **Auth Endpoints**:
   - `POST /api/auth/login` - Iniciar sesión
   - `POST /api/auth/register` - Registrarse
   - `GET /api/auth/me` - Obtener usuario actual

3. **Dashboard Endpoints**:
   - `GET /api/user/package` - Obtener paquete del usuario
   - `GET /api/user/photos` - Obtener fotos del usuario
   - `PUT /api/user/photos/:id/select` - Seleccionar/deseleccionar foto

---

*Documento generado para Hard Street - Septiembre 2026*
