const serverless = require('serverless-http');
const app = require('../index'); // assuming your main app is in server/index.js

module.exports = serverless(app);