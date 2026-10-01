// app.js - Módulo de Gestión
const form = document.querySelector('#todo-form');
const titulo = document.querySelector('#titulo');
const curso = document.querySelector('#curso');
const fechaEntrega = document.querySelector('#fechaEntrega');
const list = document.querySelector('#todo-list');
const alertas = document.querySelector('#alertas');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

let filtroActual = 'todas';

const guardarTareas = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

const mostrarAlerta = (mensaje, tipo = 'danger') => {
    alertas.innerHTML = `
        <div class="alert alert-${tipo}">
            ${mensaje}
        </div>
    `;
    setTimeout(() => {
        alertas.innerHTML = '';
    }, 3000);
};

const obtenerTareas = () => {

    if (filtroActual === 'pendientes') {
        return tasks.filter(task => !task.completada);
    }
    if (filtroActual === 'completadas') {
        return tasks.filter(task => task.completada);
    }
    return tasks;
};

const renderTasks = () => {

    list.innerHTML = '';

    const tareasMostrar = obtenerTareas();

    if (tareasMostrar.length === 0) {

        list.innerHTML = `
            <li class="list-group-item text-center">
                No hay tareas para mostrar.
            </li>
        `;

        return;
    }

    tareasMostrar.forEach(task => {

        const li = document.createElement('li');
        li.className ='list-group-item d-flex justify-content-between align-items-center';
        const contenido = document.createElement('div');
        const tituloTarea = document.createElement('strong');
        tituloTarea.textContent = task.titulo;
        if (task.completada) {
            tituloTarea.classList.add('completada');
        }
        const informacion = document.createElement('div');
        informacion.innerHTML = `
            <small>
                Curso: ${task.curso} |
                Fecha de entrega: ${task.fechaEntrega}
            </small>
        `;
        contenido.appendChild(tituloTarea);
        contenido.appendChild(document.createElement('br'));
        contenido.appendChild(informacion);
        const botones = document.createElement('div');
        const botonCompletar = document.createElement('button');
        botonCompletar.className =
            task.completada
                ? 'btn btn-warning btn-sm me-2'
                : 'btn btn-success btn-sm me-2';
        botonCompletar.textContent =
            task.completada
                ? 'Pendiente'
                : 'Completar';
        botonCompletar.addEventListener('click', () => {
            cambiarEstado(task.id);
        });
        const botonEliminar = document.createElement('button');
        botonEliminar.className =
            'btn btn-danger btn-sm';
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.addEventListener('click', () => {
            eliminarTarea(task.id);
        });
        botones.appendChild(botonCompletar);
        botones.appendChild(botonEliminar);
        li.appendChild(contenido);
        li.appendChild(botones);
        list.appendChild(li);
    });
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    
    tasks.push({ text, completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    input.value = '';
    renderTasks();
});

function deleteTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

document.addEventListener('DOMContentLoaded', renderTasks);