// API real a ser implementada
// const dns = require('node:dns');

// dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express()
const port = process.env.PORT || 3010
console.log(process.env.PORT);

async function connect() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado ao MongoDB");
}

connect();

const alunoSchema = new mongoose.Schema({
    nome: String,
    cursoId: String,
    idade: Number
})

const Aluno = mongoose.model('Aluno', alunoSchema);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/alunos', async (req, res) => {
    const todosAlunos = await Aluno.find();
    res.json(todosAlunos);
})

app.get('/alunos/:id', (req, res) => {
    id = req.params.id;
    res.send('Olá Alunos ' + id)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})