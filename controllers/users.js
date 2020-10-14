const express = require("express");
const router = express.Router();
const Joi = require("joi");
var multer=require('multer');
const jwtDecode=require('jwt-decode');
const jwt=require('express-jwt');

let UserProfile = require("../models/UserProfile");

var storage= multer.diskStorage({
  destination:(req,file,cb) => {
    cb(null,'profileImages/')
  },
  filenames:(req,file,cb) => {
    cb(null,`${Date.now()}_${file.originalname}`)
  },
  fileFilter:(req,file,cb) => {
    const ext=path.extname(file.originalname);
    if(ext!==".png" || ext!==".jpeg"){
      return cb(res.status(404).end('only png and jpeg files are supported'),false);
    }
    cb(null,true);
  }
})

var upload= multer({storage:storage});
/*
const attachUser=(req,res,next)=>{
  const token=req.headers.authorization;
  if(!token){
    return res.status(401)
    .json({message:'Authentication invalid'});
  }

  const decodedToken=jwtDecode(token.slice(7));

  if(!decodedToken){
    return res.status(401)
    .json({message:'There was a problem authorizing'});
  }
  else{
    req.user=decodedToken;
    next();
  }
}

router.use(attachUser);

const checkJwt=jwt({
  secret:process.env.JWT_SECRET,
  algorithms:['HS256'],
  issuer:'api.live-weather',
  audience:'api.live-weather'
});

router.use(checkJwt);
*/

router.post('/image/:id',upload.single('profileImage'),async(req, res) => {
  
  UserProfile.findOne({ _id: req.params.id }).
  then(userProfile => {
    Object.assign(userProfile,{profileImage:req.file.path.replace(/\\/g, "/")});
    return userProfile.save();
  })
  .then(userProfile => res.json({ userProfile }))
  .catch((err)=>{
         if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
        })

})

router.post('/',async(req, res) => {
  const {error,value}=validateProfile(req.body);
  if (error) {
    return res.status(400).json(error.details[0].message);
  } else {
    const userProfileDto=Object.assign({},value);
    const userProfile=new UserProfile(userProfileDto);
    await userProfile.save()
        .then((savedUserProfile)=>{
          res.status(200).json(savedUserProfile);
        })
        .catch((err)=>{
               return res.status(500).json(err)
           }
        )
  }
})

const validateProfile = (userProfile) => {
  const validationSchema = Joi.object()
    .keys({
      userName: Joi.string().min(3).required(),
      interests: Joi.string().min(3).required(),
    })
    
  return validationSchema.validate(userProfile);
};

module.exports=router;