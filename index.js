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
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
