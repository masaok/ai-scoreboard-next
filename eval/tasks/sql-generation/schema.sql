-- Test database for the SQL-generation task. Generated SQL is executed against
-- this exact schema + seed data, and its result rows are compared to the
-- reference query's rows. Ground truth, not opinion.

CREATE TABLE customers (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  signup_date TEXT NOT NULL
);

CREATE TABLE products (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  category TEXT NOT NULL,
  price    REAL NOT NULL
);

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  status      TEXT NOT NULL,
  total       REAL NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE TABLE order_items (
  id         INTEGER PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty        INTEGER NOT NULL
);

INSERT INTO customers (id, name, country, signup_date) VALUES
  (1, 'Alice',   'Canada', '2025-01-10'),
  (2, 'Bob',     'USA',    '2025-02-04'),
  (3, 'Carmen',  'Canada', '2025-02-20'),
  (4, 'Dmitri',  'Germany','2025-03-15'),
  (5, 'Esi',     'Ghana',  '2025-04-01'),
  (6, 'Farah',   'USA',    '2025-04-22');

INSERT INTO products (id, name, category, price) VALUES
  (1, 'Keyboard',  'Electronics', 80.0),
  (2, 'Monitor',   'Electronics', 300.0),
  (3, 'Desk',      'Furniture',   220.0),
  (4, 'Chair',     'Furniture',   140.0),
  (5, 'Notebook',  'Stationery',  6.0),
  (6, 'Pen Set',   'Stationery',  12.0);

INSERT INTO orders (id, customer_id, status, total, created_at) VALUES
  (1, 1, 'completed', 380.0, '2025-05-01'),
  (2, 2, 'completed', 226.0, '2025-05-03'),
  (3, 1, 'cancelled', 140.0, '2025-05-05'),
  (4, 3, 'completed', 312.0, '2025-05-08'),
  (5, 4, 'pending',   18.0,  '2025-05-10'),
  (6, 2, 'completed', 80.0,  '2025-05-12');

INSERT INTO order_items (id, order_id, product_id, qty) VALUES
  (1, 1, 1, 1),
  (2, 1, 2, 1),
  (3, 2, 3, 1),
  (4, 2, 5, 1),
  (5, 3, 4, 1),
  (6, 4, 2, 1),
  (7, 4, 5, 2),
  (8, 5, 5, 3),
  (9, 6, 1, 1);
