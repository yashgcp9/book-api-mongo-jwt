const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// Public: list + get
router.get('/', async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const filter = q ? { $or: [{ title: new RegExp(q, 'i') }, { author: new RegExp(q, 'i') }] } : {};
  const items = await Book.find(filter).sort({ createdAt: -1 });
  res.json({ count: items.length, items });
});

router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// Protected: create/update/delete
router.post('/',
  auth(true),
  body('title').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, author, year, tags } = req.body || {};
    const book = await Book.create({ title, author, year, tags, owner: req.user.sub });
    res.status(201).json(book);
  }
);

router.put('/:id',
  auth(true),
  body('title').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, author, year, tags } = req.body || {};
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.owner && book.owner.toString() !== req.user.sub) return res.status(403).json({ error: 'Forbidden' });

    book.title = title;
    book.author = author;
    book.year = year;
    book.tags = Array.isArray(tags) ? tags : [];
    await book.save();
    res.json(book);
  }
);

router.patch('/:id',
  auth(true),
  async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.owner && book.owner.toString() !== req.user.sub) return res.status(403).json({ error: 'Forbidden' });

    const patch = req.body || {};
    Object.assign(book, patch);
    await book.save();
    res.json(book);
  }
);

router.delete('/:id',
  auth(true),
  async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.owner && book.owner.toString() !== req.user.sub) return res.status(403).json({ error: 'Forbidden' });

    await book.deleteOne();
    res.status(204).send();
  }
);

module.exports = router;
