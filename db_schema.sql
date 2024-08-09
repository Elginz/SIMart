

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
    image BLOB,
    image_type TEXT,
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
CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image BLOB,
    image_type TEXT,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);


-- //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

INSERT OR IGNORE INTO courses (course_name) VALUES 
('University of London, BSc in Computer Science'),
('University of London, BSc in Computer Science (User Experience)'),
('University of London, BSc in Computer Science (Machine Learning and Artificial Intelligence)'),
('University of London, BSc in Computer Science (Web and Mobile Development)'),
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
('University of London, Postgraduate Certificate in Data Science'),
('University of London, Postgraduate Diploma in Data Science and Financial Technology'),
('University of London, Postgraduate Diploma in Data Science and Artificial Intelligence'),
('University of London, Postgraduate Diploma in Data Science'),
('University of London, Master of Science in Professional Accountancy'),
('University of London, Master of Science in Data Science'),
('University of London, Master of Science in Accounting and Financial Management'),
('University of London, Master of Science in Data Science and Artificial Intelligence'),
('University of London, Master of Science in Data Science and Financial Technology'),
('University of London, Graduate Certificate in Machine Learning and Artificial Intelligence'),
('University of London, Graduate Certificate in Mobile Development'),
('University of London, Graduate Certificate in User Experience'),
('University of London, Graduate Certificate in Physical Computing and the Internet of Things'),
('University of London, Graduate Certificate in Web Development'),
('University of London, Graduate Diploma in Physical Computing and the Internet of Things'),
('University of London, Graduate Diploma in Management and Digital Innovation'),    
('University of London, Graduate Diploma in Data Science'),
('University of London, Graduate Diploma in Economics'),
('University of London, Graduate Diploma in Machine Learning and Artificial Intelligence'),
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
('University of Wollongong, Bachelor of Information Technology'),
('University of Wollongong, Bachelor of Psychological Science'),
('University of Wollongong, Bachelor of Business Information Systems'),
('University of Wollongong, Double Major : Bachelor of Computer Science (Digital Systems Security and Cyber Security) / (Digital Systems Security and Big Data) / (Big Data and Cyber Security'),
('University of Wollongong, Master of Computing (Data Analytics) (Top-up)'),
('Grenoble Ecole de Management, MSc Finance and Investment Banking (Top-up)'),
('Grenoble Ecole de Management, MSc Finance (Top-up)'),   
('Grenoble Ecole de Management, MSc Fashion, Design and Luxury Management'),   
('Grenoble Ecole de Management, Bachelor in International Business (Top-up)'),   
('SIM Global Education, Diploma in Banking & Finance'),
('SIM Global Education, Diploma in Banking & Finance (E-Learning)'),
('SIM Global Education, Diploma in Accounting (E-Learning)'),
('SIM Global Education, Diploma in Accounting'),
('SIM Global Education, Diploma in Information Technology'),
('SIM Global Education, Diploma in Information Technology (E-Learning)'),
('SIM Global Education, Diploma in International Business (E-Learning)'),
('SIM Global Education, Diploma in International Business'),
('SIM Global Education, Diploma in Management Studies (E-Learning)'),
('SIM Global Education, Diploma in Management Studies'),
('SIM Global Education, Graduate Certificate in Human Resource Management (E-Learning)'),
('SIM Global Education, Graduate Diploma in Business Sustainability (Part-Time)'),
('SIM Global Education, Graduate Diploma in Data Science (E-Learning)'),
('SIM Global Education, Graduate Diploma in Business Analytics (Full-Time)'),
('SIM Global Education, Graduate Diploma in Industry 4.0 (Full-Time)'),
('SIM Global Education, Graduate Certificate in Cybersecurity Management (E-Learning)'),
('SIM Global Education, Graduate Certificate in Business Analytics (Part-Time)'),
('SIM Global Education, Specialist Diploma in Social Entrepreneurship (Part-Time)'),
('SIM Global Education, Graduate Diploma in Digital Marketing'),
('SIM Global Education, Graduate Diploma in Business Analytics (Part-Time)'),
('SIM Global Education, Graduate Diploma in Business Management (E-Learning)'),
('SIM Global Education, Graduate Certificate in Business Sustainability (Part-Time)'),
('SIM Global Education, Graduate Diploma in Human Resource Management (Full-Time)'),
('SIM Global Education, Graduate Certificate in Software Automation (Part-Time)'),
('SIM Global Education, Graduate Certificate in Industry 4.0 (Part-Time)'),
('SIM Global Education, Graduate Certificate in Information Technology Management (E-Learning)'),
('SIM Global Education, Graduate Diploma in Industry 4.0 (Part-Time)'),
('SIM Global Education, Graduate Diploma in Human Resource Management (Part-Time)'),
('SIM Global Education, Graduate Certificate in Business Digitalization (Part-Time)'),
('SIM Global Education, Graduate Certificate in Digital Marketing (E-Learning)'),
('SIM Global Education, Graduate Diploma in Business Sustainability (Full-Time)'),
('SIM Global Education, Graduate Certificate in Analytics (E-Learning)'),
('SIM Global Education, Management Foundation Studies - Blended'),
('SIM Global Education, Certificate in Pre-Sessional Business Management'),
('SIM Global Education, Information Technology Foundation Studies'),
('SIM Global Education, Certificate in Foundation Studies (E-Learning)'),
('SIM Global Education, Certificate in Pre-Sessional Business Management (E-Learning)'),
('SIM Global Education, Management Foundation Studies'),
('SIM Global Education, Information Technology Foundation Studies (E-Learning)'),
('SIM Global Education, Management Foundation Studies (E-Learning)'),
('SIM Global Education, Certificate in Foundation Studies'),
('University at Buffalo, Bachelor of Arts (International Trade)'),
('University at Buffalo, Double Degree - Bachelor of Science (Geographic Information Science) and Bachelor of Arts (Psychology)'),
('University at Buffalo, Double Degree - Bachelor of Science (Geographic Information Science) and Bachelor of Arts (International Trade)'),
('University at Buffalo, Double Degree - Bachelor of Science (Business Administration) and Bachelor of Arts (Psychology)'),
('University at Buffalo, Double Degree - Bachelor of Science (Geographic Information Science) and Bachelor of Arts (Communication)'),
('University at Buffalo, Double Degree - Bachelor of Science (Business Administration) and Bachelor of Arts (Communication)'),    
('University at Buffalo, Bachelor of Arts (Psychology)'),
('University at Buffalo, Bachelor of Arts (Economics)'),
('University at Buffalo, Double Major - Bachelor of Arts (International Trade and Psychology)'),
('University at Buffalo, Bachelor of Science (Business Administration)'),
('University at Buffalo, Double Degree - Bachelor of Science (Business Administration) and Bachelor of Arts (Economics)'),
('University at Buffalo, Double Major - Bachelor of Arts (Communication and Psychology)'),
('University at Buffalo, Double Degree - Bachelor of Science (Business Administration) and Bachelor of Arts (Sociology)'),   
('University at Buffalo, Double Major - Bachelor of Arts (Communication and Sociology)'),
('University at Buffalo, Double Degree - Bachelor of Science (Geographic Information Science) and Bachelor of Arts (Economics)'),
('University at Buffalo, Double Major - Bachelor of Arts (Economics and Psychology)'),
('University at Buffalo, Double Major - Bachelor of Arts (Communication and International Trade)'),
('University at Buffalo, Double Major - Bachelor of Arts (International Trade and Sociology)'),
('University at Buffalo, Bachelor of Arts (Sociology)'),
('University at Buffalo, Bachelor of Arts (Communication)'),
('University at Buffalo, Double Major - Bachelor of Arts (Economics and Sociology)'),
('University at Buffalo, Double Major - Bachelor of Science (Business Administration and Geographic Information Science)'),
('University at Buffalo, Double Major - Bachelor of Arts (Communication and Economics)'),
('University at Buffalo, Bachelor of Science (Geographic Information Studies Science)'),
('University at Buffalo, Double Degree - Bachelor of Science (Business Administration) and Bachelor of Arts (International Trade)'),  
('University at Buffalo, Double Degree - Bachelor of Science (Geographic Information Science) and Bachelor of Arts (Sociology)'),
('University at Buffalo, Double Major - Bachelor of Arts (Economics and International Trade)'),
('University at Buffalo, Double Major - Bachelor of Arts (Psychology and Sociology)');

