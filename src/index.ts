import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import prisma from './prisma';

const app = express();
const PORT = process.env.PORT || 5000;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'flova_secret_internal_key_2026';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

const reviveDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    if (ISO_DATE_REGEX.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => reviveDates(item));
  }

  if (typeof obj === 'object') {
    const revivedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        revivedObj[key] = reviveDates(obj[key]);
      }
    }
    return revivedObj;
  }

  return obj;
};

app.use(helmet());
app.use(cors());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'Flova DB Persistence API',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      service: 'Flova DB Persistence API',
      database: 'disconnected',
      error: error.message || 'Error connecting to database'
    });
  }
});

const verifyInternalKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const internalKey = req.headers['x-internal-key'];

  if (!internalKey || internalKey !== INTERNAL_API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized. A valid internal key is required in the X-Internal-Key header.'
    });
  }

  next();
};

app.post('/db/query', verifyInternalKey, async (req, res) => {
  try {
    const { model, operation, args } = req.body;

    if (!model || !operation) {
      return res.status(400).json({ error: 'Required parameters missing: model and operation' });
    }

    const prismaModel = (prisma as any)[model];
    if (!prismaModel) {
      return res.status(400).json({ error: `The model '${model}' does not exist in the Prisma schema` });
    }

    const prismaOperation = prismaModel[operation];
    if (!prismaOperation) {
      return res.status(400).json({ error: `The operation '${operation}' is not valid for model '${model}'` });
    }

    const revivedArgs = reviveDates(args || {});

    const result = await prismaOperation.call(prismaModel, revivedArgs);
    res.json(result);
  } catch (error: any) {
    console.error(`Error executing [Prisma.${req.body.model}.${req.body.operation}]:`, error);
    res.status(500).json({
      error: error.message || 'Error executing database query'
    });
  }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error in flova_db server:', err);
  res.status(500).json({ error: err.message || 'Internal database server error' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`🗄️ Flova DB Persistence API`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('========================================== 🚀');
  console.log('');
});
