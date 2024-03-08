const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  connectionString: 'postgres://dpsqregm:ssMbht6SNAwrZiaGHvwdwkae81cMVj_H@silly.db.elephantsql.com/dpsqregm'
});

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/alunos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/alunos/pesquisar-alunos', async (req, res) => {
  const { matricula, turno, serie } = req.body;

  try {
    let query = 'SELECT * FROM alunos WHERE 1=1';
    const params = [];

    if (matricula) {
      query += ' AND matricula = $' + (params.push(matricula));
    }

    if (turno) {
      query += ' AND horario = $' + (params.push(turno));
    }

    if (serie) {
      query += ' AND serie = $' + (params.push(serie));
    }

    if (params.length === 0) {
      query = 'SELECT * FROM alunos';
    }

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching students', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.get('/alunos/:id', async (req, res) => {
  const studentId = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM alunos WHERE id = $1', [studentId]);

    // Check if the student was found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching student', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/alunos', async (req, res) => {
  const newStudent = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO alunos (matricula, nome_aluno, nome_responsavel, data_nascimento, serie, data_pagamento, cpf_responsavel, telefone, endereco, cep, identidade_aluno, horario, valor_mensalidade) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [
        newStudent.matricula,
        newStudent.nome_aluno,
        newStudent.nome_responsavel,
        newStudent.data_nascimento,
        newStudent.serie,
        newStudent.data_pagamento,
        newStudent.cpf_responsavel,
        newStudent.telefone,
        newStudent.endereco,
        newStudent.cep,
        newStudent.identidade_aluno,
        newStudent.horario,
        newStudent.valor_mensalidade,
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding student', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/alunos/:id', async (req, res) => {
    const studentId = req.params.id;
  
    try {
      const result = await pool.query(
        'DELETE FROM alunos WHERE id = $1 RETURNING *',
        [studentId]
      );
  
      // Check if the student was found and deleted
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Error deleting student', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/alunos/atualizar-pagamento/:id', async (req, res) => {
    const { id } = req.params;
    const { data_pagamento } = req.body;
    try {
      const result = await pool.query(
        'UPDATE alunos SET data_pagamento = $1 WHERE id = $2 RETURNING *',
        [data_pagamento, id]
      );
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Student not found' });
      }
    } catch (error) {
      console.error('Error updating payment date', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/professores', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM professor');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching professors', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/professores', async (req, res) => {
    const { nome, situacao, datapagamento } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO professor (nome, situacao, datapagamento) VALUES ($1, $2, $3) RETURNING *',
            [nome, situacao, datapagamento]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding professor', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  // Rota para deletar um professor pelo ID
app.delete('/professores/:id', async (req, res) => {
  const professorId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM professor WHERE id = $1 RETURNING *',
      [professorId]
    );

    // Verifica se o professor foi encontrado e deletado
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Professor not found' });
    }

    res.json({ message: 'Professor deleted successfully' });
  } catch (error) {
    console.error('Error deleting professor', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Rota para editar um professor pelo ID
app.put('/professores/:id', async (req, res) => {
  const professorId = req.params.id;
  const { nome, situacao } = req.body;
  try {
    const result = await pool.query(
      'UPDATE professor SET nome = $1, situacao = $2 WHERE id = $3 RETURNING *',
      [nome, situacao, professorId]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Professor not found' });
    }
  } catch (error) {
    console.error('Error updating professor', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/professores/atualizar-pagamento/:id', async (req, res) => {
  const { id } = req.params;
  const { situacao } = req.body;
  let dataPagamento = req.body.datapagamento;

  try {
    if (!dataPagamento) {
      dataPagamento = new Date().toISOString();
    }

    const ultimoPagamento = new Date(dataPagamento);
    ultimoPagamento.setMonth(ultimoPagamento.getMonth() + 1);
    const hoje = new Date();

    if (hoje > ultimoPagamento) {
      dataPagamento = hoje.toISOString();
      situacao = 'não pago';
    }

    const result = await pool.query(
      'UPDATE professor SET datapagamento = $1, situacao = $2 WHERE id = $3 RETURNING *',
      [dataPagamento, situacao, id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Professor not found' });
    }
  } catch (error) {
    console.error('Error updating professor payment date', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/professores/pesquisar', async (req, res) => {
  const { nome } = req.query;

  try {
    let query = 'SELECT * FROM professor';
    const params = [];

    // Se o parâmetro de nome estiver presente na query, filtramos pelo nome
    if (nome) {
      query += ' WHERE nome ILIKE $1';
      params.push(`%${nome}%`);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching professors by name', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});


  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
