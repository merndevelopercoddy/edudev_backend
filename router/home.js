const {Router} = require("express");
const router = Router();
const pool = require("../config/db");
router.get("/" , async(req , res)=>{
    const minMenuNumber = 0;
    try {
        const menu = await pool.query('SELECT * FROM menu WHERE menu_number > $1 ORDER BY menu_number ASC', [minMenuNumber]);
        const sliders = await pool.query('SELECT * FROM sliders');
        const courseCategoriesQuery = 'SELECT * FROM course_category ORDER BY tartib ASC';
    const coursesQuery = 'SELECT * FROM courses';
    const [courseCategoriesResult, coursesResult] = await Promise.all([
      pool.query(courseCategoriesQuery),
      pool.query(coursesQuery)
    ]);
    const courseCategories = courseCategoriesResult.rows;
    const courses = coursesResult.rows;
    const combinedCategories = courseCategories.map(category => ({
      ...category,
      courses: courses
        .filter(course => course.course_category_id === category.id)
        .map(course => ({
          ...course,
          categoryUrl: category.url
        }))
    }));
    const barchasiCategory = {
      id: 0,
      name: 'Barchasi',
      tartib: 0,
      courses: courses.map(course => ({
        ...course,
        categoryUrl: combinedCategories.find(cat => cat.id === course.course_category_id).url
      }))
    };
    const finalCategories = [barchasiCategory, ...combinedCategories];
    // console.log(finalCategories[0].courses)
        res.render("index" , {menu:menu.rows , sliders:sliders.rows , course_category: finalCategories});
    } catch (error) {
        console.log(error)
    }
});

router.get('/:category', async (req, res) => {
    try {
        const { rows: menu } = await pool.query('SELECT * FROM category');
        const category = req.params.category;
        const { rows: pageResult } = await pool.query('SELECT * FROM category WHERE category_name = $1', [category]);
        if (pageResult.length > 0) {
            const page = pageResult[0];
            res.render('page', {
                category: page.category_name,
                menu: menu,
                layout:'main'
            });
        } else {
            res.status(404).send('Page Not Found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get("/course/:id" , async(req , res)=>{
    const minMenuNumber = 0;
    try {
        const menu = await pool.query('SELECT * FROM menu WHERE menu_number > $1 ORDER BY menu_number ASC', [minMenuNumber]);
        const id = req.params.id;
        const course_category = await pool.query('SELECT * FROM course_category ORDER BY tartib ASC');
        const course_and_mentor = await pool.query(`SELECT courses.id AS course_id, courses.*, course_category.* ,  course_category.name AS category_name, muallif.* , muallif.name AS teacher_name
        FROM courses
        INNER JOIN course_category
        ON courses.course_category_id = course_category.id
        INNER JOIN muallif ON courses.teacher_id = muallif.id WHERE courses.id = $1` , [id]);
        const sections = await pool.query('SELECT * FROM curriculum_sections WHERE course_id = $1 ORDER BY position', [id]);
    const submenus = await pool.query('SELECT * FROM submenu WHERE section_id IN (SELECT id FROM curriculum_sections WHERE course_id = $1) ORDER BY position', [id]);

    const curriculum = sections.rows.map(section => ({
      ...section,
      submenu: submenus.rows.filter(submenu => submenu.section_id === section.id)
    }));
        const mavzular_soni = curriculum.reduce((sum , item)=> sum + item.submenu.length , 0);
        const course_for_mentor = await pool.query(`SELECT * FROM courses WHERE teacher_id=$1` , [course_and_mentor.rows[0].teacher_id]);
        const all_course_on_category = await pool.query(`SELECT * FROM courses WHERE course_category_id = $1 AND id != $2` , [course_and_mentor.rows[0].course_category_id , id]);
        const kurs_haqida1 = await pool.query(`SELECT * FROM kurs_about1 WHERE course_id = $1` , [id]);
        // console.log(curriculum)
        // console.log(course_and_mentor.rows[0])
        // console.log(mavzular_soni)
        // console.log(course_for_mentor.rows.length)
        // console.log(all_course_on_category.rows)
        // console.log(kurs_haqida1.rows)
        res.render("course_more" , {menu:menu.rows , result:course_and_mentor.rows[0] , category:course_category.rows , curriculum , mavzular_soni , kurs_soni:course_for_mentor.rows.length , category_courses:all_course_on_category.rows , kurs_haqida1:kurs_haqida1.rows[0]})
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;