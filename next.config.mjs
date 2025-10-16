import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = config.resolve.alias ?? {};

    config.resolve.alias['@react-native-async-storage/async-storage'] = path.join(
      process.cwd(),
      'src/shims/async-storage.ts'
    );
    config.resolve.alias['pino-pretty'] = path.join(
      process.cwd(),
      'src/shims/pino-pretty.ts'
    );

    return config;
  }
};

export default nextConfig;
