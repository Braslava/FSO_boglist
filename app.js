const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
// const blogsRouter = require("./controllers/persons");
// const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
});

const Blog = mongoose.model("Blog", blogSchema);

const mongoUrl = config.MONGODB_URI;
mongoose.connect(mongoUrl);



app.get("/api/blogs", (request, response) => {
    Blog.find({}).then((blogs) => {
        response.json(blogs);
    });
});

app.post("/api/blogs", (request, response) => {
    const blog = new Blog(request.body);

    blog.save().then((result) => {
        response.status(201).json(result);
    });
});

app.use(cors());
app.use(express.json());

module.exports = app;
