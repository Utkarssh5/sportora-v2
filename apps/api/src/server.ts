import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

async function startServer() {
  await connectDatabase();

  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Sportora API running on http://localhost:${env.PORT}`);
  });
}

startServer();