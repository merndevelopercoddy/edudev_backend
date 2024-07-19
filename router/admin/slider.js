const express = require("express");
const router = express.Router();
const faylSlider = require("../../middleware/faylSlider");
const pool = require("../../config/db");
const path = require("path");
const fs = require("fs");
router.get("/" , async(req , res)=>{
    try {
        const sliders = await pool.query('SELECT *  FROM sliders');
        res.render('admin/slider' , {layout:'admin' , title:'Slider' , sliders});
    } catch (error) {
        console.log(error)
    }
});

router.post('/add', faylSlider , async (req, res) => {
    const { sarlavha1, sarlavha2, sarlavha3 } = req.body;
    const filePath = req.file ? req.file.path : null;
    try {
      const result = await pool.query(
        'INSERT INTO sliders (sarlavha1, sarlavha2, sarlavha3, rasmSlider) VALUES ($1, $2, $3, $4) RETURNING *',
        [sarlavha1, sarlavha2, sarlavha3, filePath]
      );
      res.redirect('/admin/slider'); // or wherever you want to redirect after successful insert
    } catch (err) {
      console.error('Error inserting data into the database:', err);
      res.status(500).send('Server Error');
    }
  });

router.get("/:id" , async(req , res)=>{
    const id = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM sliders WHERE id = $1', [id]);
    const slider = result.rows[0];
    res.render('admin/sliderEdit', {layout:'admin' , title:'Slider' , slider});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching slider data');
  }
});


router.post('/:id', faylSlider, async (req, res) => {
    const id = req.params.id;
    const { sarlavha1, sarlavha2, sarlavha3,existingImageUrl } = req.body;
    let imageUrl = existingImageUrl;
  
    if (req.file) {
        imageUrl = `images/slider/${req.file.filename}`;
    
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
        'UPDATE sliders SET sarlavha1 = $1, sarlavha2 = $2, sarlavha3 = $3, rasmslider = $4 WHERE id = $5 RETURNING *',
        [sarlavha1, sarlavha2, sarlavha3, imageUrl, id]
      );
      res.redirect('/admin/slider');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating slider');
    }
  });

  router.post('/:id/delete', async (req, res) => {
    const { id } = req.body;
  
    if (!id || isNaN(id)) {
      return res.status(400).send('Invalid slider ID');
    }
  
    try {
      // Get the slider to delete
      const result = await pool.query('SELECT * FROM sliders WHERE id = $1', [id]);
      const slider = result.rows[0];
  
      if (!slider) {
        return res.status(404).send('Slider not found');
      }
      // Delete the image file
      const imagePath = path.join(__dirname, '../../', slider.rasmslider);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Failed to delete image: ${err.message}`);
        } else {
          console.log(`Image deleted: ${imagePath}`);
        }
      });
      // Delete the slider record from the database
      await pool.query('DELETE FROM sliders WHERE id = $1', [id]);
      res.redirect('/admin/slider');    
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting slider');
    }
  });
  
  

module.exports = router;