# Hard Street — Modelos de Datos & API

Este documento describe los **modelos del frontend** (en inglés, iguales a los que devuelve la API), los **endpoints del backend** y los **ajustes pendientes en la base de datos**.

---

## 📦 Modelos del Frontend

Definidos en `gallery/assets/models.js` y devueltos tal cual por la API (`backend/lib/mappers.ts`).

### Package (catálogo público)
```ts
{
  id: number
  name: string
  subtitle: string
  description: string
  price: number          // double en BD (decimal)
  currency: string       // "MXN"
  tier: Tier             // modelo completo
  packageCategory: PackageCategory  // modelo completo
  isExtern: boolean
  urlImage: string       // packages.url_image — imagen del carousel "Nuestros servicios"
  services: Service[]    // lista de modelos Service
}
```

### PurchasedPackage (paquete comprado por un cliente — dashboard)
Hereda los datos del paquete principal y agrega pagos, estado y sus propios servicios.
```ts
{
  id: number
  name: string; subtitle: string; description: string
  price: number          // precio total acordado (heredado)
  paid: number           // lo que el cliente YA pagó
  currency: string
  status: Status         // estado global: Pendiente | En proceso | Entregado...
  package: Package       // paquete principal del que hereda (con tier, category, services)
  services: PurchasedPackageService[]
}
```

### PurchasedPackageService
```ts
{
  id: number
  description: string        // nota de avance escrita por el admin ("En proceso del story board...")
  deliveryDate: number|null  // días de entrega (INTEGER en BD)
  status: Status             // Pendiente | En proceso | Entregado
  service: Service           // servicio base (name, icon, description)
}
```

### Service / Tier / PackageCategory / Status
```ts
Service   { id, name, description, icon }              // icon: "icon/video.svg"
Tier      { id, name, tier }                           // Premium(1), Gold(2), Basic(3)
PackageCategory { id, name, icon }                     // Boda, XV Años, Bautizo...
Status    { id, name }
```

### User / Gallery
```ts
User    { id, name, lastname, number, email, role }    // sin password, nunca viaja al front
Gallery { id, url, user, galleryType, purchasedPackage, packageCategory, isPublic }
        // galleryType: "image" | "video" | "pdf"
```

> Compatibilidad: el frontend resuelve `services.icon` ("icon/video.svg") a un SVG mediante `ServiceIcons` en `gallery/assets/models.js`. Las claves CSS de categoría/tier se derivan con `categoryKey()` ("XV Años" → "xv-anos").

---

## 🚀 Backend (`backend/`)

Next.js (API routes) + `pg` + `jose` (JWT) + `bcryptjs`. Desplegable en Vercel tal cual.

### Endpoints
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | — | Health check (verifica conexión a BD) |
| POST | `/api/auth/login` | — | Login; devuelve el JWT en el body (`token`) |
| POST | `/api/auth/logout` | — | Marca fin de sesión (el cliente descarta su token) |
| GET | `/api/auth/me` | header Authorization: Bearer | Usuario de la sesión (User) |
| GET | `/api/packages` | — | Catálogo. Filtros: `?extern=true/false`, `?category=boda` |
| GET | `/api/packages/:id` | — | Un paquete con todo incluido |
| GET | `/api/categories` | — | Categorías (para los filtros) |
| GET | `/api/tiers` | — | Tiers |
| GET | `/api/services` | — | Catálogo de servicios |
| GET | `/api/extern-services` | — | Servicios externos (carousel, `is_extern=1`) |
| GET | `/api/my/packages` | cookie | **PurchasedPackages del usuario** (dashboard) |
| GET | `/api/my/gallery` | cookie | Galería del usuario |
| GET | `/api/public/gallery` | — | Galería pública (landing) |
| GET | `/api/modules` | opcional | Módulos del sidebar con permisos por rol |

### Correr en local
```bash
cd backend
npm install
cp .env.example .env        # pon tu DATABASE_URL de Neon y JWT_SECRET
npm run dev                 # next dev en http://localhost:4000
```

Next.js carga `backend/.env` automaticamente (DATABASE_URL, JWT_SECRET). En VS Code tambien puedes lanzar el backend con **F5**: hay configuraciones listas en `.vscode/launch.json` (dev normal, dev con breakpoints y modo produccion).

