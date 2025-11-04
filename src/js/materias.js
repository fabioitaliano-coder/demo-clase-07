// src/js/materias.js
/*
 * MVP (Minimum Viable Product) - CRUD Materias con Supabase
 * 
 * ENFOQUE MVP:
 * Este código implementa una conexión directa a Supabase desde el frontend para:
 * 1. Facilitar el aprendizaje de Row Level Security (RLS)
 * 2. Permitir una iteración rápida del producto
 * 3. Validar funcionalidades con usuarios potenciales
 * 4. Minimizar la complejidad inicial
 * 
 * ⚠️ CONSIDERACIONES PARA PRODUCCIÓN:
 * En un ambiente productivo, deberías:
 * 1. Implementar un backend proxy para las operaciones Supabase
 * 2. Mover las credenciales al backend
 * 3. Añadir validaciones robustas
 * 4. Implementar manejo de errores más sofisticado
 * 5. Añadir rate limiting
 * 6. Implementar logging y monitoreo
 * 
 * Por ahora, la seguridad se maneja a través de RLS en Supabase,
 * lo cual es suficiente para un MVP educativo.
 */

// Requisitos: configurar `supabaseUrl` y `supabaseKey` con las credenciales
// del proyecto Supabase que contiene la tabla `materias`.

// --- CONFIGURACIÓN ---
const supabaseUrl = 'https://totncpflkegzxznqcokf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdG5jcGZsa2Vnenh6bnFjb2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTE5MzksImV4cCI6MjA3NjYyNzkzOX0.CsH9-aNWuQcSBkMg4tEzuWycWYLysWVtDWy8s6TeHNU';

// Crear cliente Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Verificar si hay un token de sesión
const token = localStorage.getItem('token');
if (!token) {
    // Si no hay token, redirigir al login
    window.location.href = '/login.html';
} else {
    // Establecer la sesión en el cliente de Supabase
    supabase.auth.setSession({
        access_token: token,
        refresh_token: '' // En este MVP no manejamos refresh token
    });
}

// --- Elementos del DOM ---
const materiasContainer = document.getElementById('materias-container');
const logoutBtn = document.getElementById('logout-button');
const form = document.getElementById('materia-form');
const nombreInput = document.getElementById('materia-nombre');
const descripcionInput = document.getElementById('materia-descripcion');
const idInput = document.getElementById('materia-id');
const cancelBtn = document.getElementById('materia-cancel');
const btnNuevaMateria = document.getElementById('btn-nueva-materia');

// Mostrar formulario al hacer clic en "Agregar Nueva Materia"
btnNuevaMateria.addEventListener('click', () => {
  form.classList.remove('hidden');
  idInput.value = ''; // Limpiar ID para indicar nueva materia
  nombreInput.value = '';
  descripcionInput.value = '';
  nombreInput.focus();
});

// Logout: limpiar token local y volver al login
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

// Al cargar la página, listamos las materias
window.addEventListener('load', async () => {
  // Debug: Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Sesión actual:', session);
  if (sessionError) console.error('Error de sesión:', sessionError);
  
  await loadMaterias();
});

// Cargar todas las materias desde Supabase
async function loadMaterias() {
  materiasContainer.innerHTML = '<p class="text-center text-gray-400">Cargando materias...</p>';
  try {
    // SELECT * FROM materias
    const { data, error } = await supabase.from('materias').select('*').order('id', { ascending: true });
    if (error) throw error;

    renderMaterias(data || []);
  } catch (err) {
    console.error('Error al cargar materias:', err);
    materiasContainer.innerHTML = `
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p class="font-bold">Error al cargar materias</p>
        <p class="text-sm">${err.message}</p>
      </div>
    `;
  }
}

// Renderiza la lista de materias en el DOM
function renderMaterias(items) {
  if (!items.length) {
    materiasContainer.innerHTML = '<p class="text-gray-500">No hay materias registradas.</p>';
    return;
  }

  const html = items.map(m => `
    <div class="border-b border-gray-200 py-3 flex justify-between items-center">
      <div>
        <p class="font-semibold text-gray-800">${escapeHtml(m.nombre)}</p>
        <p class="text-sm text-gray-600">${escapeHtml(m.descripcion || '')}</p>
      </div>
      <div>
        <button data-id="${m.id}" class="edit-btn bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded mr-2">Editar</button>
        <button data-id="${m.id}" class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Borrar</button>
      </div>
    </div>
  `).join('');

  materiasContainer.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-md mt-2">
      <h3 class="text-lg font-semibold mb-3">Lista de Materias</h3>
      <div id="materias-list">${html}</div>
    </div>
  `;

  // event listeners
  document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', onEdit));
  document.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', onDelete));
}

// Crear nueva materia
async function createMateria(payload) {
  const { data, error } = await supabase.from('materias').insert(payload).select();
  if (error) throw error;
  return data[0];
}

// Actualizar materia por id
async function updateMateria(id, payload) {
  const { data, error } = await supabase.from('materias').update(payload).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

// Borrar materia por id
async function deleteMateria(id) {
  const { data, error } = await supabase.from('materias').delete().eq('id', id).select();
  if (error) throw error;
  return data[0];
}

// Handlers
async function onEdit(e) {
  const id = e.currentTarget.dataset.id;
  // Obtener registro actual desde DB para llenar el formulario
  const { data, error } = await supabase.from('materias').select('*').eq('id', id).limit(1).single();
  if (error) return alert('Error al obtener materia: ' + error.message);
  
  // Mostrar el formulario
  form.classList.remove('hidden');
  
  // Llenar el formulario con los datos
  idInput.value = data.id;
  nombreInput.value = data.nombre;
  descripcionInput.value = data.descripcion || '';
  
  // Hacer scroll al formulario y dar foco
  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  nombreInput.focus();
}

async function onDelete(e) {
  const id = e.currentTarget.dataset.id;
  if (!confirm('¿Confirma eliminar la materia?')) return;
  try {
    console.log('Intentando borrar materia con ID:', id);
    const result = await deleteMateria(id);
    console.log('Resultado del borrado:', result);
    await loadMaterias();
  } catch (err) {
    console.error('Error completo al borrar:', err);
    alert('Error al borrar: ' + err.message + '\n\nVerifica que la política RLS para DELETE esté configurada.');
  }
}

// Form submit: crea o actualiza
form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const id = idInput.value;
  const payload = { nombre: nombreInput.value.trim() };
  
  // Solo agregar descripcion si el campo existe y tiene valor
  const descripcion = descripcionInput.value.trim();
  if (descripcion) {
    payload.descripcion = descripcion;
  }
  
  if (!payload.nombre) return alert('El nombre es obligatorio');
  
  try {
    if (id) {
      await updateMateria(id, payload);
    } else {
      await createMateria(payload);
    }
    // limpiar y recargar
    idInput.value = '';
    nombreInput.value = '';
    descripcionInput.value = '';
    form.classList.add('hidden'); // Ocultar formulario después de guardar
    await loadMaterias();
  } catch (err) {
    console.error('Error completo al guardar:', err);
    alert('Error al guardar materia: ' + err.message + '\n\n¿Falta la columna descripcion o las políticas RLS?');
  }
});

cancelBtn.addEventListener('click', () => {
  idInput.value = '';
  nombreInput.value = '';
  descripcionInput.value = '';
  form.classList.add('hidden'); // Ocultar formulario al cancelar
});

// Small util to avoid XSS when inserting raw strings into innerHTML
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
