module.exports = {
  apps: [
    {
      name: 'covasol-backend',
      cwd: './apps/backend',
      script: 'dist/src/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'covasol-frontend',
      cwd: './apps/frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        API_BASE_URL: 'http://localhost:4000'
      }
    }
  ]
};
