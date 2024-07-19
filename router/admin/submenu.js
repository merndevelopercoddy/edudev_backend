const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

router.get("/" , async(req , res)=>{
    try {
        res.render("admin/submenu" , {title:"Submenu" , layout:"admin"})
    } catch (error) {
        console.log(error)
    }
})
router.get("/:id" , async(req , res)=>{
    const kurs_id = req.query.kurs_id;
    const id  = req.params;
    try {
        res.render("admin/submenu_add" , {title:"Submenu qo'shish" , layout:"admin" , id , kurs_id})
    } catch (error) {
        console.log(error)
    }
})
router.post("/:id/add" , async(req , res)=>{
    const {kurs_id} = req.body;
    const { id } = req.params;
  const { title, position } = req.body;
  try {
    const newSection = await pool.query('INSERT INTO submenu (section_id, title, position) VALUES ($1, $2, $3) RETURNING *', [id, title, position]);
    res.redirect(`/admin/kurs_reja/${kurs_id}`);
  } catch (error) {
    console.log(error)
  } 
})
router.post("/delete" , async(req , res)=>{
    try {
        const {submenu_id , kurs_id} = req.body;
        console.log(submenu_id);
        console.log(kurs_id);
        await pool.query(`DELETE FROM submenu WHERE id = $1` , [submenu_id]);
        res.redirect(`/admin/kurs_reja/${kurs_id}`);
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;