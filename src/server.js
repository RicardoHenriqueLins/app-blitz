import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// 🔥 necessário para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// 🔥 serve arquivos do frontend (PASTA PUBLIC NA RAIZ)
app.use(express.static(path.join(__dirname, '../public')));

// 🔥 rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// 🔥 porta do Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});