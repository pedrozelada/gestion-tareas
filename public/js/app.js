const API_MATERIAS = '/api/materias';
const API_TAREAS = '/api/tareas';

// Elementos del DOM
const listaMaterias = document.getElementById('listaMaterias');
const listaTareas = document.getElementById('listaTareas');
const formMateria = document.getElementById('formMateria');
const formTarea = document.getElementById('formTarea');
const buscarMateria = document.getElementById('buscarMateria');
const buscarTarea = document.getElementById('buscarTarea');

const materiaTarea = document.getElementById('materiaTarea');
const nombreMateria = document.getElementById('nombreMateria');
const colorMateria = document.getElementById('colorMateria');

const tituloTarea = document.getElementById('tituloTarea');
const descripcionTarea = document.getElementById('descripcionTarea');
const fechaEntrega = document.getElementById('fechaEntrega');

// Modal de edición
const modalEditar = new bootstrap.Modal(document.getElementById('modalEditarTarea'));
const formEditarTarea = document.getElementById('formEditarTarea');
const editTareaId = document.getElementById('editTareaId');
const editMateriaTarea = document.getElementById('editMateriaTarea');
const editTituloTarea = document.getElementById('editTituloTarea');
const editDescripcionTarea = document.getElementById('editDescripcionTarea');
const editFechaEntrega = document.getElementById('editFechaEntrega');

// Diccionario de materias para color y nombre
let materiasMap = {};

// Configurar headers para fetch con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Verificar estado de la respuesta
const checkAuthStatus = (response) => {
  if (response.status === 401) {
    logout();
    return false;
  }
  return true;
};

// Cargar datos al inicio (ahora se llama desde auth.js)
async function loadAppData() {
  await cargarMaterias();
  cargarTareas();
}

// ==================== CRUD Materias =====================

async function cargarMaterias(filtro = '') {
  let url = API_MATERIAS;
  if (filtro.trim()) url += `/nombre/${filtro}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!checkAuthStatus(response)) return;
    
    const materias = await response.json();

    materiasMap = {};
    listaMaterias.innerHTML = '';
    materiaTarea.innerHTML = '<option value="">Selecciona una materia</option>';
    editMateriaTarea.innerHTML = '<option value="">Selecciona una materia</option>';

    materias.forEach(m => {
      materiasMap[m.id] = m;
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <span>
          <span class="badge me-2" style="background:${m.color}">&#9632;</span>
          ${m.nombre}
        </span>
        <button class="btn btn-sm btn-danger" onclick="eliminarMateria(${m.id})">Eliminar</button>
      `;
      listaMaterias.appendChild(li);

      materiaTarea.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
      editMateriaTarea.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
    });
  } catch (error) {
    console.error('Error cargando materias:', error);
  }
}

formMateria.addEventListener('submit', async e => {
  e.preventDefault();
  
  const data = {
    nombre: nombreMateria.value,
    color: colorMateria.value
  };
  
  try {
    const response = await fetch(API_MATERIAS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!checkAuthStatus(response)) return;
    
    formMateria.reset();
    await cargarMaterias();
    cargarTareas();
  } catch (error) {
    console.error('Error:', error);
  }
});

async function eliminarMateria(id) {
  if (!confirm('Para eliminar esta materia se deben eliminar primero las tareas de esta materia.')) return;
  
  try {
    const response = await fetch(`${API_MATERIAS}/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!checkAuthStatus(response)) return;
    
    await cargarMaterias();
    cargarTareas();
  } catch (error) {
    console.error('Error:', error);
  }
}

buscarMateria.addEventListener('input', () => {
  cargarMaterias(buscarMateria.value);
});

// ==================== CRUD Tareas =====================

async function cargarTareas(filtro = '') {
  let url = API_TAREAS;
  if (filtro.trim()) url += `/nombre/${filtro}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!checkAuthStatus(response)) return;
    
    const tareas = await response.json();

    listaTareas.innerHTML = '';
    tareas.forEach(t => {
      const materia = materiasMap[t.materia_id] || { nombre: 'Sin materia', color: '#ccc' };

      const fecha = new Date(t.fecha_entrega);
      const fechaValida = !isNaN(fecha.getTime()) ? fecha.toLocaleDateString() : '';

      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.style.backgroundColor = materia.color;
      li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <strong>${t.titulo}</strong>
          <small>${fechaValida}</small>
        </div>
        <div class="mb-1"><em>${materia.nombre}</em></div>
        <div class="mb-2">${t.descripcion}</div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-sm btn-outline-light" onclick='abrirEditar(${JSON.stringify(t)})'>Editar</button>
          <button class="btn btn-sm btn-outline-dark" onclick="eliminarTarea(${t.id})">Eliminar</button>
        </div>
      `;
      listaTareas.appendChild(li);
    });
  } catch (error) {
    console.error('Error cargando tareas:', error);
  }
}

formTarea.addEventListener('submit', async e => {
  e.preventDefault();
  
  const data = {
    materia_id: materiaTarea.value,
    titulo: tituloTarea.value,
    descripcion: descripcionTarea.value,
    fecha_entrega: fechaEntrega.value
  };
  
  try {
    const response = await fetch(API_TAREAS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!checkAuthStatus(response)) return;
    
    formTarea.reset();
    cargarTareas();
  } catch (error) {
    console.error('Error:', error);
  }
});

async function eliminarTarea(id) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  
  try {
    const response = await fetch(`${API_TAREAS}/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!checkAuthStatus(response)) return;
    
    cargarTareas();
  } catch (error) {
    console.error('Error:', error);
  }
}

function abrirEditar(tarea) {
  editTareaId.value = tarea.id;
  editMateriaTarea.value = tarea.materia_id;
  editTituloTarea.value = tarea.titulo;
  editDescripcionTarea.value = tarea.descripcion;
  editFechaEntrega.value = tarea.fecha_entrega ? tarea.fecha_entrega.slice(0, 10) : '';
  modalEditar.show();
}

formEditarTarea.addEventListener('submit', async e => {
  e.preventDefault();
  const id = editTareaId.value;
  const data = {
    materia_id: editMateriaTarea.value,
    titulo: editTituloTarea.value,
    descripcion: editDescripcionTarea.value,
    fecha_entrega: editFechaEntrega.value
  };
  
  try {
    const response = await fetch(`${API_TAREAS}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!checkAuthStatus(response)) return;
    
    modalEditar.hide();
    cargarTareas();
  } catch (error) {
    console.error('Error:', error);
  }
});

buscarTarea.addEventListener('input', () => {
  cargarTareas(buscarTarea.value);
});

// Función para cerrar sesión (llamada desde el botón en HTML)
function logout() {
  localStorage.removeItem('token');
  window.location.reload();
}

// Hacer funciones accesibles globalmente
window.eliminarMateria = eliminarMateria;
window.eliminarTarea = eliminarTarea;
window.abrirEditar = abrirEditar;
window.logout = logout;