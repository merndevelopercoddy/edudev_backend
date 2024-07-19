const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

router.get("/" , async(req , res)=>{
    try {
        const kurslar = await pool.query('SELECT * FROM courses');
        console.log(kurslar.rows)
        res.render("admin/kurs_reja" , {title:"Kurs rejasi" , layout:"admin" , kurslar:kurslar.rows})
    } catch (error) {
        console.log(error)
    }
})
router.get("/:id" , async(req , res)=>{
    const {id}  = req.params;
    try {
        const sections = await pool.query('SELECT * FROM curriculum_sections WHERE course_id = $1 ORDER BY position', [id]);
    const submenus = await pool.query('SELECT * FROM submenu WHERE section_id IN (SELECT id FROM curriculum_sections WHERE course_id = $1) ORDER BY position', [id]);

    const curriculum = sections.rows.map(section => ({
      ...section,
      submenu: submenus.rows.filter(submenu => submenu.section_id === section.id)
    }));
        console.log(curriculum)
        res.render("admin/kurs_reja_add" , {title:"Kurs reja qo'shish" , layout:"admin" , id , kurs_reja:curriculum})
    } catch (error) {
        console.log(error)
    }
})
router.post("/:id/add" , async(req , res)=>{
    const { id } = req.params;
  const { title, position } = req.body;
  try {
    const newSection = await pool.query('INSERT INTO curriculum_sections (course_id, title, position) VALUES ($1, $2, $3) RETURNING *', [id, title, position]);
    res.redirect(`/admin/kurs_reja/${id}`)
  } catch (error) {
    console.log(error)
  } 
})
router.get("/:id/edit" , async(req , res)=>{
    try {
        const kurs_id = req.query.kurs_id;
        const {id} = req.params;
        const reja = await pool.query(`SELECT * FROM curriculum_sections WHERE id=$1` , [id]);
        res.render("admin/kurs_reja_edit" , {title:"Kurs rejani tahrirlash" , layout:"admin_sub" , reja:reja.rows[0] , kurs_id})
    } catch (error) {
        console.log(error)
    }
})
router.post("/:id/edit" , async(req , res)=>{
    try {
        const {kurs_id} = req.body;
        const {id} = req.params;
        console.log(kurs_id);
        const {title , position} = req.body;
        const oldEmployer = await pool.query(`SELECT * FROM curriculum_sections WHERE id=$1` , [id]);
        await pool.query(`UPDATE curriculum_sections SET title = $1, position = $2  WHERE id = $3` , [
            title ? title : oldEmployer.rows[0].title,
            position ? position : oldEmployer.rows[0].position,
            id
        ]);
        res.redirect(`/admin/kurs_reja/${kurs_id}`);
    } catch (error) {
        console.log(error)
    }
})
router.post("/:id/delete" , async(req , res)=>{
    try {
        const {kurs_id} = req.body;
        const {id} = req.params;
        await pool.query(`DELETE FROM submenu WHERE section_id = $1` , [id]);
        await pool.query(`DELETE from curriculum_sections WHERE id = $1` , [id]);
        res.redirect(`/admin/kurs_reja/${kurs_id}`);
    } catch (error) {
        console.log(error)
    }
});

module.exports = router;