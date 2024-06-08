const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: 'postgres://username:password@localhost:5432/yourdatabase'
});

client.connect();

const createTables = async () => {
  await client.query('DROP TABLE IF EXISTS favorites');
  await client.query('DROP TABLE IF EXISTS users');
  await client.query('DROP TABLE IF EXISTS products');
  
  await client.query(`
    CREATE TABLE users (
      id UUID PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);
  
  await client.query(`
    CREATE TABLE products (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    )
  `);
  
  await client.query(`
    CREATE TABLE favorites (
      id UUID PRIMARY KEY,
      product_id UUID REFERENCES products(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL
    )
  `);
};

const createUser = async (username, password) => {
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await client.query(
    'INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING *',
    [id, username, hashedPassword]
  );
  return result.rows[0];
};

const createProduct = async (name) => {
  const id = uuidv4();
  const result = await client.query(
    'INSERT INTO products (id, name) VALUES ($1, $2) RETURNING *',
    [id, name]
  );
  return result.rows[0];
};

const fetchUsers = async () => {
  const result = await client.query('SELECT * FROM users');
  return result.rows;
};

const fetchProducts = async () => {
  const result = await client.query('SELECT * FROM products');
  return result.rows;
};

const createFavorite = async (productId, userId) => {
  const id = uuidv4();
  const result = await client.query(
    'INSERT INTO favorites (id, product_id, user_id) VALUES ($1, $2, $3) RETURNING *',
    [id, productId, userId]
  );
  return result.rows[0];
};

const fetchFavorites = async (userId) => {
  const result = await client.query('SELECT * FROM favorites WHERE user_id = $1', [userId]);
  return result.rows;
};

const destroyFavorite = async (id) => {
  await client.query('DELETE FROM favorites WHERE id = $1', [id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite
};
