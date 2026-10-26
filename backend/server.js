require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = Number(process.env.PORT || 3010);
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || 'rest_api';

if (!mongoUri) {
    throw new Error('A variável MONGODB_URI não está definida no ficheiro .env');
}

const client = new MongoClient(mongoUri);
let database;

app.use(cors());
app.use(express.json());

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function getCollection(name) {
    return database.collection(name);
}

async function getNextId(collection) {
    const lastDocument = await collection.findOne({}, { sort: { id: -1 } });
    return (lastDocument?.id || 0) + 1;
}

function registerCrudRoutes(resource, collectionName) {
    const collection = () => getCollection(collectionName);

    app.get(`/${resource}`, async (req, res, next) => {
        try {
            res.json(await collection().find().sort({ id: 1 }).toArray());
        } catch (error) {
            next(error);
        }
    });

    app.get(`/${resource}/:id`, async (req, res, next) => {
        try {
            const id = parseId(req.params.id);
            if (!id) return res.status(400).json({ error: 'ID inválido' });

            const document = await collection().findOne({ id });
            if (!document) return res.status(404).json({ error: `${resource} não encontrado` });

            res.json(document);
        } catch (error) {
            next(error);
        }
    });

    app.post(`/${resource}`, async (req, res, next) => {
        try {
            if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
                return res.status(400).json({ error: 'O corpo do pedido deve ser um objeto JSON' });
            }

            const document = { ...req.body, id: await getNextId(collection()) };
            await collection().insertOne(document);
            res.status(201).json(document);
        } catch (error) {
            next(error);
        }
    });

    app.put(`/${resource}/:id`, async (req, res, next) => {
        try {
            const id = parseId(req.params.id);
            if (!id) return res.status(400).json({ error: 'ID inválido' });

            const result = await collection().findOneAndUpdate(
                { id },
                { $set: { ...req.body, id } },
                { returnDocument: 'after' }
            );
            if (!result) return res.status(404).json({ error: `${resource} não encontrado` });

            res.json(result);
        } catch (error) {
            next(error);
        }
    });

    app.delete(`/${resource}/:id`, async (req, res, next) => {
        try {
            const id = parseId(req.params.id);
            if (!id) return res.status(400).json({ error: 'ID inválido' });

            const result = await collection().deleteOne({ id });
            if (!result.deletedCount) return res.status(404).json({ error: `${resource} não encontrado` });

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    });
}

registerCrudRoutes('alunos', 'alunos');
registerCrudRoutes('cursos', 'cursos');

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

async function start() {
    await client.connect();
    database = client.db(databaseName);
    await database.command({ ping: 1 });

    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
        console.log(`Ligado à base de dados MongoDB "${databaseName}"`);
    });
}

start().catch((error) => {
    console.error('Não foi possível ligar ao MongoDB:', error.message);
    process.exitCode = 1;
});

async function closeDatabase() {
    await client.close();
}

process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
