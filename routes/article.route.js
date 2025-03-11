var express = require('express');
var router = express.Router();

// Import the Article model
const Article = require('../model/article');
const { verifyToken } = require('../middleware/verify-token');
const { uploadFile } = require('../middleware/uploadfile');
const { authorizeRoles } = require("../middleware/authorizeRoles");

// Get all articles (protected route)
router.get('/', verifyToken, authorizeRoles("user", "admin", "visiteur"), async (req, res) => {
    try {
        const articles = await Article.find({}).sort({ '_id': -1 });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles: ' + error.message });
    }
});

// Create a new article with image upload, using multiple middlewares
router.post('/', verifyToken, uploadFile.single("imageart"), async (req, res) => {
    const { reference, designation, prix, marque, qtestock, scategorieID } = req.body;
    const imageart = req.file.filename; // Get the filename from the uploaded file

    const nouvarticle = new Article({
        reference: reference,
        designation: designation,
        prix: prix,
        marque: marque,
        qtestock: qtestock,
        scategorieID: scategorieID,
        imageart: imageart // Store the image filename in the article
    });

    try {
        await nouvarticle.save();
        res.status(200).json(nouvarticle);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Get a specific article by ID
router.get('/:articleId', async (req, res) => {
    try {
        const art = await Article.findById(req.params.articleId);
        if (!art) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json(art);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Update an article by ID
router.put('/:articleId', async (req, res) => {
    try {
        const updatedArticle = await Article.findByIdAndUpdate(req.params.articleId, req.body, { new: true });
        if (!updatedArticle) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: 'Error updating article: ' + error.message });
    }
});

// Delete an article by ID
router.delete('/:articleId', async (req, res) => {
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.articleId);
        if (!deletedArticle) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting article: ' + error.message });
    }
});

module.exports = router;
