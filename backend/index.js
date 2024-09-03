/**
 * index.js
 */

// Required modules and middleware 
const express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const indexRoute = require('./routes/indexRoute.js');
const { 
    getImagesForProducts,
    getAllSchools,
    renderTransactionType 
    //Helper functions
} = require('./routes/queries.js'); 
//A new instance for the express app
const app = express();
const port = 3000;

// for CORS (Cross-origin resource sharing)
const cors = require('cors');
app.use(cors({
    //to allow request from the frontend URL
    origin: 'https://s-mart-jme0meogk-team58-projects.vercel.app',
    //for cookies to be send and to be received with requests
    credentials: true 
}));

//Setting up middleware
//URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
//view engine to EJS to render HTML templates
app.set('view engine', 'ejs'); 
//Set directory for EJS 
app.set('views', __dirname + '/../frontend/views');
// set location of static files
app.use(express.static(__dirname + '/../frontend/public'));
app.use('/uploads', express.static('uploads'));
//For cookies to be attached to the client request
app.use(cookieParser());
//pars JSON-encoded request bodies
app.use(express.json());
app.use(session({
    // secret key to sign session IDs
    secret: "secretKey",
    //prevent saving any empty sessions
    saveUninitialized: false, 
    //prevent any resaving of unchanged sessions
    resave: false,
    //store sessions in SQLite database
    store: new SQLiteStore,
    cookie: {
        maxAge: 1000 * 60 * 10  // session cookie set for 10 minutes
    }
}));  

// Set up SQLite connection
// Items in the global namespace are accessible throughout the node application
global.db = new sqlite3.Database('./database.db', function(err) {
    if (err) {
        console.error(err);
        // error handlign if we can't connect to the DB
        process.exit(1); 
    } else {
        console.log("Database connected");
        //enable foreign key constraints in the SQLite
        global.db.run("PRAGMA foreign_keys=ON");
    }
}); 

// Home page to login/register
app.get("/", async (req, res) => {
    //redirect to login pafe if user is not authenticated
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    //Query to fetch products from the DB
    const { name, transaction_type } = req.query;
    let query = "SELECT * FROM product WHERE 1=1 AND offer_status = 'not made'";
    const params = [];
    
    if (name) {
        query += " AND name LIKE ?";
        params.push(`%${name}%`);
    }
    
    if (transaction_type) {
        query += " AND transaction_type = ?";
        params.push(transaction_type);
    }
    
    query += " ORDER BY created_at";
    
    try {
        //query to fetch products
        const products = await new Promise((resolve, reject) => {
            global.db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
        });

        // Fetch images for each product
        const productImages = await getImagesForProducts(products);

        // Render the home page with the fetched data
        res.render("index.ejs", {
            product: products,
            //pass user data to view
            user: req.session.user,
            name,
            images: productImages,
            transaction_type,
            //helper function to render transaction types
            renderTransactionType
        });
    } catch (err) {
        // Handle any errors that occurred during the database queries
        res.status(500).send(err.message);
    }
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
        //clear session cookie
        res.clearCookie('connect.sid'); 
        // Redirect to login page after logout
        res.redirect('/'); 
    });
});

// For login submissions
app.post("/login", (req, res) => {
    //extract the email and password from the request body
    const { email, password } = req.body; 
    //to find user with matching credentials
    const query = "SELECT * FROM users WHERE email = ? AND password = ?";

    console.log('Executing query:', query, 'with parameters:', [email, password]);

    global.db.get(query, [email, password], function (err, user) {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send(err.message);
        }
        if (user) {
            // Authenticate user and set session
            req.session.user = user;
            req.session.isAuthenticated = true;

            // Redirect to home page after successful login
            res.redirect('/');
        } else {
            //error message on login failure
            res.render('login.ejs', { error: 'Incorrect email or password.' }); 
        }
    });
});

// Display Registeration page
app.get("/register", (req, res) => {
    const query = "SELECT course_name FROM courses";
    
    global.db.all(query, [], (err, rows) => {
        // Define courses as empty array if there's an error
        const courses = err ? [] : rows;

        if (err) {
            return res.status(500).send(err.message);
        }
    //render registration page with courses data
        res.render("register.ejs", { courses, error: null });
    });
});

// Handle registration
app.post("/register", async (req, res) => {
    const { name, password, email, course, description } = req.body;
    const emailDomain = '@mymail.sim.edu.sg';
    //collect all  courses from helper function
    const courses = await getAllSchools();

    // Back end email validation
    if (!email.endsWith(emailDomain)) {
        return res.render("register.ejs", { courses, error: `Please use a SIM email address with ${emailDomain}` });
    }

    // Check if all fields are provided
    if (!name || !password || !email || !course || !description) {
        return res.render("register.ejs", { courses, error: 'All fields are required.' });
    }

    try {
        // Check if email already exists inside the database
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
        //redirect to login page after a successful registration
        res.redirect('/login');
    } catch (error) {
        res.status(500).send(error.message);
    }
});
//use indexRoute for other routes
app.use('/', indexRoute);

// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
