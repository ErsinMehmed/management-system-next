import mongoose from "mongoose";

const cached = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

const connectMongoDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectMongoDB;