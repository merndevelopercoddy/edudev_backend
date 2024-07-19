const {Router} = require("express");
const router = Router();
const pool = require("../config/db");
const sliderRouter = require("./admin/slider");
const course_category = require("./admin/course_category");
const courses = require("./admin/courses");
const mualliflar = require("./admin/mualliflar");
const kurs_reja = require("./admin/kurs_reja");
const submenu = require("./admin/submenu");
const kurs_haqida = require("./admin/kurs_haqida");

router.get("/" , (req , res)=>{
    res.render("admin" , {layout:"admin" , title:"Bosh sahifa"});
});
router.get("/menu" , async(req , res)=>{
    try {
        const menu = await pool.query(`SELECT * FROM menu`);
        const category = await pool.query(`SELECT * FROM category`);
        res.render("admin/menu" , {layout:"admin" , title:"Menyu qo'shish" , menuRows:menu.rows , category:category.rows});
    } catch (error) {
        console.log(error)
    }
});
router.post("/menu/add" , async(req , res)=>{
    try {
        const {menu_name , menu_page , menu_number} = req.body;
        await pool.query(`INSERT INTO menu (menu_page , menu_name , menu_number , menu_uuid ) VALUES ($1 , $2 , $3 , uuid_generate_v4())` , [menu_page , menu_name , menu_number]);
        res.redirect("/admin/menu");
    } catch (error) {
        console.log(error)
    }
});
router.get("/menu/:id" , async(req , res)=>{
    try {
        const id = req.params.id;
        const category = await pool.query(`SELECT * FROM category`);
        const menu = await pool.query(`SELECT * FROM menu WHERE menu.menu_uuid = $1` , [req.params.id]);
        console.log(menu.rows);
        res.render("admin/menuEdit" , {layout:"admin" , menu:menu.rows , category:category.rows});
    } catch (error) {
        console.log(error)
    }
});
router.post("/menu/edit" , async(req , res)=>{
    try {
        const {menu_page , menu_name , menu_number , id} = req.body;
        const oldEmployer = await pool.query(`SELECT * FROM menu WHERE menu_uuid=$1` , [id]);
        await pool.query(`UPDATE menu SET menu_page = $1, menu_name = $2, menu_number = $3 WHERE menu.menu_uuid = $4` , [
            menu_page ? menu_page : oldEmployer.rows[0].menu_page,
            menu_name ? menu_name : oldEmployer.rows[0].menu_name,
            menu_number ? menu_number : oldEmployer.rows[0].menu_number,
            id
        ]);
        res.redirect("/admin/menu");
    } catch (error) {
        console.log(error)
    }
});
router.post("/menu/delete" , async(req , res)=>{
    try {
        await pool.query(`DELETE FROM menu WHERE menu_uuid = $1` , [req.body.id]);
        res.redirect("/admin/menu");
    } catch (error) {
        console.log(error)
    }
});
router.get("/category" , async(req , res)=>{
    try {
        const category = await pool.query(`SELECT * FROM category`);
        res.render("admin/category" , {layout:"admin" , title:"Kategoriya qo'shish" , category:category.rows})
    } catch (error) {
        console.log(error)
    }
});
router.post("/category/add" , async(req , res)=>{
    try {
        const {category_name} = req.body;
        await pool.query(`INSERT INTO category (category_name , category_uuid ) VALUES ($1 , uuid_generate_v4())` , [category_name]);
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error)
    }
});
router.get("/category/:id" , async(req , res)=>{
    try {
        const category = await pool.query(`SELECT * FROM category WHERE category.category_uuid = $1` , [req.params.id]);
        console.log(category.rows[0])
        res.render("admin/categoryEdit" , {layout:"admin" , title:"Kategoriya tahrirlash" , category:category.rows[0]});
    } catch (error) {
        console.log(error)
    }
});
router.post("/category/edit" , async(req , res)=>{
    try {
        const {category_name , id} = req.body;
        const oldCategory = await pool.query(`SELECT * FROM category WHERE category_uuid = $1` , [id]);
        await pool.query(`UPDATE category SET category_name = $1 WHERE category.category_uuid = $2` , [
            category_name ? category_name : oldCategory.rows[0].category_name,
            id
        ]);
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error)
    }
});
router.post("/category/delete" , async(req , res)=>{
    try {
        await pool.query(`DELETE FROM category WHERE category_uuid = $1` , [req.body.id]);
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error)
    }
});
router.use('/slider' , sliderRouter);
router.use('/course_category' , course_category);
router.use('/courses' , courses);
router.use('/mualliflar' , mualliflar);
router.use('/kurs_reja' , kurs_reja);
router.use('/submenu' , submenu);
router.use('/kurs_haqida' , kurs_haqida);

module.exports = router;