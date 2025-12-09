import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/georgeoneprice";
  if (!uri) throw new Error("MONGO_URI is not set");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { autoIndex: true });
  console.log("Connected to MongoDB");
}
