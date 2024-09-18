// product_page.js

//Import and set up modules
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
//import utility functions for database
const {
    getUserByEmail,
    getUserById,
    getProductById,
    getProductImagesById,
    insertProduct,
    insertProductImage,
    updateProduct,
    deleteProduct,
    deleteProductImage,
    updateOfferMadeBy,
    updateOfferStatus,
    insertReview,
    getReviewsByUserId,
    updateUserRating,
    getProductFavourites,
    addProductToFavourites,
    removeProductFromFavourites,
    renderTransactionType
} = require('./queries');

//storage for uploaded images
const storage = multer.diskStorage({
    //folder for uploads
    destination: function (req, file, cb) {
        //to log into the destination
        console.log(`Saving file to uploads/ directory`); 
        cb(null, 'uploads/');
    },
    //create a unique filename for each uploaded file
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = uniqueSuffix + path.extname(file.originalname);
        console.log(`Generated filename: ${fileName}`); // Log the generated filename
        cb(null, fileName);
    }
});
//initialise a multer to handle file uploads. 
const upload = multer({ 
    storage: storage,
    //there is only a 20MB limit per file
    limits: { fileSize: 20 * 1024 * 1024 } 
});

// Display form to create a new product
router.get("/new", (req, res) => {
    let product = null;
    //redirect to login page if user is not authenticated
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    } else {
        //render product lsiting 
        res.render("create_listing.ejs", { product });
    }
});

// Create a new product
router.post("/new", upload.array("images", 4), async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    try {
        //product details from the request
        let { name, description, price, category, transaction_type, condition } = req.body;
        //to ensure that the price is defined
        price = price || 0;
        //to handle transaction types, by joining them into a string
        transaction_type = Array.isArray(transaction_type) ? transaction_type.join(', ') : transaction_type;
        //retrieve user's email from the session
        const email = req.session.user.email;
        const user = await getUserByEmail(email);
        //to insert a new product
        const productId = await insertProduct({
            userId: user.id,
            name,
            description,
            price,
            category,
            transaction_type,
            condition
        });

        // Insert product images 
        for (const file of req.files) {
            const imageData = fs.readFileSync(file.path);
            const imageType = file.mimetype;
            await insertProductImage(productId, imageData, imageType);
        }
        //redirect to a newly created product 
        res.redirect(`/product/${productId}`);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send(err.message);
    }
});

// Make an offer
router.post("/make-offer", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    const { productId } = req.body;
    const sessionUserId = req.session.user.id;
    try {
        //update offer details 
        await updateOfferMadeBy(productId, sessionUserId);
        await updateOfferStatus(productId, 'made');
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send(err.message);
    }
});

// Offer status to 'in progress'
router.post("/offer-in-progress", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    const { productId } = req.body;
    try {
        await updateOfferStatus(productId, 'in progress');
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send(err.message);
    }
});

// Complete an offer and make the product unavailable
router.post("/complete-offer", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    const { productId } = req.body;
    const updateOfferAndAvailability = async () => {
        try {
            await updateOfferStatus(productId, 'completed');
            await updateProduct(productId, { availability: false });
            res.json({ success: true });
        } catch (err) {
            console.error('Error:', err.message);
            res.status(500).send(err.message);
        }
    };
    updateOfferAndAvailability();
});

// Display a single product
router.get("/:id", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    try {
        //get product details
        const product = await getProductById(req.params.id);
        if (!product) return res.status(404).send("Product not found");
        //get product images
        const images = await getProductImagesById(req.params.id);
        images.forEach(image => image.image = image.image.toString('base64'));
        //get product's user details
        const user = await getUserById(product.user_id);
        const fav = await getProductFavourites(req.session.user.id, product.id);
        //render product page
        res.render("show_product.ejs", {
            product,
            images,
            renderTransactionType,
            user,
            sessionUserId: req.session.user.id,
            isFavourite: !!fav
        });
        //error handling 
    } catch (err) {
        res.status(500).send("Error retrieving product: " + err.message);
    }
});

// Handle adding a review
router.post("/:id", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    const { review, rating } = req.body;
    const productId = req.params.id;
    try {
        const product = await getProductById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        await insertReview(product.user_id, req.session.user.id, review, new Date().toLocaleString(), rating);

        const reviews = await getReviewsByUserId(product.user_id);
        const averageRating = reviews.length > 0
            ? Math.floor(reviews.reduce((acc, review) => acc + review.stars_given, 0) / reviews.length)
            : 0;

        await updateUserRating(product.user_id, averageRating);

        res.redirect("/");
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send(err.message);
    }
});

// Edit a product
router.get("/edit/:id", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    try {
        //retrieve product and product images 
        const product = await getProductById(req.params.id);
        const images = await getProductImagesById(req.params.id);
        const imageData = images.map(img => ({
            id: img.id,
            src: `data:${img.image_type};base64,${img.image.toString('base64')}`
        }));
        //render an edit form 
        res.render("create_listing.ejs", { product, imageData });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update product
router.post("/edit/:id", upload.array("images", 4), async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    try {
        //get updated product details from request
        let { name, description, price, category, transaction_type, condition, existingImages } = req.body;
        //ensure that price is defined
        price = price || 0;
        //to handle multiple transaction types
        transaction_type = Array.isArray(transaction_type) ? transaction_type.join(', ') : transaction_type;
        //update product details
        await updateProduct(req.params.id, { name, description, price, category, transaction_type, condition });

        // Handle removed images
        const removeImages = req.body.removeImages || [];
        for (const imageId of removeImages) {
            await deleteProductImage(imageId);
        }

        // Insert new images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const imageData = fs.readFileSync(file.path);
                const imageType = file.mimetype;
                await insertProductImage(req.params.id, imageData, imageType);
            }
        }
        //redirect to the edited product page
        res.redirect(`/product/${req.params.id}`);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send(err.message);
    }
});

// Delete a product
router.post("/delete/:id", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    try {
        //delete product
        await deleteProduct(req.params.id);
        res.redirect("/");
    } catch (err) {
        res.status(500).send("Failed to delete the product");
    }
});

// Add product to favourites
router.post("/favourites/add", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    try {
        const { productId, userId } = req.body;
        if (!productId || !userId) {
            return res.status(400).json({ success: false, message: 'Product ID and User ID are required.' });
        }
        const isFav = await getProductFavourites(userId, productId);
        if (isFav) {
            return res.status(400).json({ success: false, message: 'Product is already in favourites.' });
        }
        //add product to user's favourites
        await addProductToFavourites(userId, productId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Remove product from favourites
router.post("/favourites/remove", async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    try {
        const { productId, userId } = req.body;
        //remove product from user's favourites
        await removeProductFromFavourites(userId, productId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
