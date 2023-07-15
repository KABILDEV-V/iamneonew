const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const storage = require('node-persist');

const app = express();
app.use(bodyParser.json());

// Configure and start local storage
storage.init().then(() => {
  console.log('Local storage is ready');
}).catch(err => {
  console.error('Failed to initialize local storage:', err);
});

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
    },
  },
  apis: ['./server.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
app.get('/',(req,res)=>
{
  res.sendFile(__dirname+"/index.html");
});
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await storage.getItem('todos') || [];
    console.log(todos);
    console.log("hi1");
    res.json(todos);
  } catch (error) {
    console.error('Error retrieving todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       201:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
app.post('/api/todos', async (req, res) => {
  const newTodo = req.body;
  const todos1 = await storage.getItem('todos') || [];
  newTodo.id = Date.now().toString();
  newTodo.class=todos1.length;
  try {
    let todos = await storage.getItem('todos') || [];
    todos.push(newTodo);
    await storage.setItem('todos', todos);

    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Todo ID
 *     responses:
 *       204:
 *         description: Successful operation
 */
app.delete('/api/todos/:id', async (req, res) => {
  const todoId = req.params.id;

  try {
    let todos = await storage.getItem('todos') || [];
    const index = todos.findIndex(todo => todo.id === todoId);
    if (index !== -1) {
      todos.splice(index, 1);
      await storage.setItem('todos', todos);
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
app.put('/api/todos/:id', async (req, res) => {
  const todoId = req.params.id;
  const updatedTodo = req.body;
  console.log("hi1");
  try {
    let todos = await storage.getItem('todos') || [];
    const index = todos.findIndex(todo => todo.id === todoId);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updatedTodo };
      await storage.setItem('todos', todos);
      res.json(todos[index]);
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
