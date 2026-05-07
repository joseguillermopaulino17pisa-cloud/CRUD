const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const auth = require("./middleware/auth");
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
app.post("/register", async (req, res) => {
  const data = readData();
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Datos incompletos" });
  }

  const userExists = data.users.find(u => u.username === username);

  if (userExists) {
    return res.status(400).json({ msg: "Usuario ya existe" });
  }

  // 🔐 Cifrar contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  data.users.push({
    username,
    password: hashedPassword
  });

  writeData(data);

  res.json({ msg: "Usuario creado" });
});

/* logear */
app.post("/login", async (req, res) => {
  const data = readData();
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Datos incompletos" });
  }

  // Buscar usuario
  const user = data.users.find(u => u.username === username);

  if (!user) {
    return res.status(400).json({ msg: "Usuario no encontrado" });
  }

  // Comparar contraseña cifrada
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(400).json({ msg: "Contraseña incorrecta" });
  }

  res.json({
    msg: "Login exitoso",
    username
  });
});


// 👉 Obtener tareas del usuario
app.get("/tasks", auth, (req, res) => {
  const data = readData();

  const tasks = data.tasks
    .filter(t => t.username === req.username)
    .map(t => ({
      ...t,
      completed: t.completed || false
    }));

  res.json(tasks);
});



// 👉 Crear tareas
app.post("/tasks", auth, (req, res) => {

  const data = readData();

  const { id, text } = req.body;

  if (!text) {
    return res.status(400).json({
      msg: "Texto requerido"
    });
  }

  data.tasks.push({
    id,
    text,
    username: req.username,
    completed: false
  });

  writeData(data);

  res.json({
    msg: "Tarea creada"
  });
});


// 👉 Actualizar tareas

app.put("/tasks/:id", auth, (req, res) => {
  const data = readData();
  const id = req.params.id;

  const task = data.tasks.find(t => t.id == id);

  if (!task) {
    return res.status(404).json({
      msg: "Tarea no encontrada"
    });
  }

  // 🔐 Verificar dueño
  if (task.username !== req.username) {
    return res.status(403).json({
      msg: "No autorizado"
    });
  }

  data.tasks = data.tasks.map(t =>
    t.id == id ? { ...t, ...req.body } : t
  );

  writeData(data);

  res.json({
    msg: "Tarea actualizada"
  });
});


app.put("/tasks/:id", auth, (req, res) => {
  const data = readData();
  const id = req.params.id;

  const task = data.tasks.find(t => t.id == id);

  if (!task) {
    return res.status(404).json({
      msg: "Tarea no encontrada"
    });
  }

  if (task.username !== req.username) {
    return res.status(403).json({
      msg: "No autorizado"
    });
  }

  data.tasks = data.tasks.map(t =>
    t.id == id ? { ...t, ...req.body } : t
  );

  writeData(data);

  res.json({
    msg: "Tarea actualizada"
  });
});



/* Eliminar tareas */
app.delete("/tasks/:id", auth, (req, res) => {

  const data = readData();

  const id = req.params.id;

  const task = data.tasks.find(t => t.id == id);

  if (!task) {
    return res.status(404).json({
      msg: "Tarea no encontrada"
    });
  }

  // 🔐 Verificar dueño
  if (task.username !== req.username) {
    return res.status(403).json({
      msg: "No autorizado"
    });
  }

  data.tasks = data.tasks.filter(t => t.id != id);

  writeData(data);

  res.json({
    msg: "Tarea eliminada"
  });
});



app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
