const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const archivoEstudiantes = path.join(__dirname, 'data', 'estudiantes.json');

function responderJSON(res, estado, datos) {
    res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(datos));
}

function leerEstudiantes(callback) {
    fs.readFile(archivoEstudiantes, 'utf8', (err, contenido) => {
        if (err) return callback(err);

        try {
            const estudiantes = JSON.parse(contenido);

            if (!Array.isArray(estudiantes)) {
                return callback(new Error('Formato inválido'));
            }

            callback(null, estudiantes);
        } catch {
            callback(new Error('JSON inválido'));
        }
    });
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        const archivo = path.join(__dirname, 'public', 'index.html');

        return fs.readFile(archivo, (err, contenido) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                return res.end('Error al leer la página');
            }

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(contenido);
        });
    }

    if (req.method === 'GET' && req.url === '/api/estudiantes') {
        return leerEstudiantes((err, estudiantes) => {
            if (err) {
                return responderJSON(res, 500, { mensaje: 'Error al leer estudiantes' });
            }

            responderJSON(res, 200, estudiantes);
        });
    }

    if (req.method === 'POST' && req.url === '/api/estudiantes') {
        let cuerpo = '';

        req.on('data', fragmento => {
            cuerpo += fragmento;
        });

        req.on('end', () => {
            let estudiante;

            try {
                estudiante = JSON.parse(cuerpo);
            } catch {
                return responderJSON(res, 400, { mensaje: 'JSON inválido' });
            }

            if (
                estudiante === null ||
                typeof estudiante !== 'object' ||
                Array.isArray(estudiante) ||
                estudiante.id === undefined ||
                (typeof estudiante.id !== 'string' && typeof estudiante.id !== 'number') ||
                !String(estudiante.id).trim() ||
                typeof estudiante.nombre !== 'string' ||
                !estudiante.nombre.trim() ||
                typeof estudiante.carrera !== 'string' ||
                !estudiante.carrera.trim()
            ) {
                return responderJSON(res, 400, {
                    mensaje: 'Se requiere id, nombre y carrera válidos'
                });
            }

            leerEstudiantes((err, estudiantes) => {
                if (err) {
                    return responderJSON(res, 500, { mensaje: 'Error al leer estudiantes' });
                }

                const duplicado = estudiantes.some(
                    item => String(item.id) === String(estudiante.id)
                );

                if (duplicado) {
                    return responderJSON(res, 409, { mensaje: 'El ID ya existe' });
                }

                estudiantes.push(estudiante);

                fs.writeFile(
                    archivoEstudiantes,
                    JSON.stringify(estudiantes, null, 2),
                    err => {
                        if (err) {
                            return responderJSON(res, 500, {
                                mensaje: 'Error al guardar estudiante'
                            });
                        }

                        responderJSON(res, 201, estudiante);
                    }
                );
            });
        });

        return;
    }

    responderJSON(res, 404, { mensaje: 'Recurso no encontrado' });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
