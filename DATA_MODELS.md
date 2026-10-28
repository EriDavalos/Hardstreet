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
PackageCategory { id, name, icon, urlImage }           // Boda, XV Años... (urlImage = portada)
Status    { id, name }
```

### User / Gallery
```ts
User    { id, name, lastname, number, email, role }    // sin password, nunca viaja al front
Gallery { id, url, user, galleryType, purchasedPackage, packageCategory, isPublic }
        // galleryType: "image" | "video" | "pdf"
```

> Compatibilidad: el frontend resuelve `services.icon` a lo que se pinta en la web desde `gallery/assets/models.js` (`resolveServiceIcon`), que acepta los DOS formatos que guarda la columna:
>
> | Valor de `services.icon` | Cómo se dibuja |
> |---|---|
> | `material:videocam` (lo elige el módulo **Servicios** del panel) | `<span class="material-symbols-outlined">`, con la tipografía **Material Symbols Outlined** que cargan las páginas: el sitio muestra EXACTAMENTE el mismo icono que el admin |
> | `icon/video.svg` (heredado) | SVG de la tabla `ServiceIcons` |
> | vacío o desconocido | icono genérico de servicios |
>
> Las claves CSS de categoría/tier se derivan con `categoryKey()` ("XV Años" → "xv-anos").

---

## 🚀 Backend (`backend/`)

Next.js (API routes) + **`mysql2`** (MySQL 8, esquema `hardstreet` en 192.168.1.72:3306) + `jose` (JWT) + `bcryptjs`. El JWT viaja en el header `Authorization: Bearer` (sin cookies).

Variables de entorno: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` (o `DATABASE_URL` tipo `mysql://user:pass@host:3306/hardstreet`) y `JWT_SECRET`.

