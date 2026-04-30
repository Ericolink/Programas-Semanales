# 📖 Vida y Ministerio — Gestor de Asignaciones

Sistema web multi-tenant para automatizar la asignación semanal de partes en las reuniones de congregaciones de los Testigos de Jehová. Importa el programa desde **wol.jw.org**, genera asignaciones automáticamente respetando roles y reglas internas, y exporta el programa como imagen para compartir por WhatsApp.

**Demo:** https://programas-semanales.vercel.app  
**API:** https://vida-ministerio-api.onrender.com

---

## Características

- **Importación automática** del programa semanal desde wol.jw.org por docId
- **Generación automática** de asignaciones respetando:
  - Género (hermanos / hermanas)
  - Rol (Anciano, Ministerial, Publicador)
  - Rotación justa — evita repetir en las últimas 4 semanas
  - Reglas por sección (presidente, oraciones, Tesoros, SMM, NVC)
- **Edición manual** — cambiar miembro o tipo de asignación por semana
- **Exportar como imagen PNG** lista para WhatsApp
- **Historial de asignaciones** por miembro con partes más frecuentes
- **Multi-tenant** — cada congregación tiene sus datos aislados
- **Panel de superadmin** para gestionar congregaciones y usuarios
- **Sistema de feedback** con envío de email y panel de reportes
- **Responsive** — funciona en móvil y desktop

---

## Tecnologías

### Backend
| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor y API REST |
| Prisma ORM | Acceso a base de datos |
| PostgreSQL | Base de datos en producción |
| JWT + bcryptjs | Autenticación y hash de contraseñas |
| Cheerio | Scraping de wol.jw.org |
| Nodemailer | Envío de emails de feedback |

### Frontend
| Tecnología | Uso |
|---|---|
| React + Vite | Interfaz de usuario |
| React Router | Navegación y rutas protegidas |
| Axios | Peticiones HTTP con interceptores |
| html2canvas | Exportar programa como imagen PNG |

### Infraestructura
| Servicio | Uso |
|---|---|
| Render | Backend + PostgreSQL |
| Vercel | Frontend |
| GitHub | Control de versiones |

---

## Estructura del proyecto

```
Programas-Semanales/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── memberController.js
│   │   ├── groupController.js
│   │   ├── weekController.js
│   │   ├── assignmentTypeController.js
│   │   ├── congregationController.js
│   │   └── feedbackController.js
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── weekRoutes.js
│   │   ├── assignmentTypeRoutes.js
│   │   ├── congregationRoutes.js
│   │   └── feedbackRoutes.js
│   ├── services/
│   │   ├── weekScraper.js          # Scraper de wol.jw.org
│   │   └── assignmentGenerator.js  # Algoritmo de asignación
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── prismaClient.js
│   ├── index.js
│   └── .env                        # No subir a git
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── api.js              # Todas las llamadas HTTP
    │   ├── components/
    │   │   └── Layout.jsx          # Sidebar responsive
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   └── pages/
    │       ├── Dashboard.jsx
    │       ├── Semanas.jsx
    │       ├── Semana.jsx          # Detalle + exportar imagen
    │       ├── Miembros.jsx
    │       ├── MemberHistory.jsx   # Historial por miembro
    │       ├── Grupos.jsx
    │       ├── Feedback.jsx
    │       ├── Admin.jsx           # Panel de superadmin
    │       └── Login.jsx
    ├── public/
    │   └── favicon.svg
    └── vite.config.js
```

---

## Instalación local

