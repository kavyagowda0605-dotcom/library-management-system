import React, { useState, useEffect } from 'react';

const API_BASE = "https://library-management-system-y876.onrender.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authData, setAuthData] = useState({ username: '', password: '' });
  
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', category: '', status: 'Available' });

  // Handle Auth Form Submission
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? '/signup' : '/login';
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (isSignUp) {
        alert('Account created! Please log in.');
        setIsSignUp(false);
      } else {
        setUser(data.username);
        fetchBooks();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_BASE}/books`);
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchBooks();
  }, [user]);

  // Handle Add/Edit Book
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE}/books/${editingId}` : `${API_BASE}/books`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm)
      });
      if (!res.ok) throw new Error('Failed to save book');
      
      setBookForm({ title: '', author: '', category: '', status: 'Available' });
      setEditingId(null);
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  // Edit action setup
  const startEdit = (book) => {
    setEditingId(book._id);
    setBookForm({ title: book.title, author: book.author, category: book.category, status: book.status });
  };

  // Delete Book
  const deleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
      fetchBooks();
    } catch (err) {
      alert('Error deleting book');
    }
  };

  // Toggle Availability Status
  const toggleStatus = async (book) => {
    const updatedStatus = book.status === 'Available' ? 'Issued' : 'Available';
    try {
      await fetch(`${API_BASE}/books/${book._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...book, status: updatedStatus })
      });
      fetchBooks();
    } catch (err) {
      alert('Error updating status');
    }
  };

  // Filter books by title or author
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="auth-box">
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={handleAuth}>
          <input 
            type="text" 
            placeholder="Username" 
            value={authData.username} 
            onChange={e => setAuthData({ ...authData, username: e.target.value })} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={authData.password} 
            onChange={e => setAuthData({ ...authData, password: e.target.value })} 
            required 
          />
          <button type="submit" style={{ width: '100%', marginTop: '10px' }}>
            {isSignUp ? 'Create Account' : 'Login'}
          </button>
        </form>
        <div className="switch-mode" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Library Management System</h1>
        <div>
          <span>Welcome, <strong>{user}</strong></span>
          <button className="secondary" onClick={() => setUser(null)} style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleBookSubmit} className="form-grid">
        <input 
          type="text" 
          placeholder="Title" 
          value={bookForm.title} 
          onChange={e => setBookForm({ ...bookForm, title: e.target.value })} 
          required 
        />
        <input 
          type="text" 
          placeholder="Author" 
          value={bookForm.author} 
          onChange={e => setBookForm({ ...bookForm, author: e.target.value })} 
          required 
        />
        <input 
          type="text" 
          placeholder="Category" 
          value={bookForm.category} 
          onChange={e => setBookForm({ ...bookForm, category: e.target.value })} 
          required 
        />
        <select 
          value={bookForm.status} 
          onChange={e => setBookForm({ ...bookForm, status: e.target.value })}
        >
          <option value="Available">Available</option>
          <option value="Issued">Issued</option>
        </select>
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit">{editingId ? 'Update Book' : 'Add Book'}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setEditingId(null); setBookForm({ title: '', author: '', category: '', status: 'Available' }); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <input 
        type="text" 
        className="search-bar" 
        placeholder="Search books by title or author..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
      />

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <tr key={book._id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>
                  <button 
                    className={book.status === 'Available' ? '' : 'secondary'} 
                    onClick={() => toggleStatus(book)}
                  >
                    {book.status}
                  </button>
                </td>
                <td>
                  <button onClick={() => startEdit(book)}>Edit</button>
                  <button className="danger" onClick={() => deleteBook(book._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No books found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}