// // API real a ser implementada
// // const dns = require('node:dns');
// // dns.setServers(['8.8.8.8', '8.8.4.4']);

// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express()
// const port = process.env.PORT || 3010
// console.log(process.env.PORT);

// async function connect() {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("Conectado ao MongoDB");
// }

// connect();

// const alunoSchema = new mongoose.Schema({
//     nome: String,
//     cursoId: String,
//     idade: Number
// })

// const Aluno = mongoose.model('Aluno', alunoSchema);

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

// app.get('/alunos', async (req, res) => {
//     const todosAlunos = await Aluno.find();
//     res.json(todosAlunos);
// })

// app.get('/alunos/:id', (req, res) => {
//     id = req.params.id;
//     res.send('Olá Alunos ' + id)
// })

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })






const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('node:path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3010;

app.use(express.json());

// Servir o frontend Svelte
app.use(express.static(path.join(__dirname, '../frontend/dist')));

async function connect() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado ao MongoDB");
}

connect().catch(err => {
    console.error("Erro ao ligar ao MongoDB:", err);
});

const alunoSchema = new mongoose.Schema({
    nome: String,
    cursoId: String,
    idade: Number
});

const Aluno = mongoose.model('Aluno', alunoSchema);

// Listar todos os alunos
app.get('/alunos', async (req, res) => {
    try {
        const todosAlunos = await Aluno.find();
        res.json(todosAlunos);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// Consultar aluno pelo ID
app.get('/alunos/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findById(req.params.id);

        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }

        res.json(aluno);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// Qualquer outra rota que não pertencente à API
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
