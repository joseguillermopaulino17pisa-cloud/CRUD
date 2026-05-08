const URL = "http://localhost:3000";

let user = localStorage.getItem("user");
let token = localStorage.getItem("token");

/* Login */
async function login() {

  const username = document.getElementById("user").value;
  const password = document.getElementById("pass").value;

  const res = await fetch(URL + "/login", {

    method: "POST",

    headers: {
      "Content-Type":"application/json"
    },

    body: JSON.stringify({
      username,
      password
    })

  });

  const data = await res.json();

  if (res.ok) {

    localStorage.setItem("user", username);
    localStorage.setItem("token", data.token);

    window.location = "/tasks-page";

  } else {

    alert("Error al iniciar sesión");

  }

}


/* Registro */
async function register() {

  const username = document.getElementById("user").value;
  const password = document.getElementById("pass").value;

  const res = await fetch(URL + "/register", {

    method: "POST",

    headers: {
      "Content-Type":"application/json"
    },

    body: JSON.stringify({
      username,
      password
    })

  });

  const data = await res.json();

  if (res.ok) {

    alert("Cuenta creada");

    window.location = "/";

  } else {

    alert(data.msg);

  }

}


/* Cargar tareas */
async function loadTasks() {

  const res = await fetch(URL + "/tasks", {

    headers: {
      authorization: token
    }

  });

  const data = await res.json();

  const list = document.getElementById("list");

  list.innerHTML = "";

  data.forEach(t => {

    const li = document.createElement("li");

    li.innerHTML = `
      <span style="text-decoration:${t.completed ? 'line-through' : 'none'}">
        ${t.text}
      </span>

      <div class="task-buttons">
        <button class="complete">${t.completed ? '❌' : '✔️'}</button>
        <button class="edit">✏️</button>
        <button class="delete">🗑️</button>
      </div>
    `;

    li.querySelector(".complete").onclick = () =>
      toggleTask(t.id, t.completed);

    li.querySelector(".edit").onclick = () =>
      editTask(t.id, t.text);

    li.querySelector(".delete").onclick = () =>
      deleteTask(t.id);

    list.appendChild(li);

  });

}


/* Agregar tarea */
async function addTask() {

  const input = document.getElementById("taskInput");

  const text = input.value;

  if (!text) {
    return alert("Escribe una tarea");
  }

  await fetch(URL + "/tasks", {

    method: "POST",

    headers: {
      "Content-Type":"application/json",
      authorization: token
    },

    body: JSON.stringify({
      id: Date.now(),
      text
    })

  });

  input.value = "";

  loadTasks();

}


/* Editar tarea */
async function editTask(id, oldText) {

  const newText = prompt("Editar tarea:", oldText);

  if (!newText || newText.trim() === "") {
    return alert("No puedes dejar la tarea vacía");
  }

  await fetch(URL + "/tasks/" + id, {

    method: "PUT",

    headers: {
      "Content-Type":"application/json",
      authorization: token
    },

    body: JSON.stringify({
      text: newText
    })

  });

  loadTasks();

}


/* Completar tarea */
async function toggleTask(id, currentState) {

  await fetch(URL + "/tasks/" + id, {

    method: "PUT",

    headers: {
      "Content-Type":"application/json",
      authorization: token
    },

    body: JSON.stringify({
      completed: !currentState
    })

  });

  loadTasks();

}


/* Eliminar tarea */
async function deleteTask(id) {

  await fetch(URL + "/tasks/" + id, {

    method: "DELETE",

    headers: {
      authorization: token
    }

  });

  loadTasks();

}


/* Logout */
function logout() {

  localStorage.removeItem("user");
  localStorage.removeItem("token");

  window.location = "/";

}


/* Verificar sesión */
window.onload = () => {

  user = localStorage.getItem("user");
  token = localStorage.getItem("token");

  if (window.location.pathname.includes("tasks-page")) {

    if (!user || !token) {

      alert("Debes iniciar sesión");

      window.location = "/";

    } else {

      loadTasks();

    }

  }

};