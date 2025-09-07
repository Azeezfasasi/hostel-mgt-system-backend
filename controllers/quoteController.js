const QuoteRequest = require('../models/QuoteRequest');
const User = require('../models/User');
const nodemailer = require('nodemailer'); // Re-added nodemailer import
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

// Helper to get admin emails from .env (comma-separated)
function getAdminEmails() {
  const emails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
  return emails.split(',').map(e => e.trim()).filter(Boolean);
}

exports.sendQuoteRequest = async (req, res) => {
  const { name, email, phone, service, message } = req.body;
  if (!name || !email || !phone || !service || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Save to MongoDB
    const quote = new QuoteRequest({ name, email, phone, service, message });
    await quote.save();

    // Send email to admins
    const adminEmails = getAdminEmails();
    await transporter.sendMail({
      from: `"${quote.name}" <${quote.email}>`,
      to: adminEmails[0] || process.env.RECEIVER_EMAIL,
      cc: adminEmails.length > 1 ? adminEmails.slice(1) : undefined,
      subject: `Quote Request from ${quote.name} on Marshall Global Ventures`,
      html: `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">

        // Header section
        <div style="background:#00B9F1;padding:24px 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures!</h1>
        </div>

        <!-- Body Section -->
        <div style="padding:32px 24px 24px 24px;">
          <p><strong>Hello Admin,</strong></p>
          <p>A new quote request has just been submitted through the Marshall Global Ventures website. Please review the details below:</p>
          <p><strong>Service Requested:</strong> ${quote.service}</p>
          <p><strong>Message:</strong> ${quote.message}</p>
          <p><strong>From:</strong> ${quote.name} (${quote.email}) (${quote.phone})</p>
          <br />
          <p>Please <a href="https://mgv-tech.com/login">log in</a> to your admin dashboard to follow up or assign this request to a team member.</p>
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

    // Send confirmation email to customer
    await transporter.sendMail({
      to: quote.email,
      from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`, 
      subject: `We Received Your Quote Request on Marshall Global Ventures | ${quote.service}`,
      html: `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">

        // Header section
        <div style="background:#00B9F1;padding:24px 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures!</h1>
        </div>

        <!-- Body Section -->
        <div style="padding:32px 24px 24px 24px;">
          <h2>Thank you for submitting a quote request through the IT Marshall Global Ventures website!</h2>
          <p>Dear ${quote.name},</p>
          <p>We have received your request for <strong>${quote.service}</strong> and we are currently reviewing the details of your request to ensure we provide the most accurate and tailored response.</p>
          <p>One of our IT experts will contact you shortly to discuss your requirements and the best solutions available. We appreciate your interest and trust in Marshall Global Ventures.</p>
          <p>If you have any additional information you would like to share in the meantime, please feel free to reply to this email.</p>
          <p><strong>Your message:</strong> ${quote.message}</p>
          <p>Kind regards,
          <br/>
          <strong>Marshall Global Ventures Team</strong>,</p>
          <br/><br/>
          <p><em>If you did not request a quote, please ignore this email.</em></p>
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

    res.status(200).json({ message: 'Quote request sent and saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request.', details: err.message });
  }
};

// Get all quote requests
exports.getAllQuoteRequests = async (req, res) => {
  console.log('getAllQuoteRequests called');
  try {
    const quotes = await QuoteRequest.find()
      .populate('replies.senderId', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    console.log('Quotes found:', quotes.length);
    res.status(200).json(quotes);
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ error: 'Failed to fetch quote requests.' });
  }
};

exports.getSingleQuoteRequest = async (req, res) => {
  try {
    const quote = await QuoteRequest.findById(req.params.id)
      .populate('replies.senderId', 'name')
      .populate('assignedTo', 'name email')
      .exec();

    if (!quote) {
      return res.status(404).json({ error: 'Quote request not found.' });
    }

    if (req.user && req.user.role === 'customer' && req.user.email !== quote.email) {
      return res.status(403).json({ error: 'Unauthorized access to this quote.' });
    }
    res.status(200).json(quote);
  } catch (err) {
    console.error('Error fetching single quote:', err);
    res.status(500).json({ error: 'Failed to fetch quote request.' });
  }
};

exports.assignQuoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToUserId } = req.body;

    if (!assignedToUserId) {
      return res.status(400).json({ error: 'Assigned user ID is required.' });
    }

    const quote = await QuoteRequest.findById(id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote request not found.' });
    }

    const assignee = await User.findById(assignedToUserId);
    if (!assignee || (assignee.role !== 'admin' && assignee.role !== 'super admin')) {
      return res.status(400).json({ error: 'Invalid user for assignment. Must be an admin or super admin.' });
    }

    if (quote.assignedTo && quote.assignedTo.toString() === assignedToUserId) {
      const populatedQuote = await QuoteRequest.findById(quote._id)
        .populate('replies.senderId', 'name')
        .populate('assignedTo', 'name email')
        .exec();
      return res.status(200).json({ message: 'Quote already assigned to this admin.', updatedQuote: populatedQuote });
    }

    quote.assignedTo = assignedToUserId;
    quote.assignedAt = new Date();

    const updatedQuote = await quote.save();

    const populatedQuote = await QuoteRequest.findById(updatedQuote._id)
      .populate('replies.senderId', 'name')
      .populate('assignedTo', 'name email')
      .exec();
    
    // --- Reusable Header HTML ---
    const emailHeaderHtml = `
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures</h1>
      </div>
    `;

    // --- Reusable Footer HTML ---
    const emailFooterHtml = `
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
    `;

    // --- Admin Notification Email Template (for the assigned admin) ---
    const adminNotificationHtml = `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
        ${emailHeaderHtml}
        <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
          <p style="font-size:1.1rem;margin-bottom:16px;">Dear ${populatedQuote.assignedTo.name || populatedQuote.assignedTo.email},</p>
          <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">New Quote Request Assigned to You!</h2>
          <p style="font-size:1.1rem;margin-bottom:16px;">
            A new quote request has been assigned to your attention for review and action. Kindly see below the details of the quote.
          </p>
          <h3 style="font-size:1.3rem;color:#333;margin-top:24px;margin-bottom:12px;">Quote Details:</h3>
          <ul style="list-style:none;padding:0;margin:0;">
            <li style="margin-bottom:8px;"><strong>Service:</strong> ${populatedQuote.service}</li>
            <li style="margin-bottom:8px;"><strong>Customer Name:</strong> ${populatedQuote.name}</li>
            <li style="margin-bottom:8px;"><strong>Customer Email:</strong> ${populatedQuote.email}</li>
            <li style="margin-bottom:8px;"><strong>Message:</strong> <span style="font-style:italic;">"${populatedQuote.message}"</span></li>
            <li style="margin-bottom:8px;"><strong>Current Status:</strong> ${populatedQuote.status}</li>
          </ul>
          <p style="margin-top:24px;margin-bottom:24px;">
            Please log in to the admin dashboard to view the full details and respond to the customer promptly.
          </p>
          <a href="${process.env.FRONTEND_URL || 'https://mgv-tech.com'}/app/quote" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">View Quote in Admin Dashboard</a>
          <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Marshall Global Ventures Team</p>
        </div>
        ${emailFooterHtml}
      </div>
    `;

    // --- Customer Notification Email Template ---
    const customerNotificationHtml = `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
        ${emailHeaderHtml}
        <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
          <p style="font-size:1.1rem;margin-bottom:16px;">Hi ${populatedQuote.name || populatedQuote.email},</p>
          <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Your Quote Request is Being Processed!</h2>
          <p style="font-size:1.1rem;margin-bottom:16px;">
            Thank you for your quote request for <strong>${populatedQuote.service}</strong>. We are pleased to inform you that your request has been successfully assigned to one of our expert team members for review.
          </p>
          <p style="color:#222;line-height:1.5;margin-bottom:24px;">
            Our team is now reviewing your requirements and will get back to you shortly with a personalized response or further questions.
          </p>
          <h3 style="font-size:1.3rem;color:#333;margin-top:24px;margin-bottom:12px;">Your Request Summary:</h3>
          <ul style="list-style:none;padding:0;margin:0;">
            <li style="margin-bottom:8px;"><strong>Service Requested:</strong> ${populatedQuote.service}</li>
            <li style="margin-bottom:8px;"><strong>Your Message:</strong> <span style="font-style:italic;">"${populatedQuote.message}"</span></li>
            <li style="margin-bottom:8px;"><strong>Current Status:</strong> ${populatedQuote.status}</li>
            <li style="margin-bottom:8px;"><strong>Assigned To:</strong> Our specialist team</li>
          </ul>
          <p style="margin-top:24px;margin-bottom:24px;">
            You can expect to hear from us soon. We appreciate your patience!
          </p>
          <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Marshall Global Ventures Team</p>
        </div>
        ${emailFooterHtml}
      </div>
    `;

    try {
      // Email to the assigned admin
      await transporter.sendMail({
        to: populatedQuote.assignedTo.email,
        from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
        subject: `New Quote Request Assigned to You: ${populatedQuote.service}`,
        html: adminNotificationHtml,
      });

      // Email to the customer
      await transporter.sendMail({
        to: populatedQuote.email, // Customer's email
        from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
        subject: `Your Quote Request is Being Processed | ${populatedQuote.service}`,
        html: customerNotificationHtml,
      });
      console.log(`Quote assignment notification email sent to customer: ${populatedQuote.email}`);
    } catch (emailError) {
      console.error('Error sending assignment notification email:', emailError);
    }

    res.status(200).json({ message: 'Quote assigned successfully!', updatedQuote: populatedQuote });
  } catch (err) {
    console.error('Error assigning quote:', err);
    res.status(500).json({ error: 'Failed to assign quote.' });
  }
};

exports.getCustomerQuotes = async (req, res) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ error: 'Unauthorized: Customer email not available.' });
  }

  try {
    const customerEmail = req.user.email;
    const quotes = await QuoteRequest.find({ email: customerEmail })
      .populate('replies.senderId', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(quotes);
  } catch (err) {
    console.error('Error fetching customer quotes:', err);
    res.status(500).json({ error: 'Failed to fetch customer quote requests.' });
  }
};

exports.getAssignedQuotes = async (req, res) => {
  // Ensure the user is authenticated and is an admin or super admin
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super admin')) {
    return res.status(403).json({ error: 'Unauthorized: Only admins can view assigned quotes.' });
  }

  try {
    const adminId = req.user.id; // Get the ID of the authenticated admin user
    console.log(`Fetching quotes assigned to admin ID: ${adminId}`);

    const quotes = await QuoteRequest.find({ assignedTo: adminId })
      .populate('replies.senderId', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    console.log(`Found ${quotes.length} quotes assigned to ${adminId}`);
    res.status(200).json(quotes);
  } catch (err) {
    console.error('Error fetching assigned quotes:', err);
    res.status(500).json({ error: 'Failed to fetch assigned quote requests.', details: err.message });
  }
};

exports.deleteQuoteRequest = async (req, res) => {
  try {
    await QuoteRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Quote request deleted.' });
  } catch (err) {
    console.error('Error deleting quotes:', err);
    res.status(500).json({ error: 'Failed to delete quote request.' });
  }
};

exports.updateQuoteRequest = async (req, res) => {
  try {
    const updated = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!updated) {
      return res.status(404).json({ error: 'Quote request not found.' });
    }

    // --- Reusable Header HTML ---
    const emailHeaderHtml = `
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures</h1>
      </div>
    `;

    // --- Reusable Footer HTML ---
    const emailFooterHtml = `
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
    `;

    if (updated && updated.email) {
      // Determine what was updated to include in the email
      const updatedFields = Object.keys(req.body)
        .filter(key => key !== 'status' && key !== '_id' && key !== '__v' && key !== 'updatedAt' && key !== 'createdAt') 
        .map(key => `<li style="margin-bottom:8px;"><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${req.body[key]}</li>`)
        .join('');

      const customerQuoteUpdateHtml = `
        <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
          ${emailHeaderHtml}
          <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
            <p style="font-size:1.1rem;margin-bottom:16px;">Hi ${updated.name || updated.email},</p>
            <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Update Regarding Your Quote Request!</h2>
            <p style="font-size:1.1rem;margin-bottom:16px;">
              Your quote request for <strong>${updated.service}</strong> (Quote ID: ${updated._id}) has been updated by our team.
            </p>
            <p style="color:#222;line-height:1.5;margin-bottom:24px;">
              Here are the updated details:
            </p>

            <h3 style="font-size:1.3rem;color:#333;margin-top:24px;margin-bottom:12px;">Quote Summary:</h3>
            <ul style="list-style:none;padding:0;margin:0;">
              <li style="margin-bottom:8px;"><strong>Service:</strong> ${updated.service}</li>
              <li style="margin-bottom:8px;"><strong>Current Status:</strong> <span style="font-weight:bold;color:#00B9F1;">${updated.status}</span></li>
              ${updatedFields.length > 0 ? `<li style="margin-top:16px;"><strong>Other Updates:</strong></li>${updatedFields}` : ''}
            </ul>

            <p style="margin-top:24px;margin-bottom:24px;">
              You can view the full details of your updated quote request by logging into your account on our website.
            </p>
            <a href="${process.env.FRONTEND_URL || 'https://mgv-tech.com'}/app/quoteslist/${updated._id}" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">View Your Quote</a>

            <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Marshall Global Ventures Team</p>
          </div>
          ${emailFooterHtml}
        </div>
      `;

      await transporter.sendMail({
        to: updated.email,
        from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
        subject: `Your Quote Request Update - ${updated.service} | Marshall Global Ventures`,
        html: customerQuoteUpdateHtml
      });
      console.log(`Quote update notification email sent to customer ${updated.email}.`);
    }
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating quotes:', err);
    res.status(500).json({ error: 'Failed to update quote request.', details: err.message });
  }
};

exports.adminReplyToQuoteRequest = async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage) {
    return res.status(400).json({ error: 'Reply message is required.' });
  }

  try {
    const quote = await QuoteRequest.findById(id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote request not found.' });
    }

    // Ensure the user making the reply is authenticated and is an admin
    // This check is good for security, assuming req.user contains the authenticated user's details.
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super admin')) {
        return res.status(403).json({ error: 'Unauthorized: Only admins can reply to quote requests.' });
    }

    const adminEmail = req.user.email;
    const adminId = req.user.id;
    const adminName = req.user.name || req.user.email; // Get admin's name for email

    const newReply = {
      senderId: adminId,
      senderEmail: adminEmail,
      senderType: 'admin',
      message: replyMessage,
      repliedAt: new Date()
    };
    quote.replies.push(newReply);
    await quote.save();

    const updatedAndPopulatedQuote = await QuoteRequest.findById(id)
      .populate('replies.senderId', 'name')
      .populate('assignedTo', 'name email') // Ensure assignedTo is populated for admin email
      .exec();

    // --- Reusable Header HTML ---
    const emailHeaderHtml = `
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures</h1>
      </div>
    `;

    // --- Reusable Footer HTML ---
    const emailFooterHtml = `
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
    `;

    // --- Customer Email Template ---
    const customerEmailHtml = `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
        ${emailHeaderHtml}
        <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
          <p style="font-size:1.1rem;margin-bottom:16px;">Dear ${updatedAndPopulatedQuote.name || updatedAndPopulatedQuote.email},</p>
          <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Reply to your Quote Request for ${updatedAndPopulatedQuote.service}</h2>
          <p style="font-size:1.1rem;margin-bottom:16px;">
            Thank you for your interest in Marshall Global Ventures. We are replying to your quote request with the following message:
          </p>
          <div style="background-color: #f0f4f8; padding: 15px; border-radius: 8px; margin-top: 20px; margin-bottom: 20px;">
            <p style="white-space: pre-line; margin: 0;">${replyMessage}</p>
          </div>
          <p style="margin-top:24px;margin-bottom:24px;">
            If you have any further questions or require additional information, please do not hesitate to respond to this email.
          </p>
          <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Kind regards,<br/>The Marshall Global Ventures Team</p>
        </div>
        ${emailFooterHtml}
      </div>
    `;

    // --- Admin Reply Confirmation Email Template (NEW) ---
    let adminReplyConfirmationHtml = '';
    if (updatedAndPopulatedQuote.assignedTo && updatedAndPopulatedQuote.assignedTo.email) {
      adminReplyConfirmationHtml = `
        <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
          ${emailHeaderHtml}
          <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
            <p style="font-size:1.1rem;margin-bottom:16px;">Hi ${adminName},</p>
            <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Reply Sent Confirmation</h2>
            <p style="font-size:1.1rem;margin-bottom:16px;">
              Your reply to the quote request for <strong>${updatedAndPopulatedQuote.service}</strong> from <strong>${updatedAndPopulatedQuote.name || updatedAndPopulatedQuote.email}</strong> has been successfully sent to the customer.
            </p>
            <h3 style="font-size:1.3rem;color:#333;margin-top:24px;margin-bottom:12px;">Your Reply:</h3>
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px; margin-bottom: 20px; border-left: 4px solid #4CAF50;">
              <p style="white-space: pre-line; margin: 0;">${replyMessage}</p>
            </div>
            <p style="margin-top:24px;margin-bottom:24px;">
              You can review the full quote history and status in the admin dashboard.
            </p>
            <a href="${process.env.FRONTEND_URL || 'https://mgv-tech.com'}/app/quote" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">View Quote in Admin Dashboard</a>
            <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Thank you,<br/>The Marshall Global Ventures Team</p>
          </div>
          ${emailFooterHtml}
        </div>
      `;
    }

    // Send email to customer
    await transporter.sendMail({
      to: updatedAndPopulatedQuote.email,
      from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
      subject: `Reply to your Quote Request for ${updatedAndPopulatedQuote.service} from Marshall Global Ventures`,
      html: customerEmailHtml
    });
    console.log(`Reply email sent to customer ${updatedAndPopulatedQuote.email}.`);

    // Send confirmation email to the assigned admin
    if (updatedAndPopulatedQuote.assignedTo && updatedAndPopulatedQuote.assignedTo.email) {
      await transporter.sendMail({
        to: updatedAndPopulatedQuote.assignedTo.email,
        from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
        subject: `Confirmation: Your Reply to Quote ${updatedAndPopulatedQuote.service} Sent`,
        html: adminReplyConfirmationHtml,
      });
      console.log(`Reply confirmation email sent to assigned admin ${updatedAndPopulatedQuote.assignedTo.email}.`);
    } else {
      console.warn('Cannot send reply confirmation to assigned admin: assignedTo user or email not found.');
    }
    res.status(200).json({
      message: 'Reply sent and saved successfully!',
      updatedQuote: updatedAndPopulatedQuote
    });
  } catch (err) {
    console.error('Error replying to quote (admin):', err);
    res.status(500).json({ error: 'Failed to send reply.', details: err.message });
  }
};

exports.customerReplyToQuote = async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage) {
    return res.status(400).json({ error: 'Reply message is required.' });
  }

  try {
    const quote = await QuoteRequest.findById(id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote request not found.' });
    }

    // Authentication check: Ensure the user is logged in and owns the quote
    if (!req.user || req.user.email !== quote.email) {
      return res.status(403).json({ error: 'Unauthorized: You can only reply to your own quotes.' });
    }

    const customerEmail = req.user.email;
    const customerId = req.user.id;
    const customerName = req.user.name || req.user.email; // Get customer's name for email

    const newReply = {
      senderId: customerId,
      senderEmail: customerEmail,
      senderType: 'customer',
      message: replyMessage,
      repliedAt: new Date()
    };
    quote.replies.push(newReply);
    await quote.save();

    const updatedAndPopulatedQuote = await QuoteRequest.findById(id)
      .populate('replies.senderId', 'name')
      .populate('assignedTo', 'name email')
      .exec();

    // --- Reusable Header HTML ---
    const emailHeaderHtml = `
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures</h1>
      </div>
    `;

    // --- Reusable Footer HTML ---
    const emailFooterHtml = `
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
    `;

    // --- Admin Notification Email Template (Updated & Professional) ---
    const adminNotificationHtml = `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
        ${emailHeaderHtml}
        <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
          <p style="font-size:1.1rem;margin-bottom:16px;">Dear Marshall Global Ventures Team,</p>
          <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">New Customer Reply to Quote Request!</h2>
          <p style="font-size:1.1rem;margin-bottom:16px;">
            A customer has sent a new reply to their quote request.
          </p>
          <h3 style="font-size:1.3rem;color:#333;margin-top:24px;margin-bottom:12px;">Quote & Customer Details:</h3>
          <ul style="list-style:none;padding:0;margin:0;">
            <li style="margin-bottom:8px;"><strong>Quote ID:</strong> ${updatedAndPopulatedQuote._id}</li>
            <li style="margin-bottom:8px;"><strong>Service:</strong> ${updatedAndPopulatedQuote.service}</li>
            <li style="margin-bottom:8px;"><strong>Customer Name:</strong> ${updatedAndPopulatedQuote.name || updatedAndPopulatedQuote.email}</li>
            <li style="margin-bottom:8px;"><strong>Customer Email:</strong> ${updatedAndPopulatedQuote.email}</li>
            ${updatedAndPopulatedQuote.assignedTo ? `<li style="margin-bottom:8px;"><strong>Assigned To:</strong> ${updatedAndPopulatedQuote.assignedTo.name || updatedAndPopulatedQuote.assignedTo.email}</li>` : ''}
            <li style="margin-bottom:8px;"><strong>Current Status:</strong> ${updatedAndPopulatedQuote.status}</li>
          </ul>

          <h3 style="font-size:1.3rem;color:#333;margin-top:24px;margin-bottom:12px;">Customer's Message:</h3>
          <div style="background-color: #f0f4f8; padding: 15px; border-radius: 8px; margin-top: 10px; margin-bottom: 20px; border-left: 4px solid #00B9F1;">
            <p style="white-space: pre-line; margin: 0; color:#333;">${replyMessage}</p>
          </div>

          <p style="margin-top:24px;margin-bottom:24px;">
            Please log in to your admin dashboard to view the full conversation and respond to the customer.
          </p>
          <a href="${process.env.FRONTEND_URL || 'https://mgv-tech.com'}/app/quote" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">View Quote in Admin Dashboard</a>
          <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Marshall Global Ventures System</p>
        </div>
        ${emailFooterHtml}
      </div>
    `;

    // --- Customer Confirmation Email Template (Updated & Professional) ---
    const customerConfirmationHtml = `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
        ${emailHeaderHtml}
        <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
          <p style="font-size:1.1rem;margin-bottom:16px;">Dear ${customerName},</p>
          <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Your Reply to Quote Request Has Been Sent!</h2>
          <p style="font-size:1.1rem;margin-bottom:16px;">
            We have successfully received your reply to your quote request for <strong>${updatedAndPopulatedQuote.service}</strong>.
          </p>
          <p style="color:#222;line-height:1.5;margin-bottom:24px;">
            Your message was:
          </p>
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 10px; margin-bottom: 20px; border-left: 4px solid #4CAF50;">
            <p style="white-space: pre-line; margin: 0; color:#333;">${replyMessage}</p>
          </div>
          <p style="margin-top:24px;margin-bottom:24px;">
            Our team will review your message and get back to you shortly. Thank you for your patience!
          </p>
          <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Kind regards,<br/>The Marshall Global Ventures Team</p>
        </div>
        ${emailFooterHtml}
      </div>
    `;

    // Send email notification to admins about the customer's reply
    const adminEmails = await getAdminEmails(); // Ensure getAdminEmails is awaited
    if (adminEmails.length > 0) {
      await transporter.sendMail({
        to: adminEmails[0],
        cc: adminEmails.length > 1 ? adminEmails.slice(1) : undefined,
        from: `"${updatedAndPopulatedQuote.name || updatedAndPopulatedQuote.email}" <${updatedAndPopulatedQuote.email}>`, // Use customer's name/email as 'from' for easier replies
        subject: `Customer Reply to Quote Request #${updatedAndPopulatedQuote._id} from ${updatedAndPopulatedQuote.name || updatedAndPopulatedQuote.email}`,
        html: adminNotificationHtml
      });
      console.log(`Customer reply notification email sent to admins: ${adminEmails.join(', ')}`);
    } else {
      console.warn('No admin emails found to send customer reply notification.');
    }


    // Send confirmation to the customer that their reply was received
    await transporter.sendMail({
      to: customerEmail,
      from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
      subject: `Your Reply to Quote Request for ${updatedAndPopulatedQuote.service} Has Been Sent`,
      html: customerConfirmationHtml
    });
    console.log(`Customer reply confirmation email sent to ${customerEmail}.`);
    
    res.status(200).json({
      message: 'Reply sent and saved successfully!',
      updatedQuote: updatedAndPopulatedQuote
    });
  } catch (err) {
    console.error('Error replying to quote (customer):', err);
    res.status(500).json({ error: 'Failed to send reply.', details: err.message });
  }
};