import { ConfigModule, ConfigService } from '@nestjs/config';

export const mongoConfig = async (
  configService: ConfigService,
): Promise<any> => {
  return {
    uri: configService.get('MONGO_CONNECTION_STRING'),
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
};

export default mongoConfig;
