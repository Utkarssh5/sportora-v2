import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Sportora API",
      version: "1.0.0",
      description: "AI Powered Sports Tournament Ecosystem API",
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Development",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: [
    "./src/modules/**/*.ts",
    "./src/routes/**/*.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
