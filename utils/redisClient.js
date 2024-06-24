const redis = require("redis");
require("dotenv").config(); // Ensure environment variables are loaded

const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    reconnectStrategy: (retries) => {
      if (retries >= 10) {
        return new Error("Too many retries to connect to Redis");
      }
      return 1000; // Reconnect after 1 second
    },
  },
});

// Redis connection events
redisClient.on("connect", () => console.log("Redis Connection OK!"));
redisClient.on("error", (err) =>
  console.log("Error connecting to Redis:", err)
);

const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis client connected successfully");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
};

initializeRedis();

module.exports = redisClient;
