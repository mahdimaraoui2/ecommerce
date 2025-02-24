const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const categorieRouter = require("./routes/categorie.route");
const scategorieRouter = require('./routes/scategorie.route');
const articleRouter = require('./routes/article.route'); 
const chatbotRouter=require("./routes/chatbot.route")
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.dbcloud)
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/categories', categorieRouter);
app.use("/api/chat",chatbotRouter);
app.use('/api/scategories', scategorieRouter);
app.use('/api/articles', articleRouter); 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
