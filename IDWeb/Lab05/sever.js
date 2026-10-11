
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const carpetaPublica = path.join(__dirname, 'public');
const archivoEstudiantes = path.join(__dirname, 'data', 'estudiantes.json');

const tiposContenido = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function responderJSON(res, estado, datos) {
    res.writeHead(estado, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(datos));
}

function leerEstudiantes(callback) {
    fs.readFile(archivoEstudiantes, 'utf8', (err, contenido) => {
        if (err) {
            return callback(err);
        }

        try {
            const estudiantes = JSON.parse(contenido);

            if (!Array.isArray(estudiantes)) {
                return callback(new Error('El archivo debe contener un arreglo'));
            }

            callback(null, estudiantes);
        } catch {
            callback(new Error('El archivo JSON no es válido'));
        }
    });
}

function servirArchivo(req, res, rutaURL) {
    let rutaDecodificada;

    try {
        rutaDecodificada = decodeURIComponent(rutaURL);
    } catch {
        return responderJSON(res, 400, { mensaje: 'Ruta inválida' });
    }

    const rutaRelativa = rutaDecodificada === '/'
        ? 'index.html'
        : rutaDecodificada.replace(/^\/+/, '');

    const archivo = path.resolve(carpetaPublica, rutaRelativa);

    if (!archivo.startsWith(carpetaPublica + path.sep)) {
        return responderJSON(res, 403, { mensaje: 'Acceso denegado' });
    }

    fs.readFile(archivo, (err, contenido) => {
        if (err) {
            if (err.code === 'ENOENT' || err.code === 'EISDIR') {
                return responderJSON(res, 404, { mensaje: 'Archivo no encontrado' });
            }

            return responderJSON(res, 500, { mensaje: 'Error al leer el archivo' });
        }

        const extension = path.extname(archivo).toLowerCase();
        const tipo = tiposContenido[extension] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': tipo });
        res.end(contenido);
    });
}

const server = http.createServer((req, res) => {
    let rutaURL;

    try {
        rutaURL = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    } catch {
        return responderJSON(res, 400, { mensaje: 'URL inválida' });
    }

    const ruta = rutaURL.pathname;

    if (ruta === '/api/estudiantes' && req.method === 'GET') {
        return leerEstudiantes((err, estudiantes) => {
            if (err) {
                return responderJSON(res, 500, {
                    mensaje: 'Error al leer estudiantes'
                });
            }

            responderJSON(res, 200, estudiantes);
        });
    }

    if (ruta === '/api/estudiantes' && req.method === 'POST') {
        let cuerpo = '';

        req.on('data', fragmento => {
            cuerpo += fragmento.toString();
        });

        req.on('end', () => {
            let estudiante;

            try {
                estudiante = JSON.parse(cuerpo);
            } catch {
                return responderJSON(res, 400, {
                    mensaje: 'El cuerpo debe contener JSON válido'
                });
            }

            if (
                estudiante === null ||
                typeof estudiante !== 'object' ||
                Array.isArray(estudiante) ||
                estudiante.id === undefined ||
                !['string', 'number'].includes(typeof estudiante.id) ||
                !String(estudiante.id).trim() ||
                typeof estudiante.nombre !== 'string' ||
                !estudiante.nombre.trim() ||
                typeof estudiante.carrera !== 'string' ||
                !estudiante.carrera.trim()
            ) {
                return responderJSON(res, 400, {
                    mensaje: 'Se requiere un ID, nombre y carrera válidos'
                });
            }

            leerEstudiantes((err, estudiantes) => {
                if (err) {
                    return responderJSON(res, 500, {
                        mensaje: 'Error al leer estudiantes'
                    });
                }

                const duplicado = estudiantes.some(
                    item => String(item.id) === String(estudiante.id)
                );

                if (duplicado) {
                    return responderJSON(res, 409, {
                        mensaje: 'El ID ya existe'
                    });
                }

                const nuevoEstudiante = {
                    id: estudiante.id,
                    nombre: estudiante.nombre.trim(),
                    carrera: estudiante.carrera.trim()
                };

                estudiantes.push(nuevoEstudiante);

                fs.writeFile(
                    archivoEstudiantes,
                    JSON.stringify(estudiantes, null, 2),
                    'utf8',
                    err => {
                        if (err) {
                            return responderJSON(res, 500, {
                                mensaje: 'Error al guardar estudiante'
                            });
                        }

                        responderJSON(res, 201, nuevoEstudiante);
                    }
                );
            });
        });

        req.on('error', () => {
            if (!res.writableEnded) {
                responderJSON(res, 400, {
                    mensaje: 'Error al recibir los datos'
                });
            }
        });

        return;
    }

    if (ruta.startsWith('/api/')) {
        return responderJSON(res, 404, {
            mensaje: 'Ruta de API no encontrada'
        });
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
        return servirArchivo(req, res, ruta);
    }

    responderJSON(res, 405, { mensaje: 'Método no permitido' });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

