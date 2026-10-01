// Elementos del DOM
const form = document.querySelector('#todo-form');
const titulo = document.querySelector('#titulo');
const curso = document.querySelector('#curso');
const fechaEntrega = document.querySelector('#fechaEntrega');
const list = document.querySelector('#todo-list');
const alertas = document.querySelector('#alertas');

// Cargar tareas desde localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Filtro actual
let filtroActual = 'todas';

// Guardar tareas
const guardarTareas = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Mostrar mensaje
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

// Obtener tareas según el filtro
const obtenerTareas = () => {

    if (filtroActual === 'pendientes') {
        return tasks.filter(task => !task.completada);
    }

    if (filtroActual === 'completadas') {
        return tasks.filter(task => task.completada);
    }

    return tasks;
};

// Mostrar tareas en el DOM
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

        li.className =
            'list-group-item d-flex justify-content-between align-items-center';

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

        // Botón completar
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

        // Botón eliminar
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

// Agregar tarea
form.addEventListener('submit', (e) => {

    e.preventDefault();

    const tituloTexto = titulo.value.trim();
    const cursoTexto = curso.value.trim();
    const fechaTexto = fechaEntrega.value;

    // Validar campos vacíos
    if (!tituloTexto || !cursoTexto || !fechaTexto) {
        mostrarAlerta('Todos los campos son obligatorios.');
        return;
    }

    // Obtener fecha actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Convertir fecha ingresada
    const fechaSeleccionada = new Date(fechaTexto + 'T00:00:00');

    // Validar fecha
    if (fechaSeleccionada <= hoy) {
        mostrarAlerta(
            'La fecha de entrega debe ser posterior a la fecha actual.'
        );

        return;
    }

    // Crear nueva tarea
    const nuevaTarea = {
        id: Date.now(),
        titulo: tituloTexto,
        curso: cursoTexto,
        fechaEntrega: fechaTexto,
        completada: false
    };

    // Agregar tarea al arreglo
    tasks.push(nuevaTarea);

    // Guardar en localStorage
    guardarTareas();

    // Limpiar formulario
    form.reset();

    // Mostrar tareas
    renderTasks();

    mostrarAlerta(
        'Tarea agregada correctamente.',
        'success'
    );
});

// Cambiar estado de tarea
const cambiarEstado = (id) => {

    const tarea = tasks.find(task => task.id === id);

    if (!tarea) {
        return;
    }

    tarea.completada = !tarea.completada;

    guardarTareas();

    renderTasks();
};

// Eliminar tarea
const eliminarTarea = (id) => {

    tasks = tasks.filter(task => task.id !== id);

    guardarTareas();

    renderTasks();

    mostrarAlerta(
        'Tarea eliminada correctamente.',
        'success'
    );
};

// Cambiar filtro
const cambiarFiltro = (filtro) => {

    filtroActual = filtro;

    renderTasks();
};

// Mostrar tareas cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
});