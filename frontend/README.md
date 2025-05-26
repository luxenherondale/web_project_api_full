# Tripleten web_project_around_auth

Autor: Adaly Arcia
PROYECTO 17: Se reutilizó el proyecto react del sprint 14, para agregarle una sección de inició de sesión y registro con autenticación de usuario y protección de datos.
URL APIS UTILIZADAS:
Para autenticación de usuario:https://se-register-api.en.tripleten-services.com/v1
Para el cargo de información de cards de un perfil pre hecho con un token de autorización dado se llamó a la api:https://around-api.es.tripleten-services.com/v1

TECNOLOGÍAS UTILIZADAS: REACT, VITE, APIs, JAVASCRIPT, CSS, GITHUB, FIGMA, JSON, HTML, POSTMAN, ETC.

El sitio web pasó de una galería de fotos con personalización de usuario y foto de perfil, indicador de likes y creación o eliminación de tarjetas, a un perfil propio con un correo y contraseña asignado, para el registro y uso de lo antes mencionado.
Protegiendo las rutas que no se le permiten acceder si no está iniciado sesión, obligando a un registro previo para control y seguridad de datos.

Usando la plantilla:

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
