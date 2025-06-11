// auth.js - Funciones para la autenticación de usuarios

// URL base de la API de autenticación
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? "https://api.backaround.mooo.com" 
  : "http://localhost:3000";

// Función para verificar la respuesta de la API
const checkResponse = (res) => {
  if (res.ok) {
    return res.json();
  }
  // Para errores 401 en rutas de autenticación, manejamos de forma especial
  if (res.status === 401 && (window.location.pathname === '/signin' || window.location.pathname === '/signup')) {
    console.warn('Error de autenticación en ruta de autenticación, continuando sin bloquear la UI');
    return Promise.reject({ status: res.status, message: 'Error de autenticación' });
  }
  return Promise.reject(`Error: ${res.status}`);
};

// Función para el registro de usuarios
export const register = ({ email, password, name, about, avatar }) => {
  return fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name, about, avatar }),
  }).then(checkResponse);
};

// Función para la autorización de usuarios
export const login = ({ email, password }) => {
  return fetch(`${BASE_URL}/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then(checkResponse)
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        return data;
      }
    });
};

// Función para verificar el token del usuario
export const checkToken = (token) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  .then(checkResponse)
  .catch(err => {
    // Si estamos en una ruta de autenticación, no bloqueamos la UI con errores
    if (window.location.pathname === '/signin' || window.location.pathname === '/signup') {
      console.warn('Error al verificar token en ruta de autenticación, continuando sin bloquear la UI');
      return Promise.reject(err);
    }
    return Promise.reject(err);
  });
};
