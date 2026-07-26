-- Habilitar extensión para generación de UUIDs (para la tabla users)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: USERS
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: CATEGORIES
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7) DEFAULT '#64748b',
    CONSTRAINT unique_user_category UNIQUE (user_id, name)
);

-- 3. TABLA: STORES
CREATE TABLE stores (
    store_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_store UNIQUE (user_id, name)
);

-- 4. TABLA: ITEMS (Catálogo maestro de artículos del usuario)
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    default_store_id INT REFERENCES stores(store_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    default_price NUMERIC(10, 2) DEFAULT 0.00 CHECK (default_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_item UNIQUE (user_id, name)
);

-- 5. TABLA: SHOPPING_LISTS
CREATE TABLE shopping_lists (
    list_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    budget NUMERIC(10, 2) DEFAULT NULL CHECK (budget IS NULL OR budget >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 6. TABLA: LIST_ITEMS (Junction Table M:N entre Listas y Artículos)
CREATE TABLE list_items (
    list_item_id SERIAL PRIMARY KEY,
    list_id INT NOT NULL REFERENCES shopping_lists(list_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES items(item_id) ON DELETE RESTRICT,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) DEFAULT 0.00 CHECK (price_at_purchase >= 0),
    is_completed BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_list_item UNIQUE (list_id, item_id)
);

-- 7. TABLA: EXPENSES (Registro central del Expense Tracker)
CREATE TABLE expenses (
    expense_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    source_list_id INT DEFAULT NULL REFERENCES shopping_lists(list_id) ON DELETE SET NULL,
    category_id INT DEFAULT NULL REFERENCES categories(category_id) ON DELETE SET NULL,
    store_id INT DEFAULT NULL REFERENCES stores(store_id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    expense_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDICES (Para optimizar la velocidad de respuesta de las consultas con WHERE user_id)
-- =============================================================================

CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_stores_user ON stores(user_id);
CREATE INDEX idx_items_user ON items(user_id);
CREATE INDEX idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX idx_list_items_list ON list_items(list_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);