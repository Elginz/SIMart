// /**
//  * reader.js
//  * These are example routes for user management
//  * This shows how to correctly structure your routes for the project
//  * and the suggested pattern for retrieving data by executing queries
//  *
//  * NB. it's better NOT to use arrow functions for callbacks with the SQLite library
// * 
//  */
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));

// reader page route
router.get("/", (req, res) => {
    // Query to retrieve published articles and author settings
    const publishedQuery = "SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC";
    const authorQuery = "SELECT * FROM authorSettings LIMIT 1";
    // Retrieve published articles and author settings from the database
    global.db.all(publishedQuery, [], (err, publishedArticles) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        global.db.get(authorQuery, [], (err, author) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.render("readers/reader.ejs", { 
                blog_title: author.blog_title,
                author_name: author.author_name,
                publishedArticles
            });
        });
    });
});

// Individual article route WITH NEW COMMENTS QUERY ADDED
router.get("/readerArticle/:id", (req, res) => {
    // Retrieve article details, author settings, and comments for a specific article
    const articleId = req.params.id;
    const query = "SELECT * FROM articles WHERE id = ? AND status = 'published'";
    const authorQuery = "SELECT * FROM authorSettings LIMIT 1";
    const commentsQuery = "SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC";
    // Retrieve article details from the database
    global.db.get(query, [articleId], function (err, article) {
        if (err) {
            return res.status(500).send(err.message);
        }
        // Check if the article exists
        if (!article) {
            return res.status(404).send("Article not found");
        }
        // Update the reads count for the article
        const updateReadsQuery = "UPDATE articles SET reads = reads + 1 WHERE id = ?";
        global.db.run(updateReadsQuery, [articleId], function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }
            // Retrieve author settings, comments, and render the article page
            global.db.get(authorQuery, [], function (err, author) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                global.db.all(commentsQuery, [articleId], function (err, comments) {
                    if (err) {
                        return res.status(500).send(err.message);
                    }
                res.render("readers/readerArticle.ejs", {
                    blog_title: author.blog_title,
                    author_name: author.author_name,
                    article,
                    comments,
                    user:req.session.user
                    });
                });
            });
        });
    });
});

// Like and remove 1 read route
router.post("/readerArticle/:id/like", (req, res) => {
    // Handling like functionality for an article
    const articleId = req.params.id;

    // Update likes count for the article
    const updateLikesQuery = "UPDATE articles SET likes = likes + 1 WHERE id = ?";
    global.db.run(updateLikesQuery, [articleId], function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Update reads count (assuming you also want to decrement reads)
        const updateReadsQuery = "UPDATE articles SET reads = reads - 1 WHERE id = ?";
        global.db.run(updateReadsQuery, [articleId], function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }

            // Redirect to the article page after updating both likes and reads
            res.redirect(`/reader/readerArticle/${articleId}`);
        });
    });
});

//adding commments
router.post("/readerArticle/:id/comment", (req, res) => {
    // Handle adding comments to an article
    const articleId = req.params.id;
    const { commenterName, commentContent } = req.body;

    // Validate the input
    if (!commenterName || !commentContent) {
        return res.status(400).send("Commenter name and content are required.");
    }
    // Check authentication status
    if (!req.session.isAuthenticated) {
        return res.render('login.ejs', { error: 'You need to log in to comment.' });
    }
    // Insert the new comment into the database
    const insertQuery = "INSERT INTO comments (article_id, commenterName, commentContent, created_at) VALUES (?, ?, ?, datetime('now'))";
    global.db.run(insertQuery, [articleId, commenterName, commentContent], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect(`/reader/readerArticle/${articleId}`);
    });
});

// Delete comment route
router.post("/readerArticle/:id/deleteComment/:commentId", (req, res) => {
    const articleId = req.params.id;
    const commentId = req.params.commentId;

    // Check if user is authenticated and authorized
    if (!req.session.isAuthenticated) {
        return res.render('login.ejs', { error: 'You need to log in to delete a comment.' });
    }

    // Verify if the user has permissions to delete the comment (e.g., check if they are the commenter or an admin)
    const deleteQuery = "DELETE FROM comments WHERE id = ?";
    global.db.run(deleteQuery, [commentId], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect(`/reader/readerArticle/${articleId}`);
    });
});

module.exports = router;

