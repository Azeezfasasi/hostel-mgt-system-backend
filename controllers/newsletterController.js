const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const Newsletter = require('../models/Newsletter');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT), // Ensure port is a number
    secure: process.env.EMAIL_SECURE === 'true', // Ensure secure is a boolean
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  try {
    let subscriber = await NewsletterSubscriber.findOne({ email });
    let unsubscribeToken;
    if (subscriber && subscriber.isActive) {
      return res.status(200).json({ message: 'Already subscribed.' });
    }
    if (subscriber) {
      subscriber.isActive = true;
      subscriber.unsubscribedAt = undefined;
      subscriber.name = name || subscriber.name;
      // Generate new token if missing
      if (!subscriber.unsubscribeToken) {
        unsubscribeToken = crypto.randomBytes(24).toString('hex');
        subscriber.unsubscribeToken = unsubscribeToken;
      } else {
        unsubscribeToken = subscriber.unsubscribeToken;
      }
      await subscriber.save();
    } else {
      unsubscribeToken = crypto.randomBytes(24).toString('hex');
      subscriber = await NewsletterSubscriber.create({ email, name, unsubscribeToken });
    }
    // Send confirmation email to subscriber
    const unsubscribeUrl = `${process.env.FRONTEND_URL || 'https://mgv-tech.com'}/app/unsubscribenewsletter/${unsubscribeToken}`;
    await transporter.sendMail({
      to: email,
      from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
      subject: `Newsletter Subscription Confirmed, ${name || email}`,
      html: `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
        <!-- Header Section -->
        <div style="background:#00B9F1;padding:24px 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Welcome to Marshall Global Ventures!</h1>
        </div>

        <!-- Body Section -->
        <div style="padding:32px 24px 24px 24px;">
          <p style="font-size:1.1rem;color:#222;margin-bottom:16px;">Hi ${name || email}</p>
          <p style="font-size:1.1rem;color:#222;margin-bottom:16px;">Thank you for subscribing to our newsletter! &#127881;</p>
          <p style="color:#222;line-height:1.5;margin-bottom:24px;">You will now receive the latest updates, exclusive offers, and expert tips from our team, directly to your inbox. We're excited to have you with us!</p>
          <a href="https://mgv-tech.com" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">Visit Our Website</a>
          <p style="font-size:0.95rem;color:#555;margin-top:32px;line-height:1.5;">If you did not subscribe to this newsletter, please ignore this email. If you believe this is an error or wish to stop receiving these emails, you can <a href="https://mgv-tech.com/app/unsubscribenewsletter/${unsubscribeToken}" style="color:#00B9F1;text-decoration:underline;">unsubscribe here</a> at any time.</p>
          <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Marshall Global Ventures Team</p>
        </div>

        <!-- Footer Section -->
        <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
          <p style="margin:0 0 8px 0;">&copy; 2025 Marshall Global Ventures. All rights reserved.</p>
          <p style="margin:0 0 8px 0;">
            123 Ikorodu Road, Lagos, Nigeria
          </p>
          <p style="margin:0 0 16px 0;">
            Email: <a href="mailto:info@mgv-tech.com" style="color:#00B9F1;text-decoration:none;">info@mgv-tech.com</a> | Phone: <a href="tel:+2348103069432" style="color:#00B9F1;text-decoration:none;">(+234) 08103069432</a>
          </p>
          <div style="margin-top:10px;">
            <a href="https://linkedin.com" style="color:#00B9F1;text-decoration:none;margin:0 8px;">LinkedIn</a> |
            <a href="https://instagram.com" style="color:#00B9F1;text-decoration:none;margin:0 8px;">Instagram</a> |
            <a href="https://tiktok.com" style="color:#00B9F1;text-decoration:none;margin:0 8px;">TikTok</a> |
            <a href="https://facebook.com" style="color:#00B9F1;text-decoration:none;margin:0 8px;">Facebook</a>
          </div>
        </div>
      </div>
      `
    });
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe.', details: err.message });
  }
};

// Unsubscribe
exports.unsubscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  try {
    const subscriber = await NewsletterSubscriber.findOne({ email });
    if (!subscriber || !subscriber.isActive) {
      return res.status(404).json({ error: 'Subscriber not found or already unsubscribed.' });
    }
    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
    res.status(200).json({ message: 'Unsubscribed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsubscribe.', details: err.message });
  }
};

exports.unsubscribeByToken = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ error: 'Invalid unsubscribe link: Token is missing.' });
  }
  try {
    const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token, isActive: true });
    if (!subscriber) {
      // If subscriber not found or already inactive, still return success for security/privacy
      // but with a slightly different message.
      return res.status(200).json({ message: 'You have already unsubscribed or the link is invalid.' });
    }
    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    // Optionally clear token to prevent reuse (good practice)
    // subscriber.unsubscribeToken = undefined;
    await subscriber.save();
    res.status(200).json({ message: 'You have been successfully unsubscribed from our newsletter.' });
  } catch (err) {
    console.error('Error during unsubscribe by token:', err);
    res.status(500).json({ error: 'Failed to unsubscribe. Please try again later.' });
  }
};


// Admin: View all subscribers
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find();
    res.status(200).json(subscribers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
};

// Admin: Edit subscriber
exports.editSubscriber = async (req, res) => {
  try {
    const updated = await NewsletterSubscriber.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subscriber.' });
  }
};

// Admin: Remove subscriber
exports.removeSubscriber = async (req, res) => {
  try {
    await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Subscriber removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove subscriber.' });
  }
};

