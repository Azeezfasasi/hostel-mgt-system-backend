require('./utils/cloudinary');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const blogRoutes = require('./routes/blogRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bedSpaceRoutes = require('./routes/bedSpaceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const disciplinaryRoutes = require('./routes/disciplinaryRoutes.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware (must be before any other middleware/routes)
app.use(cors({
  origin: [
    'http://localhost:5173'
  ], // your frontend URL
  credentials: true, // if you use cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Handle preflight requests for all routes
app.options('*', cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.use(express.json());
 
app.use('/api/users', userRoutes);
app.use('/api', quoteRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/bedspace', bedSpaceRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/complaint', complaintRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/announcement', announcementRoutes)
app.use('/api/attendance', attendanceRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);

app.get('/', (req, res) => {
  res.send('Hostel Management System Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});