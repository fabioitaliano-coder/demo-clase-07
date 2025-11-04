# Demo Clase 07 - Frontend + Backend (MVP Demo y guía)

Este repositorio es un proyecto MVP (Minimum Viable Product) para las Clases 7/8 (IFTS16). Su objetivo es servir de referencia para que los alumnos entiendan conceptos clave como autenticación y RLS (Row Level Security) de Supabase, permitiendo una iteración rápida para validar funcionalidades con usuarios potenciales.

> **⚠️ Nota sobre MVP vs Producción**
> 
> Este es un MVP diseñado para aprendizaje y prototipado rápido. Para un ambiente de producción, considera estas mejoras de seguridad:
> - Implementar un backend proxy para las operaciones de Supabase
> - Nunca exponer las credenciales de Supabase en el frontend
> - Implementar rate limiting y validaciones adicionales
> - Añadir logging y monitoreo
> - Implementar manejo de errores robusto
> - Configurar CORS apropiadamente
> 
> El enfoque actual (conexión directa a Supabase) es válido para MVP porque:
> 1. Permite iteración rápida y validación de funcionalidades
> 2. Facilita el aprendizaje de RLS sin complejidad adicional
> 3. Supabase provee seguridad básica a través de RLS
> 4. Reduce el tiempo de desarrollo inicial

Contenido principal

- `server.js` - Servidor Express que expone:
  - Rutas de autenticación conectadas a Supabase (`/api/auth`)
  - Ruta protegida de ejemplo `/api/data` que devuelve información del usuario
  - Endpoints CRUD para `items` (`/api/items`) usados en el dashboard (demo en memoria)
  - Servido de archivos estáticos desde `src/public`

- `src/public/login.html` - Página de login (Tailwind) que usa Supabase para autenticarse y guarda token en `localStorage`.
- `src/public/dashboard.html` - Dashboard (protegido) que muestra datos del usuario y una sección CRUD de ejemplo.
- `src/public/materias.html` - Página que lista y permite CRUD sobre la tabla `materias` en Supabase (demo educativo).
- `src/js/login.js` - Lógica del login en el frontend (con cliente Supabase CDN).
- `src/js/dashboard.js` - Lógica del dashboard: obtiene token, pide datos y maneja CRUD contra `/api/items`.
- `src/routes/auth.js` - Rutas backend para Login/Register (usa cliente de Supabase en backend).
- `src/config/supabase.js` - Config del cliente de Supabase para backend.

Objetivo didáctico

- Mostrar cómo conectar un frontend (HTML + Tailwind + JS) a un backend Express.
- Mostrar la forma recomendada de almacenar el token JWT (localStorage) y usarlo en `Authorization`.
- Servir HTML/CSS/JS desde Express para que la app funcione en `http://localhost:3000`.
- Presentar un CRUD mínimo (in-memory) para que los alumnos vean la interacción completa.

Cómo usar (rápido)

1. Instala dependencias (solo la primera vez):

```powershell
npm install
```

2. Configura Supabase en `src/config/supabase.js` (URL y anon key). También revisa `src/js/login.js` si quieres usar el CDN.

3. **IMPORTANTE: Crea un usuario demo en Supabase:**
   
   Opción A - Desde la UI de Supabase (Recomendado):
   - Ve a Authentication → Users → Add user
   - Email: `demo@demo.com`
   - Password: `demo1234`
   - **Auto Confirm User**: ✅ Activar
   
   Opción B - Desactiva confirmación de email:
   - Ve a Authentication → Providers → Email
   - Desactiva "Confirm email" para desarrollo
   
   Ver `setup-demo-user.md` para más detalles.

4. Inicia el servidor:

```powershell
node server.js
```

5. Abre en el navegador:

```
http://localhost:3000/login.html
```

6. Ingresa las credenciales del usuario demo:
   - Email: `demo@demo.com`
   - Password: `demo1234`

NOTA: En este demo las rutas CRUD usan una tienda en memoria (`app.locals.items`) — para proyectos reales reemplazar por base de datos.

Materias (MVP con Supabase + RLS)

Este módulo implementa un enfoque MVP que conecta directamente con Supabase para aprender RLS:

1. Crea en tu proyecto Supabase una tabla llamada `materias` con al menos los campos:
  - id (serial / integer) PRIMARY KEY
  - nombre (text)
  - descripcion (text, opcional)

2. Configura RLS en Supabase:
   
   a. Habilita RLS en la tabla `materias`:
      - Ve a la tabla `materias` en el Dashboard de Supabase
      - Activa "Row Level Security (RLS)"
   
   b. Crea las políticas de acceso básicas:
      ```sql
      -- Permitir SELECT a usuarios autenticados
      CREATE POLICY "Usuarios autenticados pueden ver materias"
      ON materias FOR SELECT TO authenticated
      USING (true);

      -- Permitir INSERT a usuarios autenticados
      CREATE POLICY "Usuarios autenticados pueden crear materias"
      ON materias FOR INSERT TO authenticated
      WITH CHECK (true);

      -- Permitir UPDATE a usuarios autenticados
      CREATE POLICY "Usuarios autenticados pueden modificar materias"
      ON materias FOR UPDATE TO authenticated
      USING (true)
      WITH CHECK (true);

      -- Permitir DELETE a usuarios autenticados
      CREATE POLICY "Usuarios autenticados pueden eliminar materias"
      ON materias FOR DELETE TO authenticated
      USING (true);
      ```
   
   **IMPORTANTE**: Si ya tienes políticas creadas con nombres diferentes, primero elimínalas:
   ```sql
   -- Ver políticas existentes
   SELECT * FROM pg_policies WHERE tablename = 'materias';
   
   -- Eliminar política si existe (reemplaza 'nombre_politica' con el nombre real)
   DROP POLICY IF EXISTS "nombre_politica" ON materias;
   ```
   
   c. Para aplicar las políticas:
      1. Ve a la sección "Authentication" → "Policies"
      2. Selecciona la tabla `materias`
      3. Haz clic en "New Policy"
      4. Puedes usar el "Policy Generator" o pegar el SQL directamente
   
   Nota: Este es un esquema básico de RLS donde cualquier usuario autenticado puede realizar operaciones CRUD. 
   En un ambiente de producción, deberías restringir las operaciones según roles o propietarios de los registros.

3. Consideraciones del enfoque MVP:
  - ✅ Rápido de implementar y validar con usuarios
  - ✅ Ideal para aprender RLS directamente
  - ✅ Suficiente seguridad para prototipado mediante RLS
  - ⚠️ Para producción, considera migrar a una arquitectura con proxy backend

Siguientes pasos sugeridos para alumnos (call to action)

- Reemplazar `app.locals.items` por una tabla en Supabase/Postgres.
- Añadir validaciones en el frontend y en el backend (ej. longitudes, sanitización).
- Implementar paginación y búsqueda en el endpoint `/api/items`.
- Añadir tests unitarios para las rutas del servidor.

Si quieres, puedo:
- Añadir un script `npm start` en `package.json`.
- Implementar persistencia real en Supabase para `/api/items`.
- Crear un pequeño video corto (guía) mostrando el flujo: login, ver datos, CRUD.

---

Comentarios y ejemplos en el propio código para ayudar a la comprensión.
