const mongoose=require("mongoose");

const taskSchema=new mongoose.Schema(
    {
     title:{
        type:String,
        required:true,
     },
     project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true,
     },
     owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
     },
     status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do' 
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: { type: Date }

    },
    {
        timestamps:true,
    }
);
module.exports=mongoose.model("Task",taskSchema);