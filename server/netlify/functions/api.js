const serverless = require('serverless-http');
const app = require('../../app');
const connectDB = require('../../config/db');

const API_BASE = '/.netlify/functions/api';

const handler = serverless(app, {
  request(request, event) {
    if (event.path.startsWith(API_BASE)) {
      request.url = event.path.replace(API_BASE, '/api');
    } else {
      request.url = event.path;
    }
    return request;
  },
});

let dbReady = false;

module.exports.handler = async (event, context) => {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
  return handler(event, context);
};