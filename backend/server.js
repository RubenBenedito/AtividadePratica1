// API real a ser implementada

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    // Aqui você pode implementar a lógica para buscar os alunos do banco de dados
    res.json(alunos);
});


app.get('/alunos/:id', (req, res) => {
    id = req.params.id;
    res.send("Olá aluno id ${id}");
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
})