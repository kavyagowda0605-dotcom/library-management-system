import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Datastore from 'nedb-promises';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Local Embedded Databases (automatically creates .db files in backend)
const Users = Datastore.create({ filename: './users.db', autoload: true });
const Books = Datastore.create({ filename: './books.db', autoload: true });

console.log('Embedded Local Database Connected Successfully!');

// Auth Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'All fields are required' });
    
    const existingUser = await Users.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    await Users.insert({ username, password });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username, password });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', username: user.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Book Routes
app.get('/api/books', async (req, res) => {
  try {
    const books = await Books.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, author, category, status } = req.body;
    const book = await Books.insert({ title, author, category, status });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Books.update({ _id: id }, { $set: req.body });
    const updatedBook = await Books.findOne({ _id: id });
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    await Books.remove({ _id: req.params.id }, {});
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));