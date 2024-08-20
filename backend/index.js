/**
* index.js
*/

// Set up express, bodyparser and EJS
const express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const indexRoute = require('./routes/indexRoute.js');
const app = express();
const port = 3000;

// Testing to use CORS
const cors = require('cors');
app.use(cors({
    origin: 'https://s-mart-jme0meogk-team58-projects.vercel.app', // frontend URL
    credentials: true //  cookies to be sent and received
  }));
  


//Setting up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.set('views', __dirname + '/../frontend/views');
app.use(express.static(__dirname + '/../frontend/public')); // set location of static files
app.use('/uploads', express.static('uploads'));
//parse routes for cookie parser
app.use(cookieParser());
app.use(express.json());
app.use(session({
    //ensure session is called first
    secret: "secretKey",
    saveUninitialized: false, // Do not save every session ID as some might be users who do nothing. Only save session ID of users who are logging in.
    resave: false,
    store: new SQLiteStore,
    cookie:{
        maxAge: 10000 * 60 * 10  //set for 10 minutes
    }
}));

// Testing to use session across domains
// app.use(session({
//     secret: "secretKey",
//     saveUninitialized: false,
//     resave: false,
//     store: new SQLiteStore,
//     cookie: {
//       maxAge: 10000 * 60 * 10, // 10 minutes
//       sameSite: 'none', // Important for cross-site cookies
//       secure: true // Make sure this is true if you're using HTTPS
//     }
//   }));
  

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
}); 

//Home page to login/register
app.get("/", (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    const { product_name, transaction_type } = req.query;
    let query = "SELECT * FROM product WHERE 1=1";
    const params = [];
    
    if (product_name) {
        query += " AND product_name LIKE ?";
        params.push(`%${product_name}%`);
    }
    
    if (transaction_type) {
        query += " AND transaction_type = ?";
        params.push(transaction_type);
    }
    
    query += " ORDER BY created_at";
    
    global.db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        
        // After getting products, fetch the images for each product
        let productImages = {};
        let processed = 0; // Track how many products we've processed
        if (products.length === 0) {
            return res.render("index.ejs", {
                product: products,
                user: req.session.user,
                product_name: product_name,
                transaction_type: transaction_type,
                images: productImages
            });
        }
        products.forEach((product) => {
            global.db.all("SELECT * FROM product_images WHERE product_id = ?", [product.id], (err, images) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                productImages[product.id] = images;
                processed++;
                if (processed === products.length) {
                    // When all products have been processed, render the page
                    res.render("index.ejs", {
                        product: products,
                        user: req.session.user,
                        product_name: product_name,
                        transaction_type: transaction_type,
                        images: productImages
                    });
                }
            });
        });
    });
});



// Display login page
app.get("/login", (req, res) => {
    res.render("login.ejs");
});

// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Failed to logout');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/'); // Redirect to login page after logout
    });
});

//Handle login
app.post("/login", (req, res) => {
    const { email, password } = req.body; // Use 'email' instead of 'name'

    const query = "SELECT * FROM users WHERE email = ? AND password = ?"; // Updated query

    console.log('Executing query:', query, 'with parameters:', [email, password]);

    global.db.get(query, [email, password], function (err, user) {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send(err.message);
        }
        if (user) {
            req.session.user = user;
            req.session.isAuthenticated = true;
            res.redirect('/');
        } else {
            res.render('login.ejs', { error: 'Incorrect email or password.' }); // Updated error message
        }
    });
});

// Display Register page
app.get("/register", (req, res) => {
    const query = "SELECT course_name FROM courses";
    
    global.db.all(query, [], (err, rows) => {
        // Define courses as empty array if there's an error
        const courses = err ? [] : rows;

        if (err) {
            return res.status(500).send(err.message);
        }

        res.render("register.ejs", { courses, error: null });
    });
});

// Handle registration
app.post("/register", async (req, res) => {
    const { name, password, email, course, description } = req.body;
    const emailDomain = '@mymail.sim.edu.sg';

    // Query for courses to include in the view
    const query = "SELECT course_name FROM courses";
    const courses = await new Promise((resolve, reject) => {
        global.db.all(query, [], (err, rows) => err ? reject(err) : resolve(rows));
    });

    // Back end email validation
    if (!email.endsWith(emailDomain)) {
        return res.render("register.ejs", { courses, error: `Please use a SIM email address with ${emailDomain}` });
    }

    // Check if all fields are provided
    if (!name || !password || !email || !course || !description) {
        return res.render("register.ejs", { courses, error: 'All fields are required.' });
    }

    try {
        // Check if email already exists
        const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
        const row = await new Promise((resolve, reject) => {
            global.db.get(checkEmailQuery, [email], (err, row) => err ? reject(err) : resolve(row));
        });

        if (row) {
            return res.render("register.ejs", { courses, error: 'Email is already in use.' });
        }

        // Insert new user into the database without hashing the password
        const Userquery = "INSERT INTO users (name, password, email, course, description, rating) VALUES (?, ?, ?, ?, ?, 0)";
        await new Promise((resolve, reject) => {
            global.db.run(Userquery, [name, password, email, course, description], function (err) {
                if (err) reject(err);
                else resolve();
            });
        });

        res.redirect('/login');
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.use('/', indexRoute);

// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
