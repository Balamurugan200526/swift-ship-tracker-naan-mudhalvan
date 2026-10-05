import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import parcelRoutes from './routes/parcel.routes';
import senderRoutes from './routes/sender.routes';
import receiverRoutes from './routes/receiver.routes';
import deliveryRoutes from './routes/delivery.routes';
import notificationRoutes from './routes/notification.routes';
import reportRoutes from './routes/report.routes';
import aiRoutes from './routes/ai.routes';
import auditRoutes from './routes/audit.routes';
import userRoutes from './routes/user.routes';

import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' } 
}));

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s: string) => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/senders', senderRoutes);
app.use('/api/receivers', receiverRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'SwiftShip API is running', timestamp: new Date() });
});

// Serve frontend static build if available
const clientDistCandidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist')
];

let clientDistPath: string | null = null;
for (const candidate of clientDistCandidates) {
  if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
    clientDistPath = candidate;
    break;
  }
}

if (clientDistPath) {
  console.log(`📦 Serving client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath!, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      message: 'SwiftShip API Server is running',
      health: '/api/health',
      docs: 'API routes available under /api/'
    });
  });

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  });
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 SwiftShip server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

export default app;
