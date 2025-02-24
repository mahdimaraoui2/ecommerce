var express = require('express');
var router = express.Router();

// Créer une instance de categorie.
const Categorie = require('../model/categorie');

// afficher la liste des categories.
router.get('/', async (req, res) => {
    try {
        const categories = await Categorie.find({}, null, { sort: { '_id': -1 } });
        res.status(200).json(categories);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// créer une nouvelle catégorie
router.post('/', async (req, res) => {
    const { nomcategorie, imagecategorie } = req.body;
    const newCategorie = new Categorie({
        nomcategorie: nomcategorie,
        imagecategorie: imagecategorie
    });
    try {
        await newCategorie.save();
        res.status(200).json(newCategorie);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// chercher une catégorie
router.get('/:categorieId', async (req, res) => {
    try {
        const categorie = await Categorie.findById(req.params.categorieId);
        if (!categorie) return res.status(404).json({ message: 'Categorie not found' });
        res.status(200).json(categorie);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// modifier une catégorie
router.put('/:categorieId', async (req, res) => {
    try {
        const updatedCategorie = await Categorie.findByIdAndUpdate(req.params.categorieId, req.body, { new: true });
        if (!updatedCategorie) return res.status(404).json({ message: 'Categorie not found' });
        res.status(200).json(updatedCategorie);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Supprimer une catégorie
router.delete('/:categorieId', async (req, res) => {
    try {
        const deletedCategorie = await Categorie.findByIdAndDelete(req.params.categorieId);
        if (!deletedCategorie) return res.status(404).json({ message: 'Categorie not found' });
        res.status(200).json({ message: 'Categorie deleted successfully' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
