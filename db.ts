import mongoose from "mongoose";

export = {
  connectMongoose: async function () {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MONGODB: Default Connection Established");
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  },
};
