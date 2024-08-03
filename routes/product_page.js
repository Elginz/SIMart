//product.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Display form to create a new product
router.get("/new", (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    } else {
        res.render("create_listing.ejs");
    }
});

// Handle the creation of a new product with image upload
router.post("/new", upload.single("image"), (req, res) => {
    const { name, description, price, category, transaction, condition } = req.body;

    // uncomment this to store the image path
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // uncomment this to store the binary data of the image
    // const image = req.file ? fs.readFileSync(req.file.path) : null;

    // Retrieve the user's email from session
    const email = req.session.user.email;

    const userQuery = "SELECT * FROM users WHERE email = ?";
        
    global.db.get(userQuery, [email], (err, user) => {
        if (err) {
            return res.status(500).send(err.message);
        } else {
            const query = "INSERT INTO product (user_id, product_name, image, content_description, price, category, transaction_type, condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            global.db.run(query, [user.user_id, name, image, description, 10, category, transaction, condition, new Date().toLocaleString()], function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.redirect("show_product.ejs");
            });
        }
    });
});

// Display a single product
router.get("/:id", (req, res) => {
    const query = "SELECT * FROM product WHERE id = ?";
    global.db.all(query, [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.render("show_product.ejs", { 
            product: product 
        });
    });
});

module.exports = router;
