import { Environments } from '@libs/infrastructure/config-manager/config/enviroments.enum';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {
  const env = process.env.NODE_ENV as Environments;
  const filePath = join(__dirname, getRelativePath(env), YAML_CONFIG_FILENAME);

  return yaml.load(readFileSync(filePath, 'utf8')) as Record<string, any>;
};

function getRelativePath(env: Environments): string {
  switch (env) {
    case Environments.DEVELOPMENT:
      return '../../../';
    case Environments.PRODUCTION:
      return '.';
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
}
