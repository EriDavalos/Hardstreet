# Hard Street — Cómo correr el proyecto (preview / desarrollo)

El repo tiene dos piezas que corren por separado:

| Pieza | Qué es | Puerto |
|---|---|---|
| **Frontend** | Sitio estático (`index.html`, `dashboard.html`, `js/`) — servidor de archivos estáticos | 8090 (preview) |
| **Backend** | API Next.js en `backend/` (auth, paquetes, galería) contra Postgres/Neon | 4000 |

El frontend está configurado para consumir la API en `http://localhost:4000` (ver `js/config.js`).

## 1) Reproducir artefactos (checkout fresco)

1. **Dependencias del backend** (usa npm, hay `package-lock.json`):
   ```bash
   cd backend && npm install
   ```
2. **Variables de entorno del backend**: copiar `backend/.env` desde el checkout principal
   (`C:\Workspace\Hardstreet\backend\.env`). Debe contener `DATABASE_URL` (Neon, con
   `sslmode=require`) y `JWT_SECRET`. Nunca commitear esos valores.
   Referencia de estructura: `backend/.env.example`.
3. **Base de datos**: aplicar el esquema + seed la primera vez:
   ```bash
   psql "$DATABASE_URL" -f backend/db/seed.sql
   ```

## 2) Correr los servidores

**Backend** (Next.js carga `backend/.env` automáticamente):
```bash
cd backend && npm run dev     # http://localhost:4000/api/health
```

**Frontend** (estático, cualquier servidor de archivos sirve; el preview usa uno de Node):
```bash
node <static-server>          # sirve la raíz del repo en http://localhost:8090
```
Si el puerto 8090 está ocupado, elegir otro libre y ajustar; el backend siempre
queda en 4000 porque así lo apunta `js/config.js`.

**VS Code**: hay configuraciones de lanzamiento en `.vscode/launch.json`
(dev, dev con breakpoints, y modo producción).

## 3) Verificación rápida

- `GET http://localhost:4000/api/health` → `{"ok":true,"db":"up",...}`
- `http://localhost:8090/index.html` → landing con 14 paquetes + 6 slides en
  "Nuestros servicios" (imágenes desde `packages.url_image`).
- Sin backend: la landing muestra "No pudimos conectar con el servidor" con
  botón **Reintentar** (no hay datos de respaldo — es modo estricto).
- Login de prueba: `karimedzul@hardstreet.com` / `cliente123` (dashboard real).
