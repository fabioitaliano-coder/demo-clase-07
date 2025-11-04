# Configuración de Usuario Demo para Supabase

## Opción 1: Crear usuario desde la UI de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Authentication** → **Users**
3. Haz clic en **"Add user"** → **"Create new user"**
4. Completa los datos:
   - Email: `demo@demo.com`
   - Password: `demo1234`
   - Auto Confirm User: ✅ (activar)
5. Haz clic en **"Create user"**

## Opción 2: Crear usuario usando curl (desde PowerShell)

```powershell
curl 'https://totncpflkegzxznqcokf.supabase.co/auth/v1/signup' `
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdG5jcGZsa2Vnenh6bnFjb2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTE5MzksImV4cCI6MjA3NjYyNzkzOX0.CsH9-aNWuQcSBkMg4tEzuWycWYLysWVtDWy8s6TeHNU" `
  -H "Content-Type: application/json" `
  -d '{"email":"demo@demo.com","password":"demo1234"}'
```

## Opción 3: Probar login con usuario existente

Si ya tienes un usuario creado, puedes probar el login con:

```powershell
curl 'https://totncpflkegzxznqcokf.supabase.co/auth/v1/token?grant_type=password' `
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdG5jcGZsa2Vnenh6bnFjb2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTE5MzksImV4cCI6MjA3NjYyNzkzOX0.CsH9-aNWuQcSBkMg4tEzuWycWYLysWVtDWy8s6TeHNU" `
  -H "Content-Type: application/json" `
  -d '{"email":"TU_EMAIL","password":"TU_PASSWORD"}'
```

## Verificar configuración de Email en Supabase

1. Ve a **Authentication** → **Providers** → **Email**
2. Asegúrate de que:
   - **Enable Email provider**: ✅ Activado
   - **Confirm email**: ❌ Desactivado (para desarrollo/MVP)
   
Si "Confirm email" está activado, el usuario necesitará confirmar su email antes de poder loguearse.

## Credenciales de prueba recomendadas

```
Email: demo@demo.com
Password: demo1234
```

## Después de crear el usuario

1. Reinicia el navegador (o haz Ctrl+Shift+R para hard refresh)
2. Ve a `http://localhost:3000/login.html`
3. Ingresa:
   - Email: `demo@demo.com`
   - Password: `demo1234`
4. Deberías ser redirigido a `/materias.html`

## Troubleshooting

Si el login sigue sin funcionar:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta hacer login
4. Busca la petición a `/auth/v1/token`
5. Revisa la respuesta para ver el error específico

Errores comunes:
- **"Email not confirmed"**: Desactiva "Confirm email" en Supabase
- **"Invalid login credentials"**: El usuario no existe o la contraseña es incorrecta
- **"User not found"**: El usuario no ha sido creado
