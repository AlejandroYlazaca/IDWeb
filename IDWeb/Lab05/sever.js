const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const archivoEstudiantes = path.join(__dirname, 'data', 'estudiantes.json');

function responderJSON(res, estado, datos) {
    res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(datos));
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
        return fs.readFile(archivoEstudiantes, 'utf8', (err, contenido) => {
            if (err) {
                return responderJSON(res, 500, { mensaje: 'Error al leer estudiantes' });
            }

            responderJSON(res, 200, JSON.parse(contenido));
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

            fs.readFile(archivoEstudiantes, 'utf8', (err, contenido) => {
                if (err) {
                    return responderJSON(res, 500, { mensaje: 'Error al leer estudiantes' });
                }

                let estudiantes;

                try {
                    estudiantes = JSON.parse(contenido);
                } catch {
                    return responderJSON(res, 500, { mensaje: 'Archivo JSON inválido' });
                }

                estudiantes.push(estudiante);

                fs.writeFile(archivoEstudiantes, JSON.stringify(estudiantes, null, 2), err => {
                    if (err) {
                        return responderJSON(res, 500, { mensaje: 'Error al guardar estudiante' });
                    }

                    responderJSON(res, 201, estudiante);
                });
            });
        });

        return;
    }

    responderJSON(res, 404, { mensaje: 'Recurso no encontrado' });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
