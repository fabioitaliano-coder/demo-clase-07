const contenedor = document.getElementById('lista-de-datos');
const logoutButton = document.getElementById('logout-button');

// Función para cerrar sesión
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});

// Cargar datos al iniciar la página
window.addEventListener('load', async () => {
    const token = localStorage.getItem('token');
    
    // Verificar si hay token
    if (!token) {
        // Si no hay token, redirigir al login
        window.location.href = '/login.html';
        return;
    }

    try {
        // Hacer la petición a la ruta protegida
        const response = await fetch('/api/data', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const datos = await response.json();
            // Mostrar los datos en el contenedor
            contenedor.innerHTML = '<h3 class="text-lg font-semibold mb-3 text-gray-700">Dashboard</h3>';
            // Mostrar el mensaje de estado
            if (datos.message) {
                contenedor.innerHTML += `
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        <p class="text-sm">${datos.message}</p>
                    </div>
                `;
            }
            // Mostrar información del usuario
            if (datos.user) {
                contenedor.innerHTML += `
                    <div class="bg-white shadow rounded-lg p-6 mb-4">
                        <h4 class="text-xl font-semibold mb-4">Información del Usuario</h4>
                        <div class="space-y-2">
                            ${Object.entries(datos.user)
                                .filter(([key]) => key !== 'password' && key !== 'token')
                                .map(([key, value]) => `
                                    <div class="flex border-b border-gray-200 py-2">
                                        <span class="font-semibold text-gray-600 w-1/3">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                        <span class="text-gray-800">${value}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                `;
            }
        } else if (response.status === 401) {
            // ❌ Token inválido o expirado
            alert('Tu sesión expiró. Por favor, inicia sesión de nuevo.');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        } else {
            // ❌ Otro error del servidor
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        // ❌ Error de red o del servidor
        console.error('Error al cargar datos:', error);
        contenedor.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p class="font-bold">Error al cargar los datos</p>
                <p class="text-sm">${error.message}</p>
            </div>
        `;
    }
});