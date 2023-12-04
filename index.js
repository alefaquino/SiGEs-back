const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'escola',
  password: '1234',
  port: 5432,
});

// Middleware
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

app.post('/alunos', async (req, res) => {
  const newStudent = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO alunos (nome_aluno, nome_responsavel, data_nascimento, serie, data_pagamento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        newStudent.nomeAluno,
        newStudent.nomeResponsavel,
        newStudent.dataNascimento,
        newStudent.serie,
        newStudent.dataPagamento,
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
