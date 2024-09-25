import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pg from 'pg'; // Importa o módulo CommonJS como um todo
import bcrypt from 'bcrypt'; // Certifique-se de instalar bcrypt

const { Pool } = pg; // Desestrutura a exportação Pool do módulo

const app = express();
const port = 3001;

// Configuração do Pool para PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres.rorvdnnjgxnmvzeksfke:Alef@quino123@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));

// Rota de Login
// Rota de Login
// Rota de Login
app.post('/login', async (req, res) => {
  const { cpf_paciente, senha_paciente } = req.body;

  try {
      // Consulta para buscar o paciente pelo CPF
      const result = await pool.query('SELECT * FROM public.pacientes WHERE cpf_paciente = $1', [cpf_paciente]);

      // Verifica se o paciente existe
      if (result.rows.length === 0) {
          return res.status(401).json({ error: 'CPF ou senha incorretos' });
      }

      const user = result.rows[0]; // Pega o primeiro paciente retornado

      // Comparando a senha fornecida com a senha armazenada
      if (senha_paciente !== user.senha_paciente) {
          return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Se a senha for válida, retorna o nome do paciente
      res.json({ message: 'Login realizado com sucesso', nm_paciente: user.nm_paciente });
    
  } catch (error) {
      console.error('Erro ao validar o login', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/anamnese', async (req,res) => {
  const {
    remedio_control,
    alergia_cirurgia_dc,
    emagrecedor,
    pressao,
    quilos_perder,
    anemia,
    atividade_fisica,
    colesterol_trig,

  } = req.body
})



// Rota para Adicionar Pacientes
app.post('/cadastro', async (req, res) => {
  const {
      nm_paciente,
      email_paciente,
      senha_paciente,
      telefone_paciente,
      cpf_paciente,
      idade_paciente,
      peso_paciente,
      altura_paciente,
  } = req.body;

  // Validação de campos obrigatórios
  if (!nm_paciente || !email_paciente || !senha_paciente || !cpf_paciente) {
      return res.status(400).json({ error: 'Nome, email, senha e CPF são obrigatórios.' });
  }

  try {
      const result = await pool.query(
          `INSERT INTO public.pacientes (nm_paciente, email_paciente, senha_paciente, telefone_paciente, cpf_paciente, idade_paciente, peso_paciente, altura_paciente)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
              nm_paciente,
              email_paciente,
              senha_paciente,
              telefone_paciente || null, // Permitir que telefone_paciente seja nulo
              cpf_paciente,
              idade_paciente || null, // Permitir que idade_paciente seja nulo
              peso_paciente || null, // Permitir que peso_paciente seja nulo
              altura_paciente || null, // Permitir que altura_paciente seja nulo
          ]
      );

      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error('Erro ao inserir paciente:', error);
      if (error.code === '23505') { // Código de erro para violação de chave única (ex: email ou CPF duplicados)
          return res.status(409).json({ error: 'Email ou CPF já cadastrados.' });
      }
      res.status(500).json({ error: 'Erro ao adicionar o paciente.' });
  }
});

// Encerrar o pool ao desligar o servidor
process.on('SIGTERM', () => {
  console.log('Encerrando o servidor...');
  pool.end(() => {
    console.log('Pool de conexões encerrado.');
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
