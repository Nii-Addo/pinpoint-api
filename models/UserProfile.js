const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const UserProfileSchema=new Schema({
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
  /*  user:{
      type: mongoose.Types.ObjectId, 
      required: true,
      ref: 'User'
    }, */
  },
  {
    timestamps:true
  }
);

const UserProfile=mongoose.model('UserProfile',UserProfileSchema);
module.exports=UserProfile;