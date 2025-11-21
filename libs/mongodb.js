import mongoose from "mongoose";

let isConnected = false;

const connectMongoDB = async () => {
    if (isConnected) {
        return;
    }

    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        });

        isConnected = true;
        console.log("Connected to MongoDB.");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

export default connectMongoDB;