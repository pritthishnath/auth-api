import mongoose from "mongoose";

const db = {
  connectMongoose: async function () {
    try {
      await mongoose.connect(process.env.MONGO_URI, { dbName: "auth_service" });
      console.log(
        `${
          process.env.PORT || 3102
        }|AUTH-API MongoDB Default Connection Established`
      );
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  },
};

export default db;
