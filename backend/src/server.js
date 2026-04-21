const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const emailLogger = require('./utils/emailLogger');
const paymentRoutes = require('./routes/paymentRoutes');
const jwt = require('jsonwebtoken');

// ================= LOAD ENV =================
dotenv.config({ path: path.join(__dirname, '../.env') });

const ADMIN_EMAIL = process.env.EMAIL_USER || 'admin@mindwell.com';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// ================= APP =================
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

// ================= DB =================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindwell_psychology';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Mongo Error:', err));

// ================= MODELS =================
const Appointment = require('./models/Appointment');
const Contact = require('./models/Contact');
const CalendarSettings = require('./models/CalendarSettings');

// ================= EMAIL =================
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify(err => {
    if (err) console.error('❌ Gmail SMTP Failed:', err.message);
    else console.log('✅ Gmail SMTP Ready');
  });
} else {
  console.log('⚠️ Email credentials not configured. Email functionality disabled.');
  transporter = null;
}

// ================= EMAIL HELPER =================
const sendEmailAndLog = async (to, subject, type, html) => {
  try {
    if (!transporter) {
      console.log(`📧 Email skipped (not configured) to ${to} (${type})`);
      await emailLogger.logEmail(to, subject, type + '_skipped', 'Email not configured');
      return false;
    }

    const info = await transporter.sendMail({
      from: `"MindWell Psychology" <${ADMIN_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to} (${type})`);
    await emailLogger.logEmail(to, subject, type, html.substring(0, 500));
    return true;

  } catch (err) {
    console.error('❌ Email failed:', err.message);
    await emailLogger.logEmail(to, subject, type + '_failed', `Error: ${err.message}`);
    return false;
  }
};

// ================= IMPORT ROUTES =================
const calendarRoutes = require('./routes/calendarRoutes');

// ================= MOUNT ROUTES =================
app.use('/api/calendar', calendarRoutes);
app.use('/api/payments', paymentRoutes);

// ================= AUTHENTICATION MIDDLEWARE =================
const requireAdminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    console.error('Auth error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token. Please login again.'
    });
  }
};

// ================= TEST ROUTES =================
app.get('/api/test/gmail', (_, res) => {
  res.json({
    success: true,
    message: transporter ? 'Gmail SMTP configured' : 'Gmail SMTP not configured',
    configured: !!transporter
  });
});

app.get('/api/test/email-logger', (_, res) => {
  res.json({ success: true, message: 'Email logger is active' });
});

// ================= ADMIN EMAIL LOGS =================
app.get("/api/admin/email-logs", requireAdminAuth, async (req, res) => {
  try {
    const logs = await emailLogger.getLogs();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load logs" });
  }
});

