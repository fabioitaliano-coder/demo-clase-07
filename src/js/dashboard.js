// src/js/dashboard.js
// Lógica del dashboard protegido:
// - Verifica que exista un token en localStorage
// - Llama a /api/data para mostrar información del usuario
// - Carga una lista de "items" desde /api/items y permite CRUD contra esas rutas
// Este archivo sirve como ejemplo para que los alumnos lo adapten a sus modelos.

const contenedor = document.getElementById('lista-de-datos');
const logoutButton = document.getElementById('logout-button');
const itemForm = document.getElementById('item-form');
const itemNombre = document.getElementById('item-nombre');
const itemDescripcion = document.getElementById('item-descripcion');
const itemIdInput = document.getElementById('item-id');
const itemCancel = document.getElementById('item-cancel');

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
        // Cargar info de usuario
        const userResp = await fetch('/api/data', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!userResp.ok) throw new Error('No se pudo obtener información del usuario');
        const userData = await userResp.json();

        // Mostrar datos básicos del usuario
        contenedor.innerHTML = '<h3 class="text-lg font-semibold mb-3 text-gray-700">Dashboard</h3>';
        if (userData.message) {
            contenedor.innerHTML += `
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <p class="text-sm">${userData.message}</p>
                </div>
            `;
        }

        if (userData.user) {
            contenedor.innerHTML += `
                <div class="bg-white shadow rounded-lg p-6 mb-4">
                    <h4 class="text-xl font-semibold mb-4">Información del Usuario</h4>
                    <div class="space-y-2">
                        ${Object.entries(userData.user)
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

        // Cargar items
        await loadItems(token);

    } catch (error) {
        console.error('Error al cargar datos:', error);
        contenedor.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p class="font-bold">Error al cargar los datos</p>
                <p class="text-sm">${error.message}</p>
            </div>
        `;
    }
});

// Load items and render
async function loadItems(token) {
    const resp = await fetch('/api/items', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!resp.ok) {
        throw new Error('No se pudieron obtener los items');
    }
    const items = await resp.json();
    renderItems(items);
}

function renderItems(items) {
    const listHtml = items.length ? items.map(it => `
        <div class="border-b border-gray-200 py-3 flex justify-between items-center">
            <div>
                <p class="font-semibold text-gray-800">${it.nombre}</p>
                <p class="text-sm text-gray-600">${it.descripcion}</p>
            </div>
            <div>
                <button data-id="${it.id}" class="edit-btn bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded mr-2">Editar</button>
                <button data-id="${it.id}" class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Borrar</button>
            </div>
        </div>
    `).join('') : '<p class="text-gray-500">No hay registros.</p>';

    // Append after the user block
    contenedor.innerHTML += `
        <div class="bg-white p-4 rounded-lg shadow-md mt-4">
            <h3 class="text-lg font-semibold mb-3">Lista de Registros:</h3>
            <div id="items-list">${listHtml}</div>
        </div>
    `;

    // Attach event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', onEdit));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', onDelete));
}

async function onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const token = localStorage.getItem('token');
    // Fetch all items and find the one to edit
    const all = await (await fetch('/api/items', { headers: { 'Authorization': `Bearer ${token}` } })).json();
    const item = all.find(i => String(i.id) === String(id));
    if (!item) return alert('Item no encontrado');
    itemIdInput.value = item.id;
    itemNombre.value = item.nombre;
    itemDescripcion.value = item.descripcion;
}

async function onDelete(e) {
    if (!confirm('¿Confirma eliminar este registro?')) return;
    const id = e.currentTarget.dataset.id;
    const token = localStorage.getItem('token');
    const resp = await fetch(`/api/items/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!resp.ok) return alert('Error al borrar');
    await loadItems(token);
}

// Form handlers
itemForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const token = localStorage.getItem('token');
    const id = itemIdInput.value;
    const payload = { nombre: itemNombre.value, descripcion: itemDescripcion.value };
    try {
        if (id) {
            // update
            const resp = await fetch(`/api/items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (!resp.ok) throw new Error('Error al actualizar');
        } else {
            const resp = await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (!resp.ok) throw new Error('Error al crear');
        }
        // limpiar
        itemIdInput.value = '';
        itemNombre.value = '';
        itemDescripcion.value = '';
        await loadItems(token);
    } catch (err) {
        alert(err.message || 'Error');
    }
});

itemCancel.addEventListener('click', () => {
    itemIdInput.value = '';
    itemNombre.value = '';
    itemDescripcion.value = '';
});