import mongoose from 'mongoose';

import config from './src/config/env.js';
import app from './app.js';

const mongoUri = config.mongo.host;
mongoose.connect(mongoUri);
mongoose.connection.on('error', (_err) => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

if (config.mongooseDebug) {
  mongoose.set('debug', true);
}

app.listen(config.port, () => {
  console.info(`server started on port ${config.port} (${config.env})`);
});

export default app;
