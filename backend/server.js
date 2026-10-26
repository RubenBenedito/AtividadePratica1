// API real a ser implementada

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
console.log('PORT:', process.env.PORT);

const app = express()
const port = process.env.PORT

async function connect() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado ao MongoDB");
}

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
    todosalunos = await Aluno.find({});
    console.log(todosalunos);
    res.json(todosalunos);
})

app.get('/alunos/:id', (req, res) => {
    id = req.params.id;
    res.send('Olá Alunos ' + id)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})