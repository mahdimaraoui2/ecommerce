var express = require('express');
var router = express.Router();

// Import the Article model
const Article = require('../model/article');

// Get all articles
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({}).sort({ '_id': -1 });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles: ' + error.message });
    }
});

// Create a new article
router.post('/', async (req, res) => {
    const { reference, designation, prix, marque, qtestock, imageart, scategorieID } = req.body;
    const newArticle = new Article({
        reference,
        designation,
        prix,
        marque,
        qtestock,
        imageart,
        scategorieID
    });
    try {
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: 'Error creating article: ' + error.message });
    }
});

// Get a specific article by ID
router.get('/:articleId', async (req, res) => {
    try {
        const article = await Article.findById(req.params.articleId);
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching article: ' + error.message });
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
