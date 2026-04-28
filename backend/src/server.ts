import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

app.listen(env.port, () => {
  logger.info(`AgenteIA Alexandra backend running on port ${env.port} [${env.nodeEnv}]`);
});
