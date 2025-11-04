// src/js/login.js
// Script del frontend para manejar el formulario de login.
// Flujo:
// 1) El usuario envía email/password
// 2) Se utiliza el cliente Supabase (CDN) para autenticar
// 3) Si es exitoso, se guarda el token en localStorage y se redirige al dashboard
// Nota didáctica: guardamos el token en localStorage por simplicidad. En
// una app real evaluar alternativas (httpOnly cookies, refresh token, etc.).

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// Inicializar el cliente de Supabase (usar la URL y KEY de tu proyecto)
const supabaseUrl = 'https://totncpflkegzxznqcokf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdG5jcGZsa2Vnenh6bnFjb2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTE5MzksImV4cCI6MjA3NjYyNzkzOX0.CsH9-aNWuQcSBkMg4tEzuWycWYLysWVtDWy8s6TeHNU';
// La librería Supabase se carga en el HTML desde CDN y añade `window.supabase`
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que el formulario recargue la página
    
    // Limpiar mensajes de error previos
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
    
    // Obtener valores de los inputs
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    try {
        // Login directamente con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value
        });

        if (error) {
            // ❌ Error de autenticación
            throw error;
        }

        if (data?.session) {
            // ✅ Login exitoso
            // Guardar el token JWT y establecer la sesión
            localStorage.setItem('token', data.session.access_token);
            
            // Establecer la sesión en el cliente de Supabase
            await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            });
            
        // Redirigir a la vista de Materias (nuevo flujo)
        window.location.href = '/materias.html';
        } else {
            // ❌ Respuesta inesperada
            throw new Error('No se recibió sesión en la respuesta');
        }
    } catch (error) {
        // ❌ Error de red o del servidor
        console.error('Error al iniciar sesión:', error);
        errorMessage.textContent = error.message || 'Ocurrió un error. Por favor, intenta nuevamente.';
        errorMessage.classList.remove('hidden');
    }
});