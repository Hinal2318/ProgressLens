const mongoose=require("mongoose");

const projectSchema=new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
        },
        semester:{
            type:Number,
            required:true,
        },
        faculty:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        students:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
            },
        ],
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        currentPhase: {
            type: String,
            enum: ['Proposal', 'Mid-Evaluation', 'Final'],
            default: 'Proposal'
        },
        status: {
            type: String,
            enum: ['In Progress', 'Completed', 'On Track', 'Needs Attention', 'At Risk'],
            default: 'In Progress'
        },

    },
    {
        timestamps:true,
    }
);
module.exports=mongoose.model("Project",projectSchema);