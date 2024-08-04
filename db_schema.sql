
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- ////////////////////////////////////////////////////////
-- THESE ARE THE NEW TABLES USED

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    course_name TEXT PRIMARY KEY
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    course TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating IN (0, 1, 2, 3, 4, 5)),
    description TEXT NOT NULL,
    FOREIGN KEY (course) REFERENCES courses(course_name) ON DELETE RESTRICT
    -- profile pic?
);

-- Product Table
CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    image BLOB,
    content_description TEXT,
    price FLOAT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Fashion', 'Electronics', 'Lifestyle', 'Recreation', 'Collectibles', 'Resources', 'Others')),
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('Trade', 'Sell', 'Free', 'Free, Trade', 'Sell, Trade')),
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
    photo BLOB,
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

INSERT INTO courses (course_name) VALUES 
('University of London, BSc Computer Science'),
('University of London, BSc in Business & Management'),
('University of London, BSc in Data Science & Business Analytics'),
('University of London, BSc in Accounting and Finance'),
('University of Wollongong, Bachelor of Computer Science (Game and Mobile Development)'),
('University of Wollongong, Bachelor of Information Technology'),
('University of Wollongong, Bachelor of Commerce (Finance)'),
('RMIT University, Bachelor of Business (Accountancy)'),
('RMIT University, Bachelor of Business (Marketing)'),
('RMIT University, Bachelor of Information Technology'),
('University at Buffalo, Bachelor of Science in Business Administration'),
('University at Buffalo, Bachelor of Arts in Psychology'),
('University at Buffalo, Bachelor of Arts in Communication'),
('University of Birmingham, BSc in International Business'),
('University of Birmingham, BSc in Economics'),
('University of Birmingham, BSc in Business Management'),
('University of Wollongong, Diploma in Banking & Finance');

-- Insert Users Data
INSERT INTO users (email, name, password, course, rating, description) 
VALUES 
('sean@mail.com', 'sean', '123', 'University of London, BSc Computer Science', 5, 'Professor of this site'),
('matthew@mail.com', 'matthew', '123', 'University of Wollongong, Diploma in Banking & Finance', 5, 'User of this site');

