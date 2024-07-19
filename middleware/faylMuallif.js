const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
    destination(req , file , cb){
        cb(null , "images/muallif")
    },
    filename(req , file , cb){
        cb(null , new Date().toISOString().replace(/:/g, "-")+"-"+file.originalname);
    }
});

const fileFilter = (req , file , cb)=>{ 
    if(file.mimetype.startsWith("image")){
        cb(null , true);
    }
    else{
        cb(new Error("Rasm formatida bo'lishi zarur") , fasle);
    }
};

const upload = multer({
    storage,
    limits:{
        fileSize: 10*1024*1024
    },
    fileFilter
});

const uploadFile = upload.single("m_image");
module.exports = uploadFile;