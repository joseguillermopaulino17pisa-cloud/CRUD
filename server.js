const express = require("express");
const cors = require("cors");
const path = require("path");
const { readData, writeData } = require("./database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"), {
  index: false
}));

// 👉 Ruta principal (login obligatorio)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// 👉 Bloquear acceso directo a index.html
app.get("/index.html", (req, res) => {
  res.redirect("/"); 
});

// 👉 Registro permitido
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/tasks-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* registrar */
app.post("/register", (req, res) => {
  const data = readData();
  const { username, password } = req.body;

  const userExists = data.users.find(u => u.username === username);
  if (userExists) return res.status(400).json({ msg: "Usuario ya existe" });

  data.users.push({ username, password });
  writeData(data);

  res.json({ msg: "Usuario creado" });
});

/* logear */
app.post("/login", (req, res) => {
  const data = readData();
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Datos incompletos" });
  }

  const user = data.users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.status(400).json({ msg: "Datos incorrectos" });

  res.json({ msg: "Login exitoso", username });
});


// 👉 Obtener tareas del usuario
app.get("/tasks/:username", (req, res) => {
  const data = readData();
 const tasks = data.tasks
  .filter(t => t.username === req.params.username)
  .map(t => ({
    ...t,
    completed: t.completed || false
  }));
  res.json(tasks);
});

// 👉 Crear tareas
app.post("/tasks", (req, res) => {
  const data = readData();
  const task = req.body;

  if (!task.username) {
    return res.status(400).json({ msg: "Usuario requerido" });
  }

  data.tasks.push({
  ...task,
  completed: false
});
  writeData(data);

  res.json({ msg: "Tarea creada" });
});

// 👉 Actualizar tareas
app.put("/tasks/:id", (req, res) => {
  const data = readData();
  const id = req.params.id;

  data.tasks = data.tasks.map(t =>
    t.id == id ? { ...t, ...req.body } : t
  );

  writeData(data);
  res.json({ msg: "Tarea actualizada" });
});

// 👉 Eliminar tareas
app.delete("/tasks/:id", (req, res) => {
  const data = readData();
  const id = req.params.id;

  data.tasks = data.tasks.filter(t => t.id != id);
  writeData(data);

  res.json({ msg: "Tarea eliminada" });
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});