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

// ============================================
// REGEX PARA IDENTIFICACIÓN DE FECHAS EN JSON
// ============================================
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

/**
 * Función recursiva para buscar cadenas de texto que parezcan fechas ISO
 * y convertirlas en objetos Date de Javascript para que Prisma las maneje correctamente.
 */
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

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
app.use(helmet());
app.use(cors());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ENDPOINTS PÚBLICOS
// ============================================
app.get('/health', async (req, res) => {
  try {
    // Probar conexión a la base de datos con una consulta rápida
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'Flova DB Persistencia API',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      service: 'Flova DB Persistencia API',
      database: 'disconnected',
      error: error.message || 'Error al conectar con la base de datos'
    });
  }
});

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN INTERNA
// ============================================
const verifyInternalKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const internalKey = req.headers['x-internal-key'];

  if (!internalKey || internalKey !== INTERNAL_API_KEY) {
    return res.status(401).json({
      error: 'No autorizado. Se requiere una clave interna válida en el header X-Internal-Key.'
    });
  }

  next();
};

// ============================================
// ENDPOINT GENÉRICO DE CONSULTAS (PROTEGIDO)
// ============================================
app.post('/db/query', verifyInternalKey, async (req, res) => {
  try {
    const { model, operation, args } = req.body;

    if (!model || !operation) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: model y operation' });
    }

    // Verificar si el modelo existe en el cliente Prisma
    const prismaModel = (prisma as any)[model];
    if (!prismaModel) {
      return res.status(400).json({ error: `El modelo '${model}' no existe en el esquema Prisma` });
    }

    // Verificar si la operación existe en ese modelo
    const prismaOperation = prismaModel[operation];
    if (!prismaOperation) {
      return res.status(400).json({ error: `La operación '${operation}' no es válida para el modelo '${model}'` });
    }

    // Revivir fechas en los argumentos recursivamente
    const revivedArgs = reviveDates(args || {});

    // Ejecutar consulta dinámica en Prisma
    const result = await prismaOperation.call(prismaModel, revivedArgs);
    res.json(result);
  } catch (error: any) {
    console.error(`Error al ejecutar [Prisma.${req.body.model}.${req.body.operation}]:`, error);
    res.status(500).json({
      error: error.message || 'Error en la ejecución de la consulta a la base de datos'
    });
  }
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no controlado en servidor flova_db:', err);
  res.status(500).json({ error: err.message || 'Error interno del servidor de datos' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`🗄️ Flova DB Persistencia API`);
  console.log(`📡 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('========================================== 🚀');
  console.log('');
});