-- Insert Users Data
-- INSERT INTO users (email, name, password, course, rating, description) 
-- VALUES 
-- ('sean@mail.com', 'sean', '123', 'University of London, BSc Computer Science', 5, 'Professor of this site'),
-- ('matthew@mail.com', 'matthew', '123', 'University of Wollongong, Diploma in Banking & Finance', 5, 'User of this site');

-- -- default listings
-- INSERT INTO product (user_id, product_name, content_description, price, category, transaction_type, condition, created_at, availability) 
-- VALUES 
-- ((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Headphones', 'Used once over my headscarf, so dont have to worry about hygine. Figured i didnt need it actualy hence selling comes with original full box and its accessories warranty not activated, Model is on photo, so you can google its functions on your end. Bought at $149, my loss your gain', 120, 'Electronics', 'Sell', 'Lightly used', '2021-11-11 11:11:11', true),
-- ((SELECT user_id FROM users WHERE email = 'matthew@mail.com'), 'Game console', 'Used once over my headscarf, so dont have to worry about hygine. Figured i didnt need it actualy hence selling comes with original full box and its accessories warranty not activated, Model is on photo, so you can google its functions on your end. Bought at $149, my loss your gain', 270, 'Electronics', 'Sell, Trade', 'Lightly used', '2021-11-11 11:11:11', true);

-- -- default reviews
-- INSERT INTO reviews (user_id, commenterName, commentContent, created_at, stars_given) 
-- VALUES 
-- ((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Tyler', 'Great transaction! Met up at school as agreed, and the item was exactly as described. The seller was punctual and friendly. Would definitely deal with them again. Thanks!', '2021-11-11 11:11:11', 3),
-- ((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Emily', 'The transaction went smoothly. The item was in decent condition, though it showed a bit more wear than expected. Communication could have been better.', '2021-11-11 11:11:11', 4),
-- ((SELECT user_id FROM users WHERE email = 'sean@mail.com'), 'Lily', 'Excellent transaction! The buyer was prompt, friendly, and easy to coordinate with. We met at school for the exchange, and everything went smoothly.', '2021-11-11 11:11:11', 2);

-- -- default favourites
-- INSERT INTO favourites (user_id, product_id, photo) 
-- VALUES 
-- ((SELECT user_id FROM users WHERE email = 'sean@mail.com'), (SELECT id FROM product WHERE user_id = (SELECT user_id FROM users WHERE email = 'matthew@mail.com')), '');



COMMIT;

