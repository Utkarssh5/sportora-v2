module.exports = {
  apps: [
    {
      name: "sportora-web",
      cwd: "/home/ubuntu/Projects/sportora-v2",
      script: "/home/ubuntu/.nvm/versions/node/v24.20.0/bin/pnpm",
      args: "--filter @sportora/web start",
      interpreter: "none",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "sportora-api",
      cwd: "/home/ubuntu/Projects/sportora-v2",
      script: "/home/ubuntu/.nvm/versions/node/v24.20.0/bin/pnpm",
      args: "--filter @sportora/api start",
      interpreter: "none",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
