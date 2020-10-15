const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = mongoose.Schema({
  title:{
    type:String,
    minlength:3,
    trim:true,
  },
  media: { 
    type: String 
  },
  description:{
    type:String,
    minlength:3,
  },
  tags:[
    {type:String}
  ],
  views:{
    type:Number,
    default:0
  },
  upVotes:{
    type:Number,
    default:0,
  },
  downVotes:{
    type:Number,
    default:0,
  },
  comments:[
  {body:String,
    date:Date
  }],
  user:{
    type: mongoose.Types.ObjectId, 
    required: true,
    ref: 'User'
  }, 
},
  {
    timestamps:true
  }
);

const Post=mongoose.model('Post',PostSchema);
module.exports=Post;