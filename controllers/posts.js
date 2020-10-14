const createError = require('http-errors');
const express=require("express");
const router=express.Router();
const Joi=require("joi");
const multer=require('multer');


const Posts=require("../models/Post");


var storage= multer.diskStorage({
  destination:(req,file,cb) => {
    cb(null,'uploads/')
  },
  filenames:(req,file,cb) => {
    cb(null,`${Date.now()}_${file.originalname}`)
  },
  fileFilter:(req,file,cb) => {
    const ext=path.extname(file.originalname);
    if(ext!==".mp4" || ext!==".WEBM"){
      return cb(res.status(404).end('only mp4 and WEBM files are supported'),false);
    }
    cb(null,true);
  }
})

var upload= multer({storage:storage});

router.post('/',upload.single('media'),async(req, res, next) =>{
  const postDto=Object.assign({},{media:req.file.path.replace(/\\/g, "/"),});
  const post=new Posts(postDto);
  await post.save()
        .then((savedPost)=>{
          res.json(savedPost);
        })
        .catch((err)=>{
          if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
        })
})

router.post('/create/:id',(req, res) =>{
  const {error,value}=validatePost(req.body);
  if(error){
    createError(400,"Error creating post")
  }
  Posts.findOne({ _id: req.params.id }).
    then(post => {
      Object.assign(post,value);
      return post.save();
    }).
    then(post => res.json({ post })).
    catch(error => res.json({ error: error.message }));
});


router.get('/',(req,res,next)=>{
  
  Posts.find({})
    .exec((err,posts)=>{
      if(err){
        createError(403,"No posts available")
      }else{
        res.status(200).json(posts);
      }
    })
})

router.post('/upvote/:id',(req, res) =>{
  Posts.findOne({ _id: req.params.id }).
    then(post => {
      let votes=post.upVotes;
      votes+=1;
      Object.assign(post,{upVotes:votes});
      return post.save();
    }).
    then(post => res.json({ upVotes:post.upVotes })).
    catch(error => res.json({ error: error.message }));
});

router.post('/downvote/:id',(req, res) =>{
  Posts.findOne({ _id: req.params.id }).
    then(post => {
      let votes=post.downVotes;
      votes+=1;
      Object.assign(post,{downVotes:votes});
      return post.save();
    }).
    then(post => res.json({ downVotes:post.downVotes })).
    catch(error => res.json({ error: error.message }));
});

router.post('/:id/comments',(req, res) =>{
  const {error,value}=validateComment(req.body);
  if(error){
    createError(400,"Error creating post")
  }
  Posts.findOne({ _id: req.params.id }).
    then(post => {
     // let commentsArray =
      post.comments.push(value);
   //   Object.assign(post,{comments:commentArray,});
      return post.save();
    }).
    then(comment => res.json({ comment:comment })).
    catch(error => res.json({ error: error.message }));
})

const validatePost = (post) => {
  const validationSchema = Joi.object()
    .keys({
      tittle: Joi.string().min(3).required(),
      description:Joi.string().min(3),
      tags:Joi.string().min(3).required(),
    })

  return validationSchema.validate(post);
};

const validteComment=(comment)=>{
  const validationSchema=Joi.Object()
  .keys({
    comment:Joi.string().min(3),
  })

  return validationSchema.validate(comment);
}
module.exports=router;