### Despliegue en Vercel
1. `vercel` dentro de `backend/` (o importa la carpeta como proyecto).
2. Environment variables: `DATABASE_URL` (Neon, con `sslmode=require`) y `JWT_SECRET`.
3. `NODE_ENV=production` hace la cookie `secure; SameSite=Lax`. Si sirves el front desde **otro dominio**, cambia `sameSite: "lax"` → `"none"` en `backend/lib/auth.ts` para que la cookie cross-site funcione.

### Conectar el frontend
En `gallery/assets/config.js`:
```js
window.HARDSTREET_API_URL = 'https://tu-backend.vercel.app';
```
Vacio = mismo origen.

### Modo estricto (sin fallback)
El frontend ya **no tiene datos demo ni fallback local**: todo viene del backend.

- **Landing** (`index.js`): mientras carga muestra el loader; si la API falla, renderiza "No pudimos conectar con el servidor" con boton **Reintentar** en la seccion de paquetes y vacia el carousel.
- **Dashboard** (`gallery/assets/dashboard-core.js`, usado por `gallery/home/`, `gallery/package/` y `gallery/photos/`): si `/api/auth/me` responde 401 redirige a `index.html` (login). Si el backend o la BD fallan, muestra una pantalla de error completa con **Reintentar** y link al inicio.

---

## 🔐 Credenciales del seed

`backend/db/seed.sql` pone contraseñas bcrypt:

| Usuario | Email | Contraseña |
|---|---|---|
| Admin | `hardstreet7@gmail.com` | `admin123` |
| Cliente | `karimedzul@hardstreet.com` | `cliente123` |

**Cámbialas en producción** (update a `users.password` con un hash nuevo).

---

## ⚠️ Datos faltantes en la BD (ajustes que pediste comentar)

1. **Contraseñas vacías** — `users.password` estaba `''`. El login real requiere bcrypt: el seed las llena.
2. **Un solo paquete** — `packages` solo tenía la Boda Premium (id 1). La landing muestra 14 paquetes por categoría/tier: el seed los inserta (ids 2–14) con sus `packages_services`.
3. **`packages_categories.icon` vacío** — la tabla tiene columna `icon` pero ningún valor. El front usa SVGs propios mientras tanto; cuando la llenes (ej. `icon/heart.svg`), se puede mapear directo.
4. **`is_extern` nunca usado** — no había paquetes con `is_extern = 1`, así que el carousel "Lo que Ofrecemos" no tenía fuente de datos. El seed crea 6 (ids 21–26).
5. **`status` global para compras** — `purchased_packages.id_status` apunta a `status`, pero esa tabla era de servicios. Funciona, pero el seed agrega `Pagado(4)` y `Cancelado(5)` para estados de compra.
6. **`galleries` casi vacía** — 1 solo registro (`urldelitem`, no público). El seed agrega 8 ítems demo ligados a la compra 1 con las imágenes reales del repo.
7. **`purchased_packages_services.delivery_date` es INTEGER** — hoy parece significar "días de entrega", no una fecha. Si quieres una fecha real: `ALTER TABLE purchased_packages_services ADD COLUMN delivery_date_ts timestamp;`
8. **Sin contraseñas cifradas ni registro** — no hay endpoint de registro (los clientes los crea el admin). Si quieres self-signup, agrega `POST /api/auth/register`.

---

## 🗄️ Mapa Tabla ↔ Modelo

| Tabla | Modelo | Notas |
|---|---|---|
| `packages` | `Package` | + `services` vía `packages_services` |
| `purchased_packages` | `PurchasedPackage` | + `package` heredado + `services` vía `purchased_packages_services` |
| `purchased_packages_services` | `PurchasedPackageService` | + `service` + `status` resueltos |
| `services` | `Service` | icono resuelto a SVG en el front |
| `tiers` | `Tier` | |
| `packages_categories` | `PackageCategory` | |
| `status` | `Status` | usado por servicios y compras |
| `users` | `User` | password nunca sale del backend |
| `galleries` | `Gallery` | + `galleryType` resuelto |
| `users_packages` | (join, no expuesto) | usado por `/api/my/packages` |
| `roles`, `permissions`, `permissions_roles`, `modules` | `/api/modules` | control de menú por rol |
| `galleries_types` | (join) | resuelto a `galleryType` string |

---

*Documento generado para Hard Street — Septiembre 2026*
