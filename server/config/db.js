const mongoose = require('mongoose');

const HOSTS = [
  'ac-yl3rfgj-shard-00-00.dvg4dw7.mongodb.net:27017',
  'ac-yl3rfgj-shard-00-01.dvg4dw7.mongodb.net:27017',
  'ac-yl3rfgj-shard-00-02.dvg4dw7.mongodb.net:27017',
];

const CREDS = 'parmarnamrataba0_db_user:zR3IqMc06lnWjzk9';
const BASE_OPTS = 'gym_management?ssl=true&authSource=admin&directConnection=true&connectTimeoutMS=30000&serverSelectionTimeoutMS=30000';

function buildUri(host) {
  return `mongodb://${CREDS}@${host}/${BASE_OPTS}`;
}

async function connectDB() {
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const host of HOSTS) {
      try {
        const uri = buildUri(host);
        const conn = await mongoose.connect(uri, {
          connectTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        });

        const isMaster = await mongoose.connection.db.admin().command({ isMaster: 1 });
        if (isMaster.ismaster) {
          console.log(`MongoDB Connected (primary): ${host}`);
          return conn;
        }

        console.log(`${host} is secondary, trying next...`);
        await mongoose.disconnect();
      } catch (err) {
        console.log(`${host} failed: ${err.message}`);
        try { await mongoose.disconnect(); } catch (e) { /* ignore */ }
      }
    }
    if (attempt < 2) {
      console.log(`Retrying connection (attempt ${attempt + 2}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.error('Could not connect to any primary node');
  process.exit(1);
}

module.exports = connectDB;