-- default listings
INSERT INTO product (user_id, product_name, content_description, price, category, transaction_type, condition, created_at, availability) 
VALUES 
((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Headphones', 'Used once over my headscarf, so dont have to worry about hygine. Figured i didnt need it actualy hence selling comes with original full box and its accessories warranty not activated, Model is on photo, so you can google its functions on your end. Bought at $149, my loss your gain', 120, 'Electronics', 'Sell', 'Lightly used', '2021-11-11 11:11:11', true),
((SELECT user_id FROM users WHERE email = 'matthew@mail.com'), 'Game console', 'Used once over my headscarf, so dont have to worry about hygine. Figured i didnt need it actualy hence selling comes with original full box and its accessories warranty not activated, Model is on photo, so you can google its functions on your end. Bought at $149, my loss your gain', 270, 'Electronics', 'Sell, Trade', 'Lightly used', '2021-11-11 11:11:11', true);

-- default reviews
INSERT INTO reviews (user_id, commenterName, commentContent, created_at, stars_given) 
VALUES 
((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Tyler', 'Great transaction! Met up at school as agreed, and the item was exactly as described. The seller was punctual and friendly. Would definitely deal with them again. Thanks!', '2021-11-11 11:11:11', 3),
((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Emily', 'The transaction went smoothly. The item was in decent condition, though it showed a bit more wear than expected. Communication could have been better.', '2021-11-11 11:11:11', 4),
((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Lily', 'Excellent transaction! The buyer was prompt, friendly, and easy to coordinate with. We met at school for the exchange, and everything went smoothly.', '2021-11-11 11:11:11', 2);

-- default favourites
INSERT INTO favourites (user_id, product_id, photo) 
VALUES 
((SELECT user_id FROM users WHERE email = 'sean@mail.com'), (SELECT id FROM product WHERE user_id = (SELECT user_id FROM users WHERE email = 'matthew@mail.com')), '');



COMMIT;

-- //JORDAN's EDIT
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
-- PRAGMA foreign_keys=ON;

-- BEGIN TRANSACTION;

-- -- Users Table
-- CREATE TABLE IF NOT EXISTS users (
--     user_id INTEGER PRIMARY KEY AUTOINCREMENT,
--     email TEXT NOT NULL,
--     name TEXT NOT NULL,
--     password TEXT NOT NULL,
--     -- compile list of schools and add it here
--     school TEXT NOT NULL CHECK(school IN ('University of London', 'University of Wollongong')),
--     -- compile list of courses and add it here
--     course TEXT NOT NULL CHECK(course IN ('Bsc Computer Science', 'Diploma in Banking & Finance')),
--     stars INTEGER NOT NULL CHECK(stars IN (0, 1, 2, 3, 4, 5)),
--     description TEXT NOT NULL
-- );

-- -- Products Table
-- CREATE TABLE IF NOT EXISTS products (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     name TEXT NOT NULL,
--     description TEXT NOT NULL,
--     category TEXT NOT NULL,
--     "transaction" TEXT NOT NULL,
--     condition TEXT NOT NULL
-- );

-- -- Product Images Table
-- CREATE TABLE IF NOT EXISTS product_images (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     product_id INTEGER NOT NULL,
--     image BLOB NOT NULL,
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
-- );

-- -- Reviews Table 
-- CREATE TABLE IF NOT EXISTS reviews (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     user_id INTEGER NOT NULL,
--     commenterName  TEXT NOT NULL,
--     commentContent TEXT NOT NULL,
--     created_at DATETIME NOT NULL,
--     stars_given INTEGER NOT NULL CHECK(stars_given IN (1, 2, 3, 4, 5)),
--     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
-- );

-- -- Favourites table
-- CREATE TABLE IF NOT EXISTS favourites (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     user_id INTEGER NOT NULL,
--     product_id INTEGER NOT NULL,
--     photo BLOB NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
-- );

-- -- Old Tables (to be deleted later)

-- -- Table for articles
-- CREATE TABLE IF NOT EXISTS articles (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     title TEXT NOT NULL,
--     content TEXT,
--     status TEXT NOT NULL CHECK(status IN ('draft', 'published')),
--     created_at DATETIME NOT NULL,
--     last_modified DATETIME NOT NULL,
--     published_at DATETIME,
--     reads INTEGER DEFAULT 0,
--     likes INTEGER DEFAULT 0
-- );

-- -- Table for authors, to be edited in Settings 
-- CREATE TABLE IF NOT EXISTS authorSettings (
--     author_id INTEGER PRIMARY KEY AUTOINCREMENT,
--     blog_title TEXT NOT NULL,
--     author_name TEXT NOT NULL
-- );

-- INSERT INTO authorSettings ('blog_title', 'author_name') VALUES ('DBNW PROJECT', 'Elgin');

-- -- Table of comments
-- CREATE TABLE IF NOT EXISTS comments (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     article_id INTEGER NOT NULL,
--     commenterName TEXT NOT NULL,
--     commentContent TEXT NOT NULL,
--     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
-- );

-- -- Default Data Insertion

-- -- default author account
-- INSERT INTO users (email, name, password, school, course, stars, description) 
-- VALUES ('sean@mail.com', 'sean', '123', 'University of London', 'Bsc Computer Science', 5, 'Professor of this site');

-- INSERT INTO users (email, name, password, school, course, stars, description) 
-- VALUES ('matthew@mail.com', 'matthew', '123', 'University of London', 'Bsc Computer Science', 5, 'User of this site');

-- -- default listings
-- SELECT user_id FROM users WHERE email = 'sean@mail.com';
-- INSERT INTO products (name, description, category, "transaction", condition) 
-- VALUES ('Headphones', 'Used once over my headscarf, so dont have to worry about hygiene. Figured I didnt need it actually hence selling comes with original full box and its accessories warranty not activated. Model is on photo, so you can google its functions on your end. Bought at $149, my loss your gain.', 
--         'Electronics', 'Sell', 'Lightly used');

-- COMMIT;

