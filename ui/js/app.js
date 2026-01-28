const apiUrl = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        const res = await fetch(`${apiUrl}/users/1`);
        const user = await res.json();
        if(user.email === email && user.password === password){
          window.location = 'dashboard.html';
        } else {
          document.getElementById('message').innerText='Invalid credentials';
        }
      } catch(err){
        document.getElementById('message').innerText='Error connecting API';
      }
    });
  }

  // Dashboard
  const tasksTable = document.getElementById('tasksTable');
  if(tasksTable){
    fetch(`${apiUrl}/tasks/1`)
      .then(res=>res.json())
      .then(tasks=>{
        const tbody = tasksTable.querySelector('tbody');
        tasks.forEach(t=>{
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${t.title}</td><td>${t.description}</td><td>${t.status}</td>
          <td><button onclick="editTask(${t.id})">Edit</button>
              <button onclick="deleteTask(${t.id})">Delete</button></td>`;
          tbody.appendChild(tr);
        });
      });
  }
});

function editTask(id){
  window.location = `task_form.html?id=${id}`;
}

function deleteTask(id){
  fetch(`${apiUrl}/tasks/${id}`, {method:'DELETE'})
    .then(()=> window.location.reload());
}
