const express = require('express');
const bodyParser = require('body-parser');
const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite
} = require('./db');

const app = express();
app.use(bodyParser.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const init = async () => {
  try {
    await createTables();
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

app.get('/api/users', async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id/favorites', async (req, res) => {
  try {
    const { id } = req.params;
    const favorites = await fetchFavorites(id);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:id/favorites', async (req, res) => {
  const { id } = req.params;
  const { product_id } = req.body;
  try {
    const favorite = await createFavorite(product_id, id);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:user_id/favorites/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await destroyFavorite(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  init();
});

