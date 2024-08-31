// queries.js

// Function to retrieve user details by email
const getUserByEmail = (email) => {
    const userQuery = "SELECT * FROM users WHERE email = ?";
    return new Promise((resolve, reject) => {
        global.db.get(userQuery, [email], (err, user) => err ? reject(err) : resolve(user));
    });
}

// Function to retrieve user details by user_id
const getUserById = (id) => {
    const userQuery = "SELECT * FROM users WHERE user_id = ?";
    return new Promise((resolve, reject) => {
        global.db.get(userQuery, [id], (err, user) => err ? reject(err) : resolve(user));
    });
}

// Function to retrieve all courses
const getAllSchools = () => {
    const schoolsQuery = "SELECT * FROM courses";
    return new Promise((resolve, reject) => {
        global.db.all(schoolsQuery, [], (err, schools) => err ? reject(err) : resolve(schools));
    });
}

// Function to retrieve listings by user ID
const getListings = (userId) => {
    const listingsQuery = "SELECT * FROM product WHERE user_id = ? AND offer_status = 'not made'";
    return new Promise((resolve, reject) => {
        global.db.all(listingsQuery, [userId], (err, listings) => err ? reject(err) : resolve(listings));
    });
}

// Function to retrieve images for a list of products
const getImagesForProducts = (products) => {
    const listingsImages = {};
    const promises = products.map(product => {
        return new Promise((resolve, reject) => {
            global.db.all("SELECT * FROM product_images WHERE product_id = ?", [product.id], (err, images) => {
                if (err) return reject(err);
                listingsImages[product.id] = images;
                resolve();
            });
        });
    });
    return Promise.all(promises).then(() => listingsImages);
}

// Function to retrieve reviews for a user
const getReviews = (userId) => {
    const reviewsQuery = "SELECT * FROM reviews WHERE user_id = ?";
    return new Promise((resolve, reject) => {
        global.db.all(reviewsQuery, [userId], (err, reviews) => err ? reject(err) : resolve(reviews));
    });
}

// Function to retrieve reviewer details for reviews
const getReviewersForReviews = (reviews) => {
    const reviewers = {};
    const promises = reviews.map(review => {
        return new Promise((resolve, reject) => {
            const reviewerQuery = "SELECT * FROM users WHERE user_id = ?";
            global.db.get(reviewerQuery, [review.reviewer_id], (err, reviewer) => {
                if (err) return reject(err);
                reviewers[review.id] = reviewer;
                resolve();
            });
        });
    });
    return Promise.all(promises).then(() => reviewers);
}

// Function to retrieve transactions for a user
const getTransactions = (userId) => {
    const transactionsQuery = "SELECT * FROM product WHERE (user_id = ? OR offer_made_by = ?) AND offer_status != 'not made'";
    return new Promise((resolve, reject) => {
        global.db.all(transactionsQuery, [userId, userId], (err, transactions) => err ? reject(err) : resolve(transactions));
    });
}

// Function to retrieve favourite products of a user
const getFavourites = (userId) => {
    const favouritesQuery = `
        SELECT product.id, product.name, product.price, product.transaction_type
        FROM favourites
        JOIN product ON favourites.product_id = product.id
        WHERE favourites.user_id = ?
    `;
    return new Promise((resolve, reject) => {
        global.db.all(favouritesQuery, [userId], (err, favourites) => err ? reject(err) : resolve(favourites));
    });
}

// Utility function to update user attributes
const updateUserAttribute = (attribute, value, id, res) => {
    const query = `UPDATE users SET ${attribute} = ? WHERE user_id = ?`;
    new Promise((resolve, reject) => {
        global.db.run(query, [value, id], (err) => err ? reject(err) : resolve());
    })
    .then(() => res.redirect('/profile'))
    .catch(err => res.status(500).send(err.message));
};

// Function to render transaction type HTML
const renderTransactionType = (type) => {
    const colors = {
        'Sell': '#FFA500', // Orange
        'Trade': '#32CD32', // Lime Green
        'Free': '#9370DB'   // Medium Purple
    };
    
    const color = colors[type.trim()] || '#CCCCCC'; // Default color if type is not matched
    return `<div class="px-4 pt-1 pb-1.5 rounded-full text-white" style="background-color: ${color};">${type.trim()}</div>`;
};