// ================= APPOINTMENTS =================
app.get('/api/appointments/booked', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    
    const start = new Date(date + 'T00:00:00');
    const end = new Date(date + 'T23:59:59');
    
    const booked = await Appointment.find({
      appointmentDate: { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed'] }
    }).select('appointmentTime');
    
    res.json({ success: true, booked: booked.map(b => b.appointmentTime) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { clientName, email, phone, appointmentDate, appointmentTime, serviceType } = req.body;
    const bookingDate = new Date(appointmentDate);
    const dateStr = bookingDate.toISOString().split('T')[0];

    const calendarSetting = await CalendarSettings.findOne({
      date: { $gte: new Date(dateStr + 'T00:00:00'), $lt: new Date(dateStr + 'T23:59:59') }
    });

    let isDateAvailable = true;
    let availabilityReason = '';

    if (calendarSetting) {
      isDateAvailable = calendarSetting.isAvailable;
      availabilityReason = calendarSetting.reason || 'Custom setting';
    } else {
      const dayOfWeek = bookingDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend) {
        isDateAvailable = false;
        availabilityReason = 'Weekend (default setting)';
      }
    }

    if (!isDateAvailable) {
      return res.status(400).json({
        success: false,
        error: `❌ ${availabilityReason}. ${dateStr} at ${appointmentTime} is not available.`
      });
    }

    const existingAppointment = await Appointment.findOne({
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        error: `❌ This time slot is already booked.`
      });
    }

    const appointment = await Appointment.create({
      ...req.body,
      status: 'pending',
    });

    // CRITICAL: We MUST await the email on Vercel/Serverless
    await sendEmailAndLog(
      appointment.email,
      'Appointment Received – MindWell Psychology',
      'appointment_client',
      `<p>Dear ${appointment.clientName},</p>
       <p>Your appointment request has been received.</p>
       <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toDateString()}<br/>
       <strong>Time:</strong> ${appointment.appointmentTime}</p>
       <p>Regards,<br/>MindWell Psychology</p>`
    );

    // Send Notification to Admin
    await sendEmailAndLog(
      ADMIN_EMAIL,
      'NEW Appointment Notification – MindWell Psychology',
      'appointment_admin_notify',
      `<h3>New Appointment Booked</h3>
       <p><strong>Client:</strong> ${appointment.clientName}</p>
       <p><strong>Email:</strong> ${appointment.email}</p>
       <p><strong>Phone:</strong> ${appointment.phone}</p>
       <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toDateString()}</p>
       <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
       <p><strong>Service:</strong> ${appointment.serviceType}</p>
       <p><a href="https://mindwell-psychology-delta.vercel.app/admin/dashboard">View in Dashboard</a></p>`
    );

    res.status(201).json({ success: true, data: appointment });

  } catch (error) {
    console.error('Appointment error:', error);
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

// ================= PROTECTED ADMIN ROUTES =================
app.get('/api/admin/appointments', requireAdminAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

app.put('/api/admin/appointments/:id', requireAdminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false });

    // Send email on status change
    if (status === 'confirmed' || status === 'cancelled') {
       await sendEmailAndLog(
        appointment.email,
        `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)} – MindWell Psychology`,
        `appointment_${status}`,
        `<p>Dear ${appointment.clientName},</p>
         <p>Your appointment on ${new Date(appointment.appointmentDate).toDateString()} has been <strong>${status}</strong>.</p>
         ${adminNotes ? `<p><strong>Note:</strong> ${adminNotes}</p>` : ''}
         <p>Regards,<br/>MindWell Psychology</p>`
      );
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

// ================= CONTACT =================
app.post('/api/contact', async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, isRead: false, replied: false });
    
    // Notify Admin of new message
    await sendEmailAndLog(
      ADMIN_EMAIL,
      'NEW Inquiry Message – MindWell Psychology',
      'contact_admin_notify',
      `<h3>New Inquiry Received</h3>
       <p><strong>Name:</strong> ${contact.name}</p>
       <p><strong>Email:</strong> ${contact.email}</p>
       <p><strong>Subject:</strong> ${contact.subject}</p>
       <p><strong>Message:</strong></p>
       <p>${contact.message}</p>
       <p><a href="https://mindwell-psychology-delta.vercel.app/admin/dashboard">View in Dashboard</a></p>`
    );

    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

app.get('/api/admin/contacts', requireAdminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

app.post('/api/admin/contacts/:id/reply', requireAdminAuth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false });
    
    contact.replied = true;
    contact.isRead = true;
    contact.replyMessage = req.body.replyMessage;
    await contact.save();

    // Send the reply email and await it
    await sendEmailAndLog(
      contact.email,
      'Reply to your inquiry – MindWell Psychology',
      'contact_reply',
      `<p>Dear ${contact.name},</p>
       <p>Thank you for contacting us. Regarding your message: "${contact.message}"</p>
       <p><strong>Our Reply:</strong> ${req.body.replyMessage}</p>
       <p>Regards,<br/>MindWell Psychology</p>`
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

// ================= AUTH =================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      success: true,
      token: token,
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error' });
  }
});

app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MindWell Psychology API is running' });
});

// ================= START =================
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
