
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- ////////////////////////////////////////////////////////
-- THESE ARE THE NEW TABLES USED

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    -- compile list of schools and add it here
    school TEXT NOT NULL CHECK(school IN ('University of London', 'University of Wollongong')),
    -- compile list of courses and add it here
    course TEXT NOT NULL CHECK(course IN ('Bsc Computer Science', 'Diploma in Banking & Finance')),
    stars INTEGER NOT NULL CHECK(stars IN (0, 1, 2, 3, 4, 5)),
    description TEXT NOT NULL
    -- profile pic?
);

-- Product Table
CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    content_description TEXT,
    price FLOAT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Fashion', 'Electronics', 'Lifestyle', 'Recreation', 'Collectibles', 'Resources', 'Others')),
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('Trade', 'Sell', 'Free')),
    condition TEXT NOT NULL CHECK(condition IN ('Brand new', 'Like new', 'Lightly used', 'Moderately used', 'Heavily used')),
    created_at DATETIME NOT NULL,
    availability BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Reviews Table 
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    commenterName  TEXT NOT NULL,
    commentContent TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    stars_given INTEGER NOT NULL CHECK(stars_given IN (1, 2, 3, 4, 5)),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Favourites table
CREATE TABLE IF NOT EXISTS favourites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    photo BLOB NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

-- put images here 
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

-- //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
-- THESE ARE THE [OLD TABLES] THAT ARE CURRENTLY USED IN THE EJS AND JS FILES. 
-- TO BE DELETED

-- Table for articles
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL CHECK(status IN ('draft', 'published')),
    created_at DATETIME NOT NULL,
    last_modified DATETIME NOT NULL,
    published_at DATETIME,
    reads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0
);

--  Table for authors, to be edited in Settings 
CREATE TABLE IF NOT EXISTS authorSettings (
    author_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_title TEXT NOT NULL,
    author_name TEXT NOT NULL
);

INSERT INTO authorSettings ('blog_title', 'author_name')VALUES('DBNW PROJECT', 'Elgin');

--  Table of comments
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    commenterName TEXT NOT NULL,
    commentContent TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);


-- //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
-- CREATING AND INSERTING DATA. THESE ARE THE OLD DATA TO BE ADDED IN 
-- default author account
INSERT INTO users (email, name, password, school, course, stars, description) 
VALUES ('sean@mail.com', 'sean', '123', 'University of London', 'Bsc Computer Science', 5, 'Professor of this site');

INSERT INTO users (email, name, password, school, course, stars, description) 
VALUES ('matthew@mail.com', 'matthew', '123', 'University of London', 'Bsc Computer Science', 5, 'User of this site');

-- default listings
-- SELECT user_id FROM users WHERE email = 'sean@mail.com';
-- INSERT INTO product (user_id, product_name, content_description, price, category, transaction_type, condition, created_at, availability) 
-- VALUES ((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Headphones', 'Used once over my headscarf, so dont have to worry about hygine. Figured i didnt need it actualy hence selling comes with original full box and its accessories warranty not activated, Model is on photo, so you can google its functions on your end. Bought at $149, my loss your gain', 
--         '120', 'Electronics', 'Sell', 'Lighly used', '2021-11-11 11:11:11', true);

COMMIT;

