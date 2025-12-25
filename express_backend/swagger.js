const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Dashboard and Task Management API',
      version: '1.0.0',
      description: 'REST API providing authentication, user profile management, and task management with JWT-based security. Supports user signup/login, profile CRUD operations, and full task CRUD with search and filter capabilities.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login or /auth/signup'
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoint'
      },
      {
        name: 'Authentication',
        description: 'User authentication endpoints (signup, login)'
      },
      {
        name: 'Profile',
        description: 'User profile management endpoints (requires authentication)'
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints with CRUD operations, search, and filtering (requires authentication)'
      }
    ]
  },
  apis: [__dirname + '/src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
