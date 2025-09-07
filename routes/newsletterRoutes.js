const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { auth, authorizeRoles } = require('../middleware/auth');

// Public: Subscribe POST - /api/newsletter
router.post('/subscribe', newsletterController.subscribe);

// Public: Unsubscribe POST - /api/newsletter/unsubscribe
router.post('/unsubscribe', newsletterController.unsubscribe);

// Public: Unsubscribe via token GET - /api/newsletter/unsubscribe/:token
router.get('/unsubscribe/:token', newsletterController.unsubscribeByToken);

// Admin: Subscribers GET - /api/newsletter/subscribers
router.get('/subscribers', auth, authorizeRoles, newsletterController.getAllSubscribers);

// Admin: Subscriber management - PUT /api/newsletter/subscribers/:id
router.put('/subscribers/:id', auth, authorizeRoles, newsletterController.editSubscriber);

// Admin: Remove subscriber - DELETE /api/newsletter/subscribers/:id
router.delete('/subscribers/:id', auth, authorizeRoles, newsletterController.removeSubscriber);

// Admin: Newsletters - GET /api/newsletter/send
router.post('/send', auth, authorizeRoles, newsletterController.sendNewsletter);

// Admin: Get all newsletters - POST /api/newsletter/all
router.get('/all', auth, authorizeRoles, newsletterController.getAllNewsletters);

// Admin: Create draft newsletter - POST /api/newsletter/draft
router.post('/draft', auth, authorizeRoles, newsletterController.createDraftNewsletter);

// Admin: Edit newsletter - PUT /api/newsletter/:id
router.put('/:id', auth, authorizeRoles, newsletterController.editNewsletter);

// Admin: Delete newsletter - DELETE /api/newsletter/:id
router.delete('/:id', auth, authorizeRoles, newsletterController.deleteNewsletter);

module.exports = router;
