 Gestor de Tareas con API

Este proyecto es un gestor de tareas sencillo donde los usuarios pueden registrarse, iniciar sesión y guardar sus tareas.
Tiene un backend (API en Node.js) y un frontend básico en HTML y JavaScript.

 ¿Qué puede hacer?

Registrarse con nombre, email y contraseña

Iniciar sesión

Crear tareas

Ver sus tareas

Editar tareas

Eliminar tareas

Cada usuario solo ve sus propias tareas

-Tecnologías usadas

Node.js

Express

SQLite

JWT (autenticación)

HTML

JavaScript

-Estructura del proyecto
/proyecto
 ├─ server.js
 ├─ database.js
 ├─ tareas.db
 ├─ index.html
 ├─ login.html
 ├─ app.js
 └─ README.md
 -Cómo usar el proyecto

Instalar dependencias:

npm install express cors sqlite3 bcrypt jsonwebtoken

Iniciar el servidor:

node server.js

Abrir en el navegador:

login.html
