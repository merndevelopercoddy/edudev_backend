const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const faylMuallif = require("../../middleware/faylMuallif");
const path = require("path");
const fs = require("fs");
router.get("/" , async(req , res)=>{
    try {
      const muallif = await pool.query('SELECT * FROM muallif');
const muallifWithCourses = await Promise.all(muallif.rows.map(async (teacher) => {
  const courses = await pool.query('SELECT * FROM courses WHERE teacher_id = $1', [teacher.id]);
  return {
    ...teacher,
    courses: courses.rows
  };
}));
      res.render("admin/mualliflar" , {title:"Mualliflar" , layout:"admin" , muallif:muallifWithCourses});
    } catch (error) {
      console.log(error)
    }
  })
  router.post('/add', faylMuallif , async (req, res) => {
    const { name } = req.body;
    const filePath = req.file ? req.file.path : null;
    try {
      const result = await pool.query(
        'INSERT INTO muallif (rasm , name) VALUES ($1, $2)',
        [filePath , name]
      );
      res.redirect('/admin/mualliflar'); // or wherever you want to redirect after successful insert
    } catch (err) {
      console.error('Error inserting data into the database:', err);
      res.status(500).send('Server Error');
    }
  });
router.get("/:id" , async(req , res)=>{
    try {
        const id = req.params.id;
        const muallif = await pool.query(`SELECT * FROM muallif WHERE id = $1 ` , [req.params.id]);
        console.log(muallif.rows[0])
        res.render("admin/mualliflarEdit" , {layout:"admin" , muallif:muallif.rows[0]});
    } catch (error) {
        console.log(error)
    }
}); 
router.post('/edit', faylMuallif, async (req, res) => {
  const { name, existingImageUrl , id } = req.body;
  let imageUrl = existingImageUrl;
  if (req.file) {
      imageUrl = `images/muallif/${req.file.filename}`;
      // Delete old image file if it exists
      if (existingImageUrl) {
        const oldImagePath = path.join(__dirname, '../../', existingImageUrl);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error(`Failed to delete old image: ${err.message}`);
          } else {
            console.log(`Old image deleted: ${oldImagePath}`);
          }
        });
      }
    }
  try {
    const result = await pool.query(
      'UPDATE muallif SET name = $1 , rasm = $2 WHERE id = $3 RETURNING *',
      [name ,   imageUrl, id]
    );
    res.redirect('/admin/mualliflar');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating slider');
  }
});

router.post("/delete" , async(req , res)=>{
  const {existingImageUrl} = req.body;
    try {
      // Delete old image file if it exists
      if (existingImageUrl) {
        const oldImagePath = path.join(__dirname, '../../', existingImageUrl);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error(`Failed to delete old image: ${err.message}`);
          } else {
            console.log(`Old image deleted: ${oldImagePath}`);
          }
        });
      }
        await pool.query(`DELETE from muallif WHERE id = $1` , [req.body.id]);
        res.redirect("/admin/mualliflar");
    } catch (error) {
        console.log(error)
    }
});


  module.exports = router;