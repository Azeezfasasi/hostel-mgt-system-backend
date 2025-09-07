const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { auth, authorizeRoles } = require('../middleware/auth');

// POST /api/quote (Public route for submitting a new quote)
router.post('/quote', quoteController.sendQuoteRequest);

// GET /api/quotes (Admin-only route to get all quotes)
router.get('/quotes', auth, authorizeRoles, quoteController.getAllQuoteRequests);

// GET /api/quotes/assigned (Admin-only route to get quotes assigned to current admin)
router.get('/quotes/assigned', auth, authorizeRoles, quoteController.getAssignedQuotes);

// DELETE /api/quotes/:id (Admin-only route to delete a quote)
router.delete('/quotes/:id', auth, authorizeRoles, quoteController.deleteQuoteRequest);

// PUT /api/quote/:id (Admin-only route to update a quote)
router.put('/quotes/:id', auth, authorizeRoles, quoteController.updateQuoteRequest);

// POST /api/quotes/:id/reply/admin (Admin-only route for admin replying to a quote request)
router.post('/quotes/:id/reply/admin', auth, authorizeRoles, quoteController.adminReplyToQuoteRequest);

// Customer-facing routes
// GET /customer/quotes/:id (Customer-specific route to get a single quote)
router.get('/customer/quotes/:id', auth, quoteController.getSingleQuoteRequest);

// POST /customer/quotes/:id/reply (Customer-specific route for customer replying to their quote)
router.post('/customer/quotes/:id/reply', auth, quoteController.customerReplyToQuote);

router.get('/customer/my-quotes', auth, quoteController.getCustomerQuotes);

// PUT /api/quotes/:id/assign (Admin/Super Admin route to assign a quote)
router.put('/quotes/:id/assign', auth, authorizeRoles, quoteController.assignQuoteToAdmin);

module.exports = router;

