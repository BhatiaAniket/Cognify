const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initSocket } = require('./socket');
const { initCronJobs } = require('./services/cron.service');

// Load env vars
dotenv.config();

// Environment variable verification
console.log("=== ENV CHECK ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "MISSING");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST ? "Loaded" : "MISSING");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Loaded" : "MISSING");
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Loaded" : "MISSING");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "Loaded" : "MISSING");
console.log("REDIS_URL:", process.env.REDIS_URL ? "Loaded" : "MISSING");
console.log("=================");

// Connect to MongoDB & Redis
connectDB();
connectRedis();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // In dev, allow all; tighten in production
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);

// ━━━ Routes ━━━
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const companyOverviewRoutes = require('./routes/companyOverview');
const managerRoutes = require('./routes/managerRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const projectRoutes = require('./routes/projects');
const performanceRoutes = require('./routes/performance');
const meetingRoutes = require('./routes/meetings');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const filesRoutes = require('./routes/files');
const meetingRequestRoutes = require('./routes/meetingRequestRoutes');
const clientRoutes = require('./routes/client');
const superAdminRoutes = require('./routes/superAdmin');
const companyController = require('./controllers/companyController');
const { protect } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/company/overview', companyOverviewRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/people', require('./routes/people'));
app.use('/api/projects', projectRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/meeting-requests', meetingRequestRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/api/company/people/all', protect, companyController.getCompanyPeople);
app.use('/api/settings', settingsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/superadmin', superAdminRoutes);

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});
// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CognifyPM API is running',
    data: { timestamp: new Date().toISOString() },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errors: [],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [],
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1' && process.env.VERCEL !== 'true') {
  // Handle port already in use gracefully (prevents nodemon crash loop)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`);
      console.error('   Waiting for it to free up and retrying in 2s...\n');
      setTimeout(() => {
        server.close();
        server.listen(PORT, '0.0.0.0');
      }, 2000);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  CognifyPM API Server`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  ⏰ Cron jobs initialized`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    initCronJobs();
  });
}
// Graceful shutdown — release port before nodemon restarts
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  server.close(() => {
    console.log('✓ HTTP server closed. Port released.');
    process.exit(0);
  });
  // Force exit after 5s if connections linger
  setTimeout(() => process.exit(1), 5000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

module.exports = app;
