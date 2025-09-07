const Blog = require('../models/Blog');
const path = require('path');

// Create a new blog post
exports.createBlog = async (req, res) => {
  try {
    const { title, content, categories, status } = req.body;
    let image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const blog = await Blog.create({
      title,
      content,
      author: req.user.id,
      categories,
      image,
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : undefined,
    });
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog', details: err.message });
  }
};

// Get all blogs (optionally filter by status/category)
exports.getBlogs = async (req, res) => {
  try {
    const { status, category } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (category) filter.categories = category;
    const blogs = await Blog.find(filter).populate('author', 'name email').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs', details: err.message });
  }
};

// Get a single blog post by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog', details: err.message });
  }
};

// Edit a blog post
exports.editBlog = async (req, res) => {
  try {
    const { title, content, categories, status } = req.body;
    let update = { title, content, categories, status };
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }
    if (status === 'published') {
      update.publishedAt = new Date();
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit blog', details: err.message });
  }
};

// Delete a blog post
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog', details: err.message });
  }
};

// Change blog status (draft/publish)
exports.changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'published') {
      update.publishedAt = new Date();
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to change status', details: err.message });
  }
};

// Get all unique categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('categories');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
};
