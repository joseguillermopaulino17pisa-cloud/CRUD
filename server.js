const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const auth = require("./middleware/auth");

const {
  connectDB,
  createTables
} = require("./database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public"), {
  index: false
}));

// Crear tablas
createTables();


// 👉 Login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});


// 👉 Bloquear acceso directo
app.get("/index.html", (req, res) => {
  res.redirect("/");
});


// 👉 Registro
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});


// 👉 Página tareas protegida
app.get("/tasks-page", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


/* =========================
   REGISTRO
========================= */

app.post("/register", async (req, res) => {

  const db = await connectDB();

  const { username, password } = req.body;

  if (!username || !password) {
  return res.status(400).json({
    msg: "Datos incompletos"
  });
}

// Validar correo
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(username)) {
  return res.status(400).json({
    msg: "Debes ingresar un correo válido"
  });
}

  const userExists = await db.get(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (userExists) {
    return res.status(400).json({
      msg: "Usuario ya existe"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.run(
    "INSERT INTO users(username, password) VALUES(?, ?)",
    [username, hashedPassword]
  );

  res.json({
    msg: "Usuario creado"
  });

});



/* =========================
   LOGIN
========================= */

app.post("/login", async (req, res) => {

  const db = await connectDB();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      msg: "Datos incompletos"
    });
  }

  const user = await db.get(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (!user) {
    return res.status(400).json({
      msg: "Usuario no encontrado"
    });
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword) {
    return res.status(400).json({
      msg: "Contraseña incorrecta"
    });
  }

 const token = jwt.sign(
  { username },
  "secreto123",
  { expiresIn: "1h" }
);

res.cookie("token", token, {
  httpOnly: true
});

res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  maxAge: 3600000
});

res.json({
  msg: "Login exitoso",
  token
});

});



/* =========================
   OBTENER TAREAS
========================= */

app.get("/tasks", auth, async (req, res) => {

  const db = await connectDB();

  const tasks = await db.all(
    "SELECT * FROM tasks WHERE username = ?",
    [req.username]
  );

  const formatted = tasks.map(t => ({
    ...t,
    completed: !!t.completed
  }));

  res.json(formatted);

});



/* =========================
   CREAR TAREA
========================= */

app.post("/tasks", auth, async (req, res) => {

  const db = await connectDB();

  const { id, text } = req.body;

  if (!text) {
    return res.status(400).json({
      msg: "Texto requerido"
    });
  }

  await db.run(
    `
    INSERT INTO tasks(id, text, completed, username)
    VALUES(?, ?, ?, ?)
    `,
    [
      id,
      text,
      0,
      req.username
    ]
  );

  res.json({
    msg: "Tarea creada"
  });

});



/* =========================
   ACTUALIZAR TAREA
========================= */

app.put("/tasks/:id", auth, async (req, res) => {

  const db = await connectDB();

  const id = req.params.id;

  const task = await db.get(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

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

  const newText =
    req.body.text !== undefined
      ? req.body.text
      : task.text;

  const newCompleted =
    req.body.completed !== undefined
      ? req.body.completed
      : task.completed;

  await db.run(
    `
    UPDATE tasks
    SET text = ?, completed = ?
    WHERE id = ?
    `,
    [
      newText,
      newCompleted ? 1 : 0,
      id
    ]
  );

  res.json({
    msg: "Tarea actualizada"
  });

});



/* =========================
   ELIMINAR TAREA
========================= */

app.delete("/tasks/:id", auth, async (req, res) => {

  const db = await connectDB();

  const id = req.params.id;

  const task = await db.get(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

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

  await db.run(
    "DELETE FROM tasks WHERE id = ?",
    [id]
  );

  res.json({
    msg: "Tarea eliminada"
  });

});



app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});