// Function to retrieve all listings by category
const getListingsByCategory = (category) => {
    const query = "SELECT * FROM product WHERE LOWER(category) = ? AND offer_status = 'not made'";
    return new Promise((resolve, reject) => {
        global.db.all(query, [category], (err, listings) => err ? reject(err) : resolve(listings));
    });
};

// Function to retrieve a product by its ID
const getProductById = (id) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM product WHERE id = ?";
        db.get(query, [id], (err, row) => err ? reject(err) : resolve(row));
    });
};

// Function to retrieve all images for a specific product
const getProductImagesById = (productId) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM product_images WHERE product_id = ?";
        db.all(query, [productId], (err, rows) => err ? reject(err) : resolve(rows));
    });
};

// Function to insert a new product into the database
const insertProduct = (product) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO product (user_id, name, description, price, category, transaction_type, condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        db.run(query, [product.userId, product.name, product.description, product.price, product.category, product.transaction_type, product.condition, new Date().toLocaleString()], function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
};

// Function to insert a new image for a product
const insertProductImage = (productId, imageData, imageType) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO product_images (product_id, image, image_type) VALUES (?, ?, ?)";
        db.run(query, [productId, imageData, imageType], err => err ? reject(err) : resolve());
    });
};

// Function to update a product with new information
const updateProduct = (id, updates) => {
    return new Promise((resolve, reject) => {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        const query = `UPDATE product SET ${fields} WHERE id = ?`;
        db.run(query, values, err => err ? reject(err) : resolve());
    });
};

// Function to delete a product from the database
const deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM product WHERE id = ?";
        db.run(query, [id], err => err ? reject(err) : resolve());
    });
};

// Function to update the offer status of a product
const updateOfferStatus = (productId, status) => {
    return new Promise((resolve, reject) => {
        const query = "UPDATE product SET offer_status = ? WHERE id = ?";
        db.run(query, [status, productId], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Function to insert a new review into the database
const insertReview = (userId, reviewerId, review, createdAt, rating) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO reviews (user_id, reviewer_id, content, created_at, stars_given) VALUES (?, ?, ?, ?, ?)";
        db.run(query, [userId, reviewerId, review, createdAt, rating], err => err ? reject(err) : resolve());
    });
};

// Function to retrieve all reviews for a specific user
const getReviewsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM reviews WHERE user_id = ?";
        db.all(query, [userId], (err, rows) => err ? reject(err) : resolve(rows));
    });
};

// Function to update the rating of a user
const updateUserRating = (userId, rating) => {
    return new Promise((resolve, reject) => {
        const query = "UPDATE users SET rating = ? WHERE user_id = ?";
        db.run(query, [rating, userId], err => err ? reject(err) : resolve());
    });
};

// Function to retrieve whether a user has favorited a specific product
const getProductFavourites = (userId, productId) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM favourites WHERE user_id = ? AND product_id = ?";
        db.get(query, [userId, productId], (err, row) => err ? reject(err) : resolve(row));
    });
};

// Function to add a product to a user's favourites
const addProductToFavourites = (userId, productId) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO favourites (user_id, product_id) VALUES (?, ?)";
        db.run(query, [userId, productId], err => err ? reject(err) : resolve());
    });
};

// Function to remove a product from a user's favourites
const removeProductFromFavourites = (userId, productId) => {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM favourites WHERE user_id = ? AND product_id = ?";
        db.run(query, [userId, productId], err => err ? reject(err) : resolve());
    });
};

module.exports = {
    getUserByEmail,
    getUserById,
    getAllSchools,
    getListings,
    getImagesForProducts,
    getReviews,
    getReviewersForReviews,
    getTransactions,
    getFavourites,
    updateUserAttribute,
    renderTransactionType,
    getListingsByCategory,
    getProductById,
    getProductImagesById,
    insertProduct,
    insertProductImage,
    updateProduct,
    deleteProduct,
    updateOfferStatus,
    insertReview,
    getReviewsByUserId,
    updateUserRating,
    getProductFavourites,
    addProductToFavourites,
    removeProductFromFavourites
};
