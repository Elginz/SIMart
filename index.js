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
        maxAge: 10000 * 60  //set for 1 minute
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
app.use('/', indexRoute);

//Home page to login/register
app.get("/", (req, res) => {
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
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    global.db.get(query, [username, password], function (err, user) {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (user){
            req.session.user = user;
            //User has been authenticated
            req.session.isAuthenticated = true;
            res.redirect('/');
        }
        else {
            // Incorrect username or password
            res.render('login.ejs', { error: 'Incorrect username or password.' });
        }
        });
});

// Display Register page
app.get("/register", (req, res) => {
        res.render("register.ejs");
});

// Handle registration
app.post("/register", (req, res) => {
    const { username, password, email } = req.body;
    const Userquery = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
    global.db.run(Userquery, [username, password, email], function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
            res.redirect('/login');
        });
});

// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
