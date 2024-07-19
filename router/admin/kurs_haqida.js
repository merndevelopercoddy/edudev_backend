const multer = require('multer');
const path = require('path');


// Configure Multer with limits
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/kurs_about1');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});




const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
router.get("/:id" , async(req , res)=>{
    const {id} = req.params;
    try {
        const kurs_about1 = await pool.query(`SELECT * FROM kurs_about1 WHERE course_id = $1` , [id]);
        res.render("admin/kurs_haqida_add" , {title:"Kurs haqida" , layout:"admin" , id , about1:kurs_about1.rows});
    } catch (error) {
        console.log(error)
    }
});
router.post("/:id/about" , async(req , res)=>{
    const {id} = req.params;
    const {kurs_haqida_sarlavha , kurs_haqida_batafsil} = req.body;
    try {
        await pool.query(`INSERT INTO kurs_about1 (kurs_haqida_sarlavha , kurs_haqida_batafsil , course_id) VALUES ($1 , $2 , $3) RETURNING *` , [kurs_haqida_sarlavha , kurs_haqida_batafsil , id]);
        res.redirect(`/admin/kurs_haqida/${id}`)
    } catch (error) {
        console.log(error)
    }
});
router.get("/:id/edit" , async(req , res)=>{
    try {
        const about_id = req.query.about_id;
        const {id} = req.params;
        // console.log(about_id , id);
        const kurs_haqida = await pool.query(`SELECT * FROM kurs_about1 WHERE id=$1` , [about_id]);
        // console.log(kurs_haqida.rows)
        res.render("admin/kurs_haqida_edit" , {title:"Kurs haqida tahrirlash" , layout:"admin_sub" , kurs_haqida:kurs_haqida.rows[0]});
    } catch (error) {
        console.log(error)
    }
})

router.post("/:id/edit" , upload.single('file') , async(req , res)=>{
    try {
        const {kurs_haqida_sarlavha , kurs_haqida_batafsil , about_id} = req.body;
        const {id} = req.params;
        // console.log(about_id);
        
        const oldEmployer = await pool.query(`SELECT * FROM kurs_about1 WHERE id=$1` , [about_id]);
        await pool.query(`UPDATE kurs_about1 SET kurs_haqida_sarlavha = $1, kurs_haqida_batafsil = $2  WHERE id = $3` , [
            kurs_haqida_sarlavha ? kurs_haqida_sarlavha : oldEmployer.rows[0].kurs_haqida_sarlavha,
            kurs_haqida_batafsil ? kurs_haqida_batafsil : oldEmployer.rows[0].kurs_haqida_batafsil,
            about_id
        ]);
        
        res.redirect(`/admin/kurs_haqida/${id}`);
    } catch (error) {
        console.log(error)
    }
})
module.exports = router;