### Requisitos
- Node.js v20
- PostgreSQL o cuenta en Render

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ericolink/Programas-Semanales.git
cd Programas-Semanales
```

### 2. Configurar el backend

```bash
cd backend
npm install --ignore-scripts
```

Crea `backend/.env`:

```env
DATABASE_URL="postgresql://usuario:password@host/dbname"
JWT_SECRET="clave_secreta_larga_aleatoria"
GMAIL_USER="tu_correo@gmail.com"
GMAIL_PASS="contraseña_de_aplicacion_gmail"
```

Genera un JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Inicializa la base de datos:
```bash
npx prisma db push
```

Crea el superadmin:
```bash
node -e "
import('./prismaClient.js').then(async ({prisma}) => {
  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.default.hash('tu_password', 10);
  const cong = await prisma.congregation.create({ data: { name: 'Tu Congregación' } });
  await prisma.user.create({
    data: { name: 'Tu Nombre', email: 'tu@correo.com', password: hash, role: 'SUPERADMIN', congregationId: cong.id }
  });
  console.log('Superadmin creado');
  prisma.\$disconnect();
});
"
```

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

Crea `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Iniciar en desarrollo

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Abre http://localhost:5173

---

## API REST

### Auth
```
POST   /api/auth/login     Iniciar sesión → { token, user }
GET    /api/auth/me        Usuario actual
```

### Semanas
```
GET    /api/weeks                           Listar semanas
GET    /api/weeks/:id                       Ver semana con asignaciones
POST   /api/weeks/import                    Importar desde wol.jw.org { docId }
POST   /api/weeks/:id/generate              Generar asignaciones automáticas
DELETE /api/weeks/:id                       Eliminar semana
PATCH  /api/weeks/assignments/:id/member    Cambiar miembro asignado
PATCH  /api/weeks/assignments/:id/type      Cambiar tipo de asignación
```

### Miembros
```
GET    /api/members
GET    /api/members/:id
GET    /api/members/:id/history    Historial de asignaciones
POST   /api/members
PUT    /api/members/:id
DELETE /api/members/:id
```

### Grupos y Tipos de asignación
```
GET/POST/PUT/DELETE   /api/groups
GET/POST/PUT/DELETE   /api/assignment-types
```

### Administración (solo SUPERADMIN)
```
GET    /api/congregations
POST   /api/congregations
PATCH  /api/congregations/:id/toggle
PATCH  /api/congregations/change-password
GET    /api/feedback
POST   /api/feedback
```

---

## Reglas de asignación automática

| Parte | Quién puede |
|---|---|
| Presidente (intro + conclusión) | Anciano o Ministerial — misma persona |
| Oración apertura | Anciano o Ministerial — diferente al presidente |
| Oración cierre | Anciano o Ministerial — diferente a los anteriores |
| Discurso Tesoros de la Biblia | Anciano o Ministerial |
| Busquemos perlas escondidas | Anciano o Ministerial |
| Lectura de la Biblia | Publicador hombre |
| Partes SMM (conversaciones, revisitas) | Mujeres — principal + ayudante |
| Discurso SMM | Publicador con prioridad, cualquier rango |
| Partes Nuestra Vida Cristiana | Solo Ancianos |
| Estudio bíblico — conductor | Anciano o Ministerial |
| Estudio bíblico — lector | Cualquier hombre |

El algoritmo evita repetir la misma asignación en las últimas **4 semanas**. Si no hay candidatos disponibles, relaja esa regla automáticamente.

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| `SUPERADMIN` | Panel de admin, todas las congregaciones, feedbacks |
| `ADMIN` | Solo su propia congregación |

---

## Deploy en producción

### Backend en Render
- **Runtime:** Node 20
- **Build Command:** `npm install --ignore-scripts`
- **Start Command:** `node index.js`
- **Variables de entorno:** `DATABASE_URL`, `JWT_SECRET`, `GMAIL_USER`, `GMAIL_PASS`

### Frontend en Vercel
- **Root Directory:** `frontend`
- **Framework:** Vite
- **Variables de entorno:** `VITE_API_URL=https://tu-backend.onrender.com/api`

---

## Scripts

### Backend
```bash
npm run dev     # Servidor con hot-reload
npm start       # Producción
```

### Frontend
```bash
npm run dev     # Desarrollo
npm run build   # Compilar para producción
```

---

## Feedback y reportes

Usa el formulario de **Feedback** dentro de la aplicación para reportar bugs o sugerencias. Los reportes llegan por email y quedan registrados en el panel de administración.

---

## Licencia

Proyecto privado — todos los derechos reservados © 2026 Eric Munoz