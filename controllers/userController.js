const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );
};

exports.register = async (req, res) => {
  const { firstName, lastName, otherName, email, phone, matricNumber,  password, role } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const user = await User.create({ firstName, lastName, otherName, email, phone, matricNumber, password, role });
    const token = generateToken(user);

    // --- EMAIL NOTIFICATIONS ---
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT), // Ensure port is a number
        secure: process.env.EMAIL_SECURE === 'true', // Ensure secure is a boolean
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });
    
    // Send welcome email to user
    await transporter.sendMail({
      to: user.email,
      from: `"Hostel Management System" <${process.env.EMAIL_USER}>`,
      subject: 'Welcome to Hostel Management System',
      html: `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">

        <!-- Header section -->
        <div style="background:#00B9F1;padding:24px 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Hostel Management System!</h1>
        </div>

        <!-- Body Section -->
        <div style="padding:32px 24px 24px 24px;">
          <div style="padding:32px 24px 24px 24px;color:#222;line-height:1.6;">
            <p style="font-size:1.1rem;margin-bottom:16px;">Hi ${firstName},</p>
            <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Your Account at Hostel Management System Has Been Created!</h2>
            <p style="font-size:1.1rem;margin-bottom:16px;">
              We are thrilled to welcome you to the Hostel Management System community! Your account has been successfully created.
            </p>
            <p style="color:#222;line-height:1.5;margin-bottom:24px;">
              You can now log in to manage your profile, view your orders, track quote requests, and explore all the services and products we offer.
            </p>
            <a href="${process.env.FRONTEND_URL || 'https://mgv-tech.com'}/login" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">Log In to Your Account</a>
            <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">
              If you have any questions or need assistance, please do not hesitate to contact our support team.
            </p>
            <p style="margin-top:16px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Hostel Management System Team</p>
          </div>
        </div>

        <!-- Footer Section -->
        <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
          <p style="margin:0 0 8px 0;">&copy; 2025 Hostel Management System. All rights reserved.</p>
          <p style="margin:0 0 8px 0;">
              Nigeria
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
    // Send notification email to admin
    if (process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        to: process.env.ADMIN_EMAIL,
        from: `"Hostel Management System" <${process.env.EMAIL_USER}>`,
        subject: `New User Registration || ${user.firstName} - ${user.matricNumber}`,
        html: `
        <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">

          <!-- Header section -->
          <div style="background:#00B9F1;padding:24px 0;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Hostel Management System!</h1>
          </div>

          <!-- Body Section -->
          <div style="padding:32px 24px 24px 24px;">
            <div style="color:#222;line-height:1.6;">
              <p style="font-size:1.1rem;margin-bottom:16px;">Hi Hostel Management System Team,</p>
              <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">New User Registration Notification!</h2>
              <p style="font-size:1.1rem;margin-bottom:16px;">
                A new user has successfully registered on your website. Here are their details:
              </p>
              <h3 style="font-size:1.3rem;color:#333;margin-top:24px;margin-bottom:12px;">User Information:</h3>
              <ul style="list-style:none;padding:0;margin:0;">
                <li style="margin-bottom:8px;"><strong>First Name:</strong> ${newUser.firstName || 'N/A'}</li>
                <li style="margin-bottom:8px;"><strong>Last Name:</strong> ${newUser.lastName || 'N/A'}</li>
                <li style="margin-bottom:8px;"><strong>Matric Number:</strong> ${newUser.matricNumber || 'N/A'}</li>
                <li style="margin-bottom:8px;"><strong>Email:</strong> ${newUser.email}</li>
                <li style="margin-bottom:8px;"><strong>Phone Number:</strong> ${newUser.phone}</li>
                <li style="margin-bottom:8px;"><strong>Role:</strong> ${newUser.role || 'Student'}</li>
                <li style="margin-bottom:8px;"><strong>Registration Date:</strong> ${new Date(newUser.createdAt).toLocaleString()}</li>
              </ul>
              <p style="margin-top:24px;margin-bottom:24px;">
                Please log in to the admin dashboard to view the user's full profile or manage user accounts.
              </p>
              <a href="${process.env.FRONTEND_URL || 'https://mgv-tech.com'}//app/allusers" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">View User in Admin Dashboard</a>
              <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Hostel Management System</p>
            </div>
          </div>

          <!-- Footer Section -->
          <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
            <p style="margin:0 0 8px 0;">&copy; 2025 Hostel Management System. All rights reserved.</p>
            <p style="margin:0 0 8px 0;">
              Lagos, Nigeria
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
    }
    // --- END EMAIL NOTIFICATIONS ---

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', details: err.message });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { matricNumber: identifier }
      ]
    });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });
    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found.' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT), // Ensure port is a number
        secure: process.env.EMAIL_SECURE === 'true', // Ensure secure is a boolean
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    const resetUrl = `${process.env.FRONTEND_URL || 'https://mgv-tech.com'}/resetpassword/${token}`;
    await transporter.sendMail({
      to: user.email,
      from: `"Marshall Global Ventures" <${process.env.EMAIL_USER}>`,
      subject: `Password Reset for ${user.name || user.email}`,
      html: `
      <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">

        <!-- Header Section -->
        <div style="background:#00B9F1;padding:24px 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures</h1>
        </div>

        <!-- Body Section -->
        <div style="padding:32px 24px 24px 24px;">
          <p style="font-size:1.1rem;margin-bottom:16px;">Hi ${user.name || user.email},</p>
          <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Password Reset Request for Your Account</h2>
          <p style="font-size:1.1rem;margin-bottom:16px;">
            We received a request to reset the password for your Marshall Global Ventures account.
          </p>
          <p style="color:#222;line-height:1.5;margin-bottom:24px;">
            To reset your password, please click the button below. This link is valid for <strong>1 hour</strong> only.
          </p>
          <a href="${resetUrl}" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">Reset Your Password</a>
          <p style="font-size:0.95rem;color:#555;margin-top:32px;line-height:1.5;">
            If you did not request a password reset, please ignore this email. Your password will remain unchanged.
            For security reasons, do not share this link with anyone.
          </p>
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
    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reset email.', details: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token.' });

    user.password = newPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save(); 
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Failed to reset password.', details: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.', details: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    // Fetch users with 'admin' or 'super admin' roles
    const admins = await User.find({ role: { $in: ['admin', 'super admin'] } }).select('name email');
    res.status(200).json(admins);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Failed to fetch admin users.' });
  }
};

// 2. User: Get own profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.', details: err.message });
  }
};

// 2. User: Update own profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    // Prevent changing unique fields
    delete updates.role; // Prevent role change
    delete updates.isActive; // Prevent self-disabling
    delete updates.email; // Prevent email change
    delete updates.matricNumber; // Prevent matric number change
    if (updates.password) delete updates.password; // Prevent password change here
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.', details: err.message });
  }
};

// 3. Admin/Super Admin: Edit any user
exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.password) delete updates.password; // Prevent password change here
    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit user.', details: err.message });
  }
};

// 4. Admin/Super Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.', details: err.message });
  }
};

// 5. Admin/Super Admin: Disable user
exports.disableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User disabled.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disable user.', details: err.message });
  }
};

// 6. Admin/Super Admin: Enable user
exports.enableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User enabled.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to enable user.', details: err.message });
  }
};

// Admin: Reset password for any user
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required.' });
    }

    // Minimum password length validation
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.', details: err.message });
  }
};