// Admin: Send newsletter
exports.removeSubscriber = async (req, res) => {
  try {
    await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Subscriber removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove subscriber.' });
  }
};

// Admin: Send newsletter
exports.sendNewsletter = async (req, res) => {
  const { subject, content, recipients } = req.body; // Removed 'email' and 'name' from destructuring here
  if (!subject || !content) return res.status(400).json({ error: 'Subject and content are required.' });

  try {
    let subscriberEmails = recipients; // Renamed to avoid confusion with single 'email' variable
    let subscribersToEmail;

    if (!subscriberEmails || !subscriberEmails.length) {
      // Fetch all active subscribers if no specific recipients are provided
      subscribersToEmail = await NewsletterSubscriber.find({ isActive: true });
      subscriberEmails = subscribersToEmail.map(s => s.email);
    } else {
      // If specific recipients are provided, fetch their full subscriber objects
      subscribersToEmail = await NewsletterSubscriber.find({ email: { $in: subscriberEmails }, isActive: true });
    }

    // --- Define the Newsletter Header HTML (remains static) ---
    const headerHtml = `
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures</h1>
      </div>
    `;

    // Record the newsletter being sent
    const newsletterRecord = await Newsletter.create({ subject, content, recipients: subscriberEmails, sentAt: new Date(), sentBy: req.user?._id, status: 'sent' });

    // Loop through each subscriber to send a personalized email
    const sendPromises = subscribersToEmail.map(async (subscriber) => {
      const personalizedName = subscriber.name || subscriber.email;
      const unsubscribeToken = subscriber.unsubscribeToken; // Get the unique token for this subscriber
      const unsubscribeUrl = `${process.env.FRONTEND_URL || 'https://mgv-tech.com'}/app/unsubscribenewsletter/${unsubscribeToken}`;

      // --- Define the Newsletter Footer HTML (personalized unsubscribe link) ---
      const footerHtml = `
        <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
          <p style="margin:0 0 8px 0;">&copy; 2025 Marshall Global Ventures. All rights reserved.</p>
          <p style="margin:0 0 8px 0;">
            123 Ikorodu Road, Lagos, Nigeria
          </p>
          <p style="margin:0 0 16px 0;">
            Email: <a href="mailto:info@mgv-tech.com" style="color:#00B9F1;text-decoration:none;">info@mgv-tech.com</a> | Phone: <a href="tel:+2348103069432" style="color:#00B9F1;text-decoration:none;">(+234) 08103069432</a>
          </p>
          <div style="margin-top:10px;">
            <a href="https://linkedin.com" style="color:#00B9F1;text-decoration:none;margin:0 8px;">LinkedIn</a> |
            <a href="https://instagram.com" style="color:#00B9F1;text-decoration:none;margin:0 8px;">Instagram</a> |
            <a href="https://tiktok.com" style="color:#00B9F1;text-decoration:none;margin:0 8px;">TikTok</a> |
            <a href="https://facebook.com" style="color:#00B9F1;text-decoration:none;margin:0 8px;">Facebook</a>
          </div>
          <p style="font-size:0.8rem;color:#999;margin-top:20px;">
            You are receiving this email because you subscribed to the Marshall Global Ventures newsletter.
            To unsubscribe, please click <a href="https://mgv-tech.com/app/unsubscribenewsletter/${unsubscribeToken}" style="color:#00B9F1;text-decoration:underline;">here</a>.
          </p>
        </div>
      `;

      // --- Construct the full HTML email template with personalization ---
      const personalizedHtmlContent = `
        <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
          ${headerHtml}
          <!-- Newsletter Main Content Area -->
          <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
            <p style="font-size:1.1rem;color:#222;margin-bottom:16px;">Hi ${personalizedName},</p>
            ${content}
          </div>
          ${footerHtml}
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
          to: subscriber.email, // Send to individual subscriber
          subject, // Subject remains the same for all
          html: personalizedHtmlContent // Use the personalized HTML
        });
        // Update lastNewsletterSentAt for this specific subscriber
        await NewsletterSubscriber.updateOne({ _id: subscriber._id }, { lastNewsletterSentAt: new Date() });
      } catch (emailErr) {
        console.error(`Failed to send newsletter to ${subscriber.email}:`, emailErr.message);
        // You might want to log this error or handle it (e.g., mark subscriber as bounced)
      }
    });

    // Wait for all emails to attempt sending
    await Promise.all(sendPromises);

    res.status(200).json({ message: 'Newsletter sent!', newsletter: newsletterRecord });
  } catch (err) {
    console.error('Error sending newsletter:', err);
    res.status(500).json({ error: 'Failed to send newsletter.', details: err.message });
  }
};

// Admin: View all sent newsletters
exports.getAllNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json(newsletters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch newsletters.' });
  }
};

// Admin: Edit sent newsletter (only if draft)
exports.editNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found.' });
    if (newsletter.status === 'sent') return res.status(400).json({ error: 'Cannot edit a sent newsletter.' });
    Object.assign(newsletter, req.body, { updatedAt: new Date() });
    await newsletter.save();
    res.status(200).json(newsletter);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update newsletter.' });
  }
};

// Admin: Create draft newsletter
exports.createDraftNewsletter = async (req, res) => {
  const { subject, content, recipients } = req.body;
  if (!subject || !content) return res.status(400).json({ error: 'Subject and content are required.' });
  try {
    const newsletter = await Newsletter.create({ subject, content, recipients, status: 'draft' });
    res.status(201).json(newsletter);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create draft newsletter.' });
  }
};

// Admin: Delete newsletter
exports.deleteNewsletter = async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Newsletter deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete newsletter.' });
  }
};
