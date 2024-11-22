import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
 
//default exports no curly braces in imports - single responsibility
//named exports have curly braces in imports - multiple exports

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
          `${process.env.MONGODB_URL}/${DB_NAME}`
        );
        console.log(`\n MongoDb connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED", error);
        process.exit(1)
    }
}

export default connectDB;

