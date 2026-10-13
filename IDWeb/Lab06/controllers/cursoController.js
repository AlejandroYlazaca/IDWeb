
const cursos = require("../data/cursos");

exports.obtenerCursos = (req, res) => {
    let resultado = cursos;

    if (req.query.creditos !== undefined) {
        const creditos = Number(req.query.creditos);

        if (!Number.isInteger(creditos) || creditos <= 0) {
            return res.status(400).json({
                status: "fail",
                message: "Los creditos deben ser un entero positivo"
            });
        }

        resultado = cursos.filter(curso => curso.creditos === creditos);
    }

    res.status(200).json({
        status: "success",
        data: resultado
    });
};

exports.obtenerCurso = (req, res) => {
    const id = Number(req.params.id);
    const curso = cursos.find(curso => curso.id === id);

    if (!Number.isInteger(id) || id <= 0 || !curso) {
        return res.status(404).json({
            status: "fail",
            message: "Curso no encontrado"
        });
    }

    res.status(200).json({
        status: "success",
        data: curso
    });
};

exports.crearCurso = (req, res) => {
    const { nombre, codigo, creditos } = req.body;

    if (
        typeof nombre !== "string" || !nombre.trim() ||
        typeof codigo !== "string" || !codigo.trim() ||
        creditos === undefined ||
        creditos === null ||
        creditos === "" ||
        !Number.isInteger(Number(creditos)) ||
        Number(creditos) <= 0
    ) {
        return res.status(400).json({
            status: "fail",
            message: "Nombre, codigo y creditos positivos son obligatorios"
        });
    }

    const nuevoCurso = {
        id: cursos.length ? Math.max(...cursos.map(curso => curso.id)) + 1 : 1,
        nombre: nombre.trim(),
        codigo: codigo.trim(),
        creditos: Number(creditos)
    };

    cursos.push(nuevoCurso);

    res.status(201).json({
        status: "success",
        data: nuevoCurso
    });
};

exports.actualizarCurso = (req, res) => {
    const id = Number(req.params.id);
    const curso = cursos.find(curso => curso.id === id);

    if (!Number.isInteger(id) || id <= 0 || !curso) {
        return res.status(404).json({
            status: "fail",
            message: "Curso no encontrado"
        });
    }

    const { nombre, codigo, creditos } = req.body;

    if (
        typeof nombre !== "string" || !nombre.trim() ||
        typeof codigo !== "string" || !codigo.trim() ||
        creditos === undefined ||
        creditos === null ||
        creditos === "" ||
        !Number.isInteger(Number(creditos)) ||
        Number(creditos) <= 0
    ) {
        return res.status(400).json({
            status: "fail",
            message: "Nombre, codigo y creditos positivos son obligatorios"
        });
    }

    curso.nombre = nombre.trim();
    curso.codigo = codigo.trim();
    curso.creditos = Number(creditos);

    res.status(200).json({
        status: "success",
        message: "Curso actualizado correctamente",
        data: curso
    });
};

exports.eliminarCurso = (req, res) => {
    const id = Number(req.params.id);
    const indice = cursos.findIndex(curso => curso.id === id);

    if (!Number.isInteger(id) || id <= 0 || indice === -1) {
        return res.status(404).json({
            status: "fail",
            message: "Curso no encontrado"
        });
    }

    cursos.splice(indice, 1);

    res.status(200).json({
        status: "success",
        message: "Curso eliminado correctamente"
    });
};
