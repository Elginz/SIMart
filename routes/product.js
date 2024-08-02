//product.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Display form to create a new product
router.get("/new", (req, res) => {
    res.render("products/create_listing.ejs");
});

// Handle the creation of a new product with image upload
router.post("/", upload.single("image"), (req, res) => {
    const { name, description, price, category, transaction, condition } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const query = "INSERT INTO products (name, description, price, image_url, category, transaction, condition) VALUES (?, ?, ?, ?, ?, ?, ?)";
    global.db.run(query, [name, description, price, image, category, transaction, condition], function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect("/products");
    });
});

// Display a single product
router.get("/:id", (req, res) => {
    const query = "SELECT * FROM products WHERE id = ?";
    global.db.get(query, [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.render("products/show_product.ejs", { product });
    });
});

module.exports = router;
