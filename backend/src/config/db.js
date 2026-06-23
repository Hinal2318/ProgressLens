const mongoose=require("mongoose");

const connectDB=async()=>{
    try{
        const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/progresslens";
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    }  catch(error){
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
module.exports=connectDB;