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
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('node:path');

// dotenv.config(); // Carrega variáveis de ambiente do arquivo .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3010;

app.use(cors());
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
    nome: { type: String, required: true, trim: true },
    apelido: { type: String, trim: true, default: '' },
    idCurso: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curso',
        required: true
    },
    anoCurricular: { type: Number, min: 1, max: 6, default: 1 },
    idade: { type: Number, required: true, min: 1, max: 120 }
}, { timestamps: true });

const cursoSchema = new mongoose.Schema({
    nomeDoCurso: { type: String, required: true, trim: true }
}, { timestamps: true });

const Aluno = mongoose.model('Aluno', alunoSchema, 'Alunos');
const Curso = mongoose.model('Curso', cursoSchema, 'Cursos');

async function validarCurso(idCurso) {
    if (!mongoose.isValidObjectId(idCurso)) {
        return false;
    }
    return Boolean(await Curso.exists({ _id: idCurso }));
}

function validarIdMongo(id) {
    return mongoose.isValidObjectId(id);
}

// Listar todos os alunos
app.get('/alunos', async (req, res) => {
    try {
        const todosAlunos = await Aluno.find().populate('idCurso', 'nomeDoCurso');
        res.json(todosAlunos);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// Consultar aluno pelo ID
app.get('/alunos/:id', async (req, res) => {
    try {
        if (!validarIdMongo(req.params.id)) {
            return res.status(400).json({ erro: 'ID de aluno inválido' });
        }

        const aluno = await Aluno.findById(req.params.id).populate('idCurso', 'nomeDoCurso');

        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }

        res.json(aluno);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

app.post('/alunos', async (req, res) => {
    try {
        if (!await validarCurso(req.body.idCurso)) {
            return res.status(400).json({ erro: 'O idCurso deve corresponder a um curso existente' });
        }

        const aluno = await Aluno.create(req.body);
        await aluno.populate('idCurso', 'nomeDoCurso');
        res.status(201).json(aluno);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
});

app.put('/alunos/:id', async (req, res) => {
    try {
        if (!validarIdMongo(req.params.id)) {
            return res.status(400).json({ erro: 'ID de aluno inválido' });
        }
        if (!await validarCurso(req.body.idCurso)) {
            return res.status(400).json({ erro: 'O idCurso deve corresponder a um curso existente' });
        }

        const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('idCurso', 'nomeDoCurso');

        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.json(aluno);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
});

app.patch('/alunos/:id', async (req, res) => {
    try {
        if (!validarIdMongo(req.params.id)) {
            return res.status(400).json({ erro: 'ID de aluno inválido' });
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'idCurso') && !await validarCurso(req.body.idCurso)) {
            return res.status(400).json({ erro: 'O idCurso deve corresponder a um curso existente' });
        }

        const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('idCurso', 'nomeDoCurso');

        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.json(aluno);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
});

app.delete('/alunos/:id', async (req, res) => {
    try {
        if (!validarIdMongo(req.params.id)) {
            return res.status(400).json({ erro: 'ID de aluno inválido' });
        }
        const aluno = await Aluno.findByIdAndDelete(req.params.id);
        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

app.get('/cursos', async (req, res) => {
    try {
        const cursos = await Curso.find();
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

app.get('/cursos/:id', async (req, res) => {
    try {
        if (!validarIdMongo(req.params.id)) {
            return res.status(400).json({ erro: 'ID de curso inválido' });
        }
        const curso = await Curso.findById(req.params.id);
        if (!curso) {
            return res.status(404).json({ erro: 'Curso não encontrado' });
        }
        res.json(curso);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

app.post('/cursos', async (req, res) => {
    try {
        const curso = await Curso.create(req.body);
        res.status(201).json(curso);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
});

app.put('/cursos/:id', async (req, res) => {
    try {
        if (!validarIdMongo(req.params.id)) {
            return res.status(400).json({ erro: 'ID de curso inválido' });
        }
        const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!curso) {
            return res.status(404).json({ erro: 'Curso não encontrado' });
        }
        res.json(curso);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
});

app.delete('/cursos/:id', async (req, res) => {
    try {
        if (!validarIdMongo(req.params.id)) {
            return res.status(400).json({ erro: 'ID de curso inválido' });
        }
        const alunosAssociados = await Aluno.exists({ idCurso: req.params.id });
        if (alunosAssociados) {
            return res.status(409).json({
                erro: 'Não é possível remover o curso porque existem alunos associados'
            });
        }
        const curso = await Curso.findByIdAndDelete(req.params.id);
        if (!curso) {
            return res.status(404).json({ erro: 'Curso não encontrado' });
        }
        res.status(204).send();
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
