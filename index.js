/**
* index.js
* This is your main app entry point
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

//Setting up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(__dirname + '/public')); // set location of static files
//parse routes for cookie parser
app.use(cookieParser());
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

//Routes set up
// app.use('/', indexRoute);

//Home page to login/register
app.get("/", (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    res.render("index.ejs", {
        user: req.session.user
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
        res.render("register.ejs");
});

// Handle registration
app.post("/register", (req, res) => {
    const { name, password, email, school, course, description } = req.body;
    // Back end email validation
    const emailDomain = '@mymail.sim.edu.sg';
    if (!email.endsWith(emailDomain)) {
        return res.render("register.ejs", { error: 'Please use a SIM email address with ' + emailDomain });
    }
    // Check if email already exists
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    global.db.get(checkEmailQuery, [email], function (err, row) {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (row) {
            return res.render("register.ejs", { error: 'Email is already in use.' });
        } else {
            // If email is not in use
            const Userquery = "INSERT INTO users (name, password, email, school, course, description, stars) VALUES (?, ?, ?, ?, ?, ?, 0)";
            global.db.run(Userquery, [name, password, email, school, course, description], function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.redirect('/login');
            });
    }})});

app.use('/', indexRoute);

// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

