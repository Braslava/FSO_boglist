const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");

const api = supertest(app);

const initialBlogs = [
    {
        title: "First blog",
        author: "Anne Apple",
        url: "www.awesomeblog.com",
        likes: 20,
    },
    {
        title: "Second blog",
        author: "John Pear",
        url: "www.theblog.com",
        likes: 4,
    },
];

beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObject = new Blog(initialBlogs[0]);
    await blogObject.save();
    blogObject = new Blog(initialBlogs[1]);
    await blogObject.save();
});

test("blogs are returned as json", async () => {
    await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(initialBlogs.length);
});

test("a specific blog is within the returned blogs", async () => {
    const response = await api.get("/api/blogs");

    const titles = response.body.map((r) => r.title);
    expect(titles).toContain("Second blog");
});

test("a valid blog can be added", async () => {
    const newBlog = {
        title: "Added blog",
        author: "Emily Orange",
        url: "www.yayblog.com",
        likes: 14,
    };

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const titles = response.body.map((r) => r.title);

    expect(response.body).toHaveLength(initialBlogs.length + 1);
    expect(titles).toContain("Added blog");
}, 10000);

test("returned blogs contain an id property", async () => {
    const response = await api.get("/api/blogs");
    response.body.forEach((blog) => expect(blog.id).toBeDefined());
});

test("likes default to 0 if the new blog missing likes property", async () => {
    const newBlog = {
        title: "Added blog",
        author: "Emily Orange",
        url: "www.yayblog.com",
    };

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const addedBlog = response.body.find(
        (blog) => blog.title === newBlog.title
    );
    expect(addedBlog.likes).toEqual(0);
});

test("400 is returned if the new blog misses title", async () => {
    const newBlog = {
        author: "Emily Orange",
        url: "www.yayblog.com",
    };

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(400)
});

test("400 is returned if the new blog misses url", async () => {
    const newBlog = {
        title: "How to be a cat?",
        author: "Emily Orange",
    };

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(400)
});

afterAll(() => {
    mongoose.connection.close();
});
