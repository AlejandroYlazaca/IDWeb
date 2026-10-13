
const express = require("express");
const cursoRoutes = require("./routes/cursoRoutes");

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    const inicio = Date.now();

    res.on("finish", () => {
        const duracion = Date.now() - inicio;
        console.log(
            `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duracion} ms`
        );
    });

    next();
});

app.use(express.json());

app.use("/api/cursos", cursoRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: "fail",
        message: "Ruta no encontrada"
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack || err.message);

    res.status(500).json({
        status: "error",
        message: "Error interno del servidor"
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
