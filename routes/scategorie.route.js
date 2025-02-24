var express = require('express');
var router = express.Router();

// Import the Scategorie model
const Scategorie = require('../model/sousCategories');

// Get all subcategories
router.get('/', async (req, res) => {
    try {
        const scategories = await Scategorie.find({}, null, { sort: { '_id': -1 } });
        res.status(200).json(scategories);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Create a new subcategory
router.post('/', async (req, res) => {
    const { nomscategorie, imagescat, categorieID } = req.body;
    const newScategorie = new Scategorie({
        nomscategorie,
        imagescat,
        categorieID
    });
    try {
        await newScategorie.save();
        res.status(201).json(newScategorie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a specific subcategory by ID
router.get('/:scategorieId', async (req, res) => {
    try {
        const scategorie = await Scategorie.findById(req.params.scategorieId);
        if (!scategorie) return res.status(404).json({ message: 'Subcategory not found' });
        res.status(200).json(scategorie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a subcategory by ID
router.put('/:scategorieId', async (req, res) => {
    try {
        const updatedScategorie = await Scategorie.findByIdAndUpdate(req.params.scategorieId, req.body, { new: true });
        if (!updatedScategorie) return res.status(404).json({ message: 'Subcategory not found' });
        res.status(200).json(updatedScategorie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a subcategory by ID
router.delete('/:scategorieId', async (req, res) => {
    try {
        const deletedScategorie = await Scategorie.findByIdAndDelete(req.params.scategorieId);
        if (!deletedScategorie) return res.status(404).json({ message: 'Subcategory not found' });
        res.status(200).json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
