const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
router.get("/" , async(req , res)=>{
    try {
        const course_category = await pool.query(`SELECT * FROM course_category ORDER BY tartib ASC`);
        res.render('admin/course_category' , {layout:'admin' , title:'Kurs kategoriyalari' , course_category:course_category.rows});
    } catch (error) {
        console.log(error)
    }
})
router.post("/add" , async(req , res)=>{
    try {
        const {icon , name , url , tartib ,  asosiy_sahifa} = req.body;
        const showOnMainPage = asosiy_sahifa === 'true';
        await pool.query(`INSERT INTO course_category (icon , name , url, tartib , asosiy_sahifa ) VALUES ($1 , $2 , $3 , $4 , $5 )` , [icon , name , url , tartib, showOnMainPage]);
        res.redirect("/admin/course_category");
    } catch (error) {
        console.log(error)
    }
});
router.get("/:id" , async(req , res)=>{
    try {
        const id = req.params.id;
        const course_category = await pool.query(`SELECT * FROM course_category WHERE course_category.id = $1` , [req.params.id]);
        res.render("admin/course_category_edit" , {layout:"admin" , course_category:course_category.rows[0]});
    } catch (error) {
        console.log(error)
    }
}); 
router.post("/edit" , async(req , res)=>{
    try {
        const {icon , name  , url , tartib , asosiy_sahifa , id } = req.body;
        const showOnMainPage = asosiy_sahifa === 'true';
        const oldEmployer = await pool.query(`SELECT * FROM course_category WHERE id=$1` , [id]);
        await pool.query(`UPDATE course_category SET icon = $1, name = $2 , url = $3 , tartib = $4, asosiy_sahifa = $5  WHERE course_category.id = $6` , [
            icon ? icon : oldEmployer.rows[0].icon,
            name ? name : oldEmployer.rows[0].name,
            url ? url : oldEmployer.rows[0].url,
            tartib ? tartib : oldEmployer.rows[0].tartib,
            showOnMainPage,
            id
        ]);
        res.redirect("/admin/course_category");
    } catch (error) {
        console.log(error)
    }
});

router.post("/delete" , async(req , res)=>{
    try {
        await pool.query(`DELETE from course_category WHERE id = $1` , [req.body.id]);
        res.redirect("/admin/course_category");
    } catch (error) {
        console.log(error)
    }
});
module.exports = router;
