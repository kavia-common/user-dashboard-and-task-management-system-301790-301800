const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

const app = express();

/* ============================
   CORS CONFIG (FIXED)
   ============================ */

// normalize origin (remove trailing slash)
const normalizeOrigin = (origin) =>
  origin ? origin.replace(/\/$/, '') : origin;

const ALLOWED_ORIGINS = [
  'https://vscode-internal-21738-beta.beta01.cloud.kavia.ai:3000',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow Postman, curl, Swagger
    if (!origin) return callback(null, true);

    const cleanOrigin = normalizeOrigin(origin);

    if (ALLOWED_ORIGINS.includes(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

/* IMPORTANT: allow preflight to pass */
app.options('*', cors());

app.set('trust proxy', true);

/* ============================
   SWAGGER
   ============================ */

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  const protocol = req.secure ? 'https' : 'http';

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      { url: `${protocol}://${host}` }
    ]
  };

  swaggerUi.setup(dynamicSpec)(req, res, next);
});

/* ============================
   MIDDLEWARE & ROUTES
   ============================ */

app.use(express.json());
app.use('/', routes);

/* ============================
   ERROR HANDLER
   ============================ */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
});

module.exports = app;
