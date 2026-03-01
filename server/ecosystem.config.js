module.exports = {
  apps: [
    {
      name: "airbnb",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
