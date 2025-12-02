module.exports = {
    apps: [{
        name: "covasol-landing-page",
        script: "./src/server.js",
        env: {
            NODE_ENV: "production",
            PORT: 5005
        }
    }]
}
