// Función para mostrar formulario de login/registro
function showAuthForms() {
  document.getElementById('app-content').style.display = 'none';
  document.getElementById('auth-forms').style.display = 'block';
}

// Función para ocultar formularios de auth y mostrar contenido
function showAppContent() {
  document.getElementById('auth-forms').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';
}

// Función para registrar usuario
async function registerUser() {
  const nombre = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      showAppContent();
      loadAppData();
    } else {
      alert(data.error || 'Error al registrar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al conectar con el servidor');
  }
}

// Función para iniciar sesión
async function loginUser() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      // Mostrar nombre de usuario
      showUserName(data.user.nombre);
      showAppContent();
      loadAppData();
    } else {
      alert(data.error || 'Credenciales inválidas');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al conectar con Fel servidor');
  }
}

// Función para mostrar el nombre de usuario
function showUserName(nombre) {
  const usernameDisplay = document.getElementById('username-display');
  if (usernameDisplay) {
    usernameDisplay.textContent = nombre;
  } else {
    console.error('Elemento username-display no encontrado');
  }
}
// Función para verificar autenticación al cargar la página
async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    showAuthForms();
    return;
  }

  try {
    const response = await fetch('/api/verify-auth', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      showUserName(data.user.nombre);  // Mostrar el nombre
      showAppContent();
      loadAppData();
    } else {
      localStorage.removeItem('token');
      showAuthForms();
    }
  } catch (error) {
    console.error('Error:', error);
    showAuthForms();
  }
}

// Modificar tus funciones existentes para incluir el token
async function loadAppData() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/tareas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const tareas = await response.json();
      // Actualizar tu UI con las tareas
    }
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Hacer lo mismo para materias y otras peticiones
}

// Llamar a checkAuth cuando se carga la página
document.addEventListener('DOMContentLoaded', checkAuth);