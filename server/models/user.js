import mongoose from "mongoose";


const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required: function() { return !this.googleId; },
    },
    googleId:{
        type:String,
        sparse: true,
        unique: true
    },
    role:{
        type:String,
        enum:["owner", "user", "admin"],
        default:'user'
    },
   
    image:{
        type:String,
          default:""
    },
    phone_no:{
        type:String,
        default:"",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
},{timestamps:true});

UserSchema.index({ resetPasswordToken: 1 });

const Usermodel=mongoose.model('User',UserSchema);
export default Usermodel;