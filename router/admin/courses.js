const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const faylCourses = require("../../middleware/faylCourses");
const path = require("path");
const fs = require("fs");
router.get("/" , async(req , res)=>{
    try {
        const course_category = await pool.query(`SELECT * FROM course_category`);
        const muallif = await pool.query('SELECT * FROM muallif');
        const courses = await pool.query(`SELECT courses.id AS course_id, courses.*, course_category.* ,  course_category.name AS category_name, muallif.* , muallif.name AS teacher_name
        FROM courses
        INNER JOIN course_category
        ON courses.course_category_id = course_category.id
        INNER JOIN muallif ON courses.teacher_id = muallif.id
        `);
        console.log(courses.rows)
        res.render('admin/courses' , {layout:'admin' , title:'Kurslar' , course_category:course_category.rows , courses:courses.rows , muallif:muallif.rows});
    } catch (error) {
        console.log(error)
    }
})
router.post('/add', faylCourses , async (req, res) => {
    const { level, title, description , price , oquvchi_soni , course_category_id , muallif_id } = req.body;
    const filePath = req.file ? req.file.path : null;
    try {
      const result = await pool.query(
        'INSERT INTO courses (image , level, title, description , price , oquvchi_soni , course_category_id , teacher_id) VALUES ($1, $2, $3, $4 , $5 , $6 , $7 , $8) RETURNING *',
        [filePath , level, title, description , price , oquvchi_soni , course_category_id, muallif_id]
      );
      res.redirect('/admin/courses'); // or wherever you want to redirect after successful insert
    } catch (err) {
      console.error('Error inserting data into the database:', err);
      res.status(500).send('Server Error');
    }
  });
router.get("/:id" , async(req , res)=>{
    try {
        const id = req.params.id;
        const course_category = await pool.query('SELECT * FROM course_category');
        const muallif = await pool.query('SELECT * FROM muallif');
        const courses = await pool.query(`SELECT courses.id AS course_id, courses.*, course_category.* ,  course_category.name AS category_name, muallif.* , muallif.name AS teacher_name
        FROM courses
        INNER JOIN course_category
        ON courses.course_category_id = course_category.id
        INNER JOIN muallif ON courses.teacher_id = muallif.id WHERE courses.id = $1 ` , [req.params.id]);
        console.log(courses.rows[0])
        console.log(course_category.rows)
        console.log(muallif.rows)
        res.render("admin/coursesEdit" , {layout:"admin" , courses:courses.rows[0] , muallif:muallif.rows , course_category:course_category.rows});
    } catch (error) {
        console.log(error)
    }
}); 
router.post('/edit', faylCourses, async (req, res) => {
  const { level, title, description, price , oquvchi_soni, course_category_id , existingImageUrl , id , muallif_id } = req.body;
  let imageUrl = existingImageUrl;

  if (req.file) {
      imageUrl = `images/courses/${req.file.filename}`;
  
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
      'UPDATE courses SET level = $1, title = $2, description = $3, price = $4, oquvchi_soni = $5 , course_category_id = $6  , image = $7 , teacher_id = $9 WHERE id = $8 RETURNING *',
      [level, title, description, price , oquvchi_soni , course_category_id ,  imageUrl, id , muallif_id]
    );
    res.redirect('/admin/courses');
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
        await pool.query(`DELETE from courses WHERE id = $1` , [req.body.id]);
        res.redirect("/admin/courses");
    } catch (error) {
        console.log(error)
    }
});
module.exports = router;