### Endpoints de administración (solo rol Admin)
Usados por el panel `Hardstreet_Admin/` (Flutter), contra la MISMA API que la web.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/users` | Lista usuarios con rol y `roleId` |
| POST | `/api/admin/users` | Crea usuario `{name, lastname?, number?, email, password, id_role?}` |
| PUT | `/api/admin/users` | Actualiza `{id, ...campos?, password?, id_role?}` |
| DELETE | `/api/admin/users?id=N` | Baja lógica (`active=0`); no permite auto-eliminarse |
| GET | `/api/admin/roles` | Roles con `permissions: [{moduleId, permissionId}]` |
| POST | `/api/admin/roles` | Crea rol `{name, permissions?}` |
| PUT | `/api/admin/roles` | Renombra y/o REEMPLAZA el set de permisos `{id, name?, permissions?}` |
| DELETE | `/api/admin/roles?id=N` | Baja lógica; 409 si hay usuarios con ese rol |
| GET | `/api/admin/meta` | Árbol `grupos→módulos→acciones` (sincroniza módulos admin en `modules`) |
| GET | `/api/admin/clients` | Usuarios con rol fijo `Client` + `packagesCount` |
| POST | `/api/admin/clients` | Crea cliente (rol asignado automáticamente) |
| PUT | `/api/admin/clients` | Actualiza cliente `{id, ...}` (sin rol) |
| DELETE | `/api/admin/clients?id=N` | Baja lógica del cliente |
| GET | `/api/admin/client-packages?userId=N` | Paquetes del cliente + catálogo para asignar |
| POST | `/api/admin/client-packages` | `{userId, packageId}` crea compra desde catálogo (copia servicios) · `{userId, purchasedPackageId}` asigna compra existente · `{userId, usersPackageId}` quita el paquete |
| GET | `/api/admin/package-progress?purchasedPackageId=N` | Administración del paquete: servicios (estado + cierre), movimientos, totales, `canFinish` y `blockers` |
| POST | `/api/admin/package-progress` | `{action}`: `completar-servicio` · `reabrir-servicio` · `actualizar-servicio` · `actualizar-servicio-url` · **`actualizar-servicio-share`** (`{serviceId, folder, link}` = carpeta y liga compartidas de ESE servicio del paquete) · `movimiento` (inversión/gasto/abono externo) · `quitar-movimiento` · `finalizar` (valida servicios entregados y pago completo) · `reabrir-paquete` |

> El árbol de permisos del modal (grupos **Operación / Catálogos / Administración**) se define en `Hardstreet-Backend/lib/admin-modules.ts`; los IDs de módulo/permiso se resuelven contra la BD.

### Endpoints
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | — | Health check (verifica conexión a BD) |
| POST | `/api/auth/login` | — | Login; devuelve el JWT en el body (`token`) |
| POST | `/api/auth/logout` | — | Marca fin de sesión (el cliente descarta su token) |
| GET | `/api/auth/me` | header Authorization: Bearer | Usuario de la sesión (User) |
| GET | `/api/packages` | — | Catálogo. Filtros: `?extern=true/false`, `?category=boda` |
| GET | `/api/packages/:id` | — | Un paquete con todo incluido |
| GET | `/api/categories` | — | Categorías (para los filtros), con su `urlImage` |
| GET/POST/PUT/DELETE | `/api/admin/categories` | header Bearer | Categorías del catálogo (permiso `Paquetes`): listar, crear `{name, urlImage?}`, editar y dar de baja |
| GET | `/api/tiers` | — | Tiers |
| GET | `/api/services` | — | Catálogo de servicios |
| GET | `/api/extern-services` | — | Servicios externos (carousel, `is_extern=1`) |
| GET | `/api/my/packages` | header Bearer | **PurchasedPackages del usuario** (dashboard) |
| GET | `/api/my/drive` | header Bearer | Carpetas del Drive COMPARTIDAS con el usuario (`paths: [{packageId, packageName, path}]`; un paquete puede compartir varias) |
| GET | `/api/my/service-items?serviceId=N` | header Bearer | La LISTA de elementos/fotos que el cliente marcó para ese servicio del paquete |
| PUT | `/api/my/service-items` | header Bearer | `{serviceId, paths:[...]}` REEMPLAZA esa selección (solo rutas dentro de lo compartido) |
| GET | `/api/my/gallery` | header Bearer | Galería del usuario |
| GET | `/api/public/gallery` | — | Galería pública (landing) |
| GET | `/api/modules` | opcional | Módulos del sidebar con permisos por rol |
| GET | `/api/site` | — | **Diseño del sitio en vivo**: `{design, landing}` (tabla `site_config`) |
| GET | `/api/admin/site` | header Bearer | Lee `design` + `landing` (permiso `Paquetes:read`) |
| PUT | `/api/admin/site` | header Bearer | Guarda `design` (permiso `Paquetes:update`) y/o `landing` (`Sitio web:update`) |

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

### Diseño del sitio (tarjetas y portada)

La tabla `site_config` (fila única `id = 1`) guarda dos documentos JSON que el
panel DISEÑA y la web APLICA en vivo al cargar (`GET /api/site` →
`gallery/assets/site.js` → CSS). No hace falta volver a publicar el sitio.

**`design`** (lo edita *Paquetes → Diseñar cards*):

```jsonc
{
  "brand": { "gold": "#C9A96E", "goldLight": "#F0D48A" },
  "card": {
    "columns": 3, "gap": 40, "radius": 18, "borderWidth": 1, "padding": 32,
    "lineTop": true, "hoverLift": true, "shadow": true,
    "serifNames": true, "uppercaseNames": false,
    "showCategory": true, "showSubtitle": true, "showServiceCount": true,
    "showServices": true, "servicesLimit": 6, "showPrice": true, "showCta": true,
    "priceLabel": "Desde", "ctaLabel": "Cotizar",
    // FOTO del paquete dentro de la tarjeta: 'none' (sin foto) | 'top' (banda
    // arriba, con `imageHeight`) | 'bg' (de FONDO: la foto se ve a todo color y
    // encima lleva un velo NEGRO que manda `imageFade`: abajo y a la izquierda
    // tapa más, así el texto resalta. El mismo velo lo pone el panel).
    "imageMode": "none", "imageHeight": 150, "imageFade": 0.7
  },
  "tiers": {
    "premium": { "accent": "#C9A96E", "accentSoft": "#F0D48A", "dark": "#0B0E17", "badgeFilled": true, "borderAlpha": 0.55 },
    "gold":    { "accent": "#D9A441", "accentSoft": "#F2C66B", "dark": "#120E05", "badgeFilled": true, "borderAlpha": 0.3 },
    "basic":   { "accent": "#8FB0D4", "accentSoft": "#B9D0E6", "dark": "#0B111A", "badgeFilled": false, "borderAlpha": 0.22 }
  }
}
```

Los MISMOS defaults viven en `gallery/assets/site.js` (`SITE_DESIGN_DEFAULT`) y
en el panel (`Hardstreet_Admin/lib/site_design.dart`);
`Hardstreet_Admin/test/site_design_test.dart` compara los dos y
`Hardstreet/tests/site-design.test.mjs` comprueba el CSS resultante.

**`landing`** (portada; lo edita el módulo *Sitio web*, solo Windows por ahora):
`{ texts, images, sections }`. Cada clave es un gancho del HTML de la portada
(`Hardstreet/index.html`), que ya los trae puestos (27 textos, 5 imágenes y 8
secciones):

- `data-hs="clave"` → texto. Con `data-hs-lines` el valor admite DOS líneas
  separadas por `|` y la segunda va con énfasis (`<span>` del titular o `<em>`
  del divisor, según `data-hs-em`): así se edita el copy sin perder el diseño.
- `data-hs-img="clave"` → imagen: cambia el `src` si el gancho está en un
  `<img>` (logos, foto de "Sobre nosotros") o el `background-image` si está en
  un `div` (fondo del hero y del divisor).
- `data-hs-section="clave"` → sección: `visible` la oculta/muestra y `order` la
  reordena. El orden se aplica MOVIENDO las secciones dentro del documento (la
  portada no es un contenedor flexible), agrupadas donde estaban.

Sólo se guardan los campos CAMBIADOS: lo demás sigue leyéndose del HTML, así el
copy del sitio puede seguir evolucionando sin que el panel lo pise. El panel
(`Hardstreet_Admin/lib/web_content.dart`) es el espejo de esos ganchos y
`test/site_page_test.dart` falla si alguno se agrega en un solo lado.

Migración: `Hardstreet-DB/2026-10-16_sitio_web.sql`.

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
3. **`packages_categories.icon` vacío** — la tabla tiene columna `icon` pero ningún valor. El front usa SVGs propios mientras tanto; cuando la llenes (ej. `icon/heart.svg`), se puede mapear directo. La tabla ya tiene además **`url_image`** (la foto con la que el panel presenta la categoría en su galería; migración `Hardstreet-DB/2026-10-16_categorias_imagen.sql`), y el modelo la expone como `PackageCategory.urlImage`.
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
| `purchased_packages` | `PurchasedPackage` | + `package` heredado + `services` vía `purchased_packages_services`; `drive_path` sigue siendo la PRIMERA carpeta compartida (compatibilidad) |
| `users_drive` | (carpetas compartidas) | Carpetas del Drive que ve CADA USUARIO (`id_user`, `path`, `active`; `UNIQUE (id_user, path)`). La carpeta de un paquete vive en `purchased_packages.drive_path` y al compartirla se copia aquí a sus clientes; el Drive del cliente solo muestra las activas |
| `purchased_packages_services` | `PurchasedPackageService` | + `service` + `status` resueltos; `finished_at` = cierre del servicio |
| `purchased_packages_services_shares` | (compartir por servicio) | `folder` y/o `link` que se comparten con el cliente para ESE servicio del paquete |
| `purchased_packages_services_items` | (selección del cliente) | una fila por ruta del Drive que el CLIENTE marcó para ese servicio; nada se mueve ni se copia |
| `purchased_packages_movements` | (ledger) | inversión / gasto / abono externo (`kind`); los ABONOS viven en `purchased_packages_payments` |
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
