// //  * author.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));


// Middleware to check if the user is authorised
function checkAuthorised(req, res) {
    if (req.session.isAuthenticated && req.session.user.authorised) {
        return true; // User is authenticated and authorised
    } else if (!req.session.isAuthenticated) {
        res.redirect("/login"); // Redirect to login if not authenticated
        return false; // Return false since user is not authenticated
    } else {
        return false; // Return false if user is authenticated but not authorised
    }
}

// Display author home page with published and draft articles
router.get("/", (req, res) => {
    //Check if user is authorised to access author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    //query the database for publishe, draft articles and author settings
    const publishedQuery = "SELECT * FROM articles WHERE status = 'published'";
    const draftQuery = "SELECT * FROM articles WHERE status = 'draft'";
    const authorQuery = "SELECT * FROM authorSettings";

    global.db.all(publishedQuery, [], (err, publishedArticles) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        global.db.all(draftQuery, [], (err, draftArticles) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            global.db.get(authorQuery, [], (err, author) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                console.log("Author session id "+ req.session.id);
                res.render("authors/author.ejs", { 
                    blog_title: author.blog_title,
                    author_name: author.author_name,
                    publishedArticles, 
                    draftArticles
                });
            });
        });
    });
});

// Display settings page
router.get("/settings", (req, res) => {
    //Check if user is authorised to access author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    //query the database for author settings, with only the first list
    const authorQuery = "SELECT * FROM authorSettings LIMIT 1";
    global.db.get(authorQuery, [], (err, author) => {
        if (err) {
            return res.status(500).send(err.message);
        }
            res.render("authors/settings.ejs", { 
                author,
                user: req.session.user
            });
    });
});

// Settings edits and submission
router.post("/settings", (req, res) => {
    //Check if user is authorised to access author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    //Extract blog title and author name from the request body
    const { blogTitle, authorName } = req.body;
    //Then update author settings in db
    const query = "UPDATE authorSettings SET blog_title = ?, author_name = ? WHERE author_id = 1"; // Assuming single author
    global.db.run(query, [blogTitle, authorName], function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect("/author");
    });
});

// Editing article page in author page
router.get("/edit/:id", (req, res) => {
    // Check if the user is authorised to access the author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    // Extract the article id from the request parameters
    const articleId = req.params.id;
    // Query the database for the specific article based on the id
    const query = "SELECT * FROM articles WHERE id = ?";
    const authorQuery = "SELECT * FROM authorSettings";
    global.db.get(query, [articleId], (err, article) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        global.db.get(authorQuery, [], (err, author) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.render("authors/edit.ejs", { 
                article,
                blog_title: author.blog_title,
                author_name: author.author_name,
                user: req.session.user

            });
        });
    });
});

router.get("/edit", (req, res) => {
    // Check if the user is authorised to access the author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    // Extract the article id from the request parameters
    const articleId = req.params.id;
    // Query the database for the specific article based on the id
    const query = "SELECT * FROM articles WHERE id = ?";
    const authorQuery = "SELECT * FROM authorSettings";
    global.db.get(query, [articleId], (err, article) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        global.db.get(authorQuery, [], (err, author) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.render("authors/edit.ejs", { 
                article,
                blog_title: author.blog_title,
                author_name: author.author_name,
                user: req.session.user

            });
        });
    });
});

// Editing page for post, to submit request for users
router.post("/edit/:id", (req, res) => {
     // Check if the user is authorised to access the author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    // Extract the article id from the request parameters
    const articleId = req.params.id;
    const { title, content, status } = req.body;
     // update the database for a specific article 
    const query = "UPDATE articles SET title = ?, content = ?, status = ?, last_modified = datetime('now') WHERE id = ?";
    global.db.run(query, [title, content, status, articleId], function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect(`/author`);
    });
});

// Adding a new article in the edit page
router.post("/edit", (req, res) => {
    // Check if the user is authorised to access the author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    const { title, content, status } = req.body;
    // update the database with a new  article 
    const query = "INSERT INTO articles (title, content, status, created_at, last_modified, published_at) VALUES (?, ?, ?, datetime('now'), datetime('now'), datetime('now'))";
    global.db.run(query, [title, content, status], function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        const authorQuery = "SELECT * FROM authorSettings";
        global.db.get(authorQuery, [], (err, author) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.redirect(`/author`);

        });
    });
});

// Deletion and publication of articles
// Delete article in author page
router.delete("/delete-article/:id", (req, res) => {
    // Check if the user is authorised to access the author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    const articleId = req.params.id;
    //Delete article in db
    const query = "DELETE FROM articles WHERE id = ?";
    global.db.run(query, [articleId], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true });
    });
});

// Publish article
router.post("/publish-article/:id", (req, res) => {
    // Check if the user is authorised to access the author page
    if (!checkAuthorised(req, res)) {
        return res.status(403).send("Only authorised users can access the author page.");
    }
    const articleId = req.params.id;
    //change from draft to published
    const query = "UPDATE articles SET status = 'published', published_at = datetime('now') WHERE id = ?";
    global.db.run(query, [articleId], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true });
    });
});

// Export the router object
module.exports = router;


