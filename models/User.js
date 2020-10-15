const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const UserSchema=new Schema({
    firstName:{
      type:String,
      required:true,
      minlength:3,
      trim:true
    },
    lastName:{
      type:String,
      required:true,
      minlength:3,
      trim:true
    },
    email:{
      type:String,
      required:true,
      unique:true,
      minlength:3,
      trim:true
    },
    password:{
      type:String,
      required:true,
      minlength:8,
      trim:true
    },
    role:{
      type:String,
      required:true,
      default:'user'
    },
    userProfile:{
      userName:{
      type:String,
      minlength:3,
      trim:true
    },
    profileImage: { 
      type: String 
    },
    bio:{
      type:String,
      minlength:3,
      trim:true
    },
    interests:{
      type:String,
    },
    }, 
  },
  {
    timestamps:true
  }
);

const User=mongoose.model('User',UserSchema);
module.exports=User;