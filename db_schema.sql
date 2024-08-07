
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
('University of London, BSc in Computer Science'),
('University of London, BSc in Computer Science (User Experience)'),
('University of London, BSc in Computer Science (Machine Learning and Artificial Intelligence'),
('University of London, BSc in Computer Science (Web and Mobile Development'),
('University of London, BSc in Computer Science (Virtual Reality)'),
('University of London, BSc in Computer Science (Physical Computing and the Internet of Things)'),
('University of London, BSc in Business & Management'),
('University of London, BSc in Data Science & Business Analytics'),
('University of London, BSc in Accounting and Finance'),
('University of London, BSc in International Relations'),
('University of London, BSc in Finance'),
('University of London, BSc in Management and Digital Innovation'),
('University of London, BSc in Banking and Finance'),
('University of London, BSc in Economics'),
('University of London, BSc in Economics & Management'),
('University of London, BSc in Economics & Finance'),
('University of London, BSc in Economics & Politics'),
('University of London, BSc in Economics & Economics'),
('University of London, Postgraduate Certicate in Data Science'),
('University of London, Postgraduate Diploma in Data Science and Financial Technology'),
('University of London, Postgraduate Diploma in Data Science and Artificial Intelligence'),
('University of London, Postgraduate Diploma in Data Science'),
('University of London, Master of Science in Professional Accountancy'),
('University of London, Master of Science in Data Science'),
('University of London, Master of Science in Accounting and Financial Management'),
('University of London, Master of Science in Data Science and Artifical Intelligence'),
('University of London, Master of Science in Data Science and Financial Technology'),
('University of London, Graduate Certificate in Machine Learning and Artifical Intelligence'),
('University of London, Graduate Certificate in Mobile Development'),
('University of London, Graduate Certificate in User Experience'),
('University of London, Graduate Certificate in Physical Computing and the Internet of Things'),
('University of London, Graduate Certificate in Web Development'),
('University of London, Graduate Diploma in Physical Computing and the Internet of Things'),
('University of London, Graduate Diploma in Management and Digital Innovation'),    
('University of London, Graduate Diploma in Data Science'),
('University of London, Graduate Diploma in Economics'),
('University of London, Graduate Diploma in Machine Learning and Artifical Intelligence'),
('University of London, Graduate Diploma in User Experience'),
('University of London, Graduate Diploma in Web Development'),
('University of London, Graduate Diploma in Virtual Reality'),
('University of London, Graduate Diploma in Management'),
('University of London, Graduate Diploma in Business Analytics'),
('University of London, Graduate Diploma in Mobile Development'),
('University of London, Graduate Diploma in Finance'),
('University of London, Certificate of Higher Education in Social Sciences'),
('University of London, International Foundation Programme'),   
('University of Birmingham, BSc in Accounting and Finance (Top-up)'),
('University of Birmingham, BSc in Business Management (Top-up)'),
('University of Birmingham, BSc in Business Management with Communications (Top-up)'),
('University of Birmingham, BSc in Business Management with Communications and Year in Industry (Top-up)'),
('University of Birmingham, BSc in Business Management with Industrial Placement (Top-up)'),
('University of Birmingham, BSc in International Business  (Top-up)'),
('University of Birmingham, Master of Business Administration (Marketing)'),
('University of Birmingham, Master of Business Administration (International Business and Strategy)'),
('University of Birmingham, Master of Science International Business'),
('University of Birmingham, Master of Science Management'),
('University of Birmingham, Master of Science Financial Management'),
('University of Birmingham, Master of Business Administration'),
('University of Birmingham, Master of Business Administration (Innovation and Business Transformation)'),
('University of Stirling, Bachelor of Arts in Marketing'),
('University of Stirling, Bachelor of Arts in Sport and Marketing'),
('University of Stirling, Bachelor of Arts Digital Media (Top-up)'),
('University of Stirling, Master of Science Gerontology and Global Ageing'),
('La Trobe University, Bachelor of Business (Tourism and Hospitality) (Top-up)'),
('La Trobe University, Bachelor of Business (Event Management) (Top-up)'),
('Monash College, Monash University Foundation Year'),
('RMIT University, Bachelor of Business'),
('RMIT University, Bachelor of Accounting'),
('RMIT University, Bachelor of Applied Science (Aviation) (Top-up)'),
('RMIT University, Bachelor of Construction Management (Top-up)'),
('RMIT University, Bachelor of Communication (Professional Communication)'),
('RMIT University, Bachelor of Design (Communication Design) (Top-up)'),
('The University of Sydney , Bachelor of Nursing (Honours)'),
('The University of Sydney , Bachelor of Nursing (Post-Registration)'),    
('University of Wollongong, Bachelor of Computer Science (Game and Mobile Development)'),
('University of Wollongong, Bachelor of Computer Science (Big Data)'),
('University of Wollongong, Bachelor of Computer Science (Cyber Security)'),
('University of Wollongong, Bachelor of Computer Science (Digital Systems Security)'),
('University of Wollongong, Bachelor of Information Technoology'),
('University of Wollongong, Bachelor of Psychological Science'),
('University of Wollongong, Bachelor of Business Information Systems'),
('University of Wollongong, Double Major : Bachelor of Computer Science (Digital Systems Security and Cyber Security) / (Digital Systems Security and Big Data) / (Big Data and Cyber Security'),
('University of Wollongong, Master of Computing (Data Analytics) (Top-up)'),
('Grenoble Ecole de Management, MSc Finance and Investment Banking (Top-up)'),
('Grenoble Ecole de Management, MSc Finance (Top-up)'),   
('Grenoble Ecole de Management, MSc Fashion, Design and Luxury Management'),   
('Grenoble Ecole de Management, Bachelor in International Business (Top-up)'),   

('SIM Global Education, Diploma in Banking & Finance');
('SIM Global Education, Diploma in Accounting (E-Learning)');
('SIM Global Education, Diploma in Accounting');
('SIM Global Education, Diploma in Information Technology');
('SIM Global Education, Diploma in International Business (E-Learning)');
('SIM Global Education, Diploma in International Business');
('SIM Global Education, Diploma in International Trade');
('SIM Global Education, Diploma in Management Studies (E-Learning)');
('SIM Global Education, Diploma in Business');
        
('University at Buffalo, Bachelor of Science in Business Administration'),
('University at Buffalo, Bachelor of Arts in Psychology'),
('University at Buffalo, Bachelor of Arts in Communication'),




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

