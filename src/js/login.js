const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// Inicializar el cliente de Supabase
const supabaseUrl = 'https://nelfuehxnqcrkroikhdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbGZ1ZWh4bnFjcmtyb2lraGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTMzMjIsImV4cCI6MjA3NjYyOTMyMn0.aiZT1CmBi0AHkz_k1ZRKYbxq1-Je1I5dGS6-MflBClk';
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
            localStorage.setItem('token', data.session.access_token);
            
            // Redirigir al dashboard
            window.location.href = '/dashboard.html';
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