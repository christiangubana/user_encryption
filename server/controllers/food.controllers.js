// controllers/food.controller.js
const Food = require("../models/food.model");
const multer = require("multer");

// Multer storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); // Destination folder for storing uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

// Initialize Multer with the storage settings
const upload = multer({ storage: storage }).single("image");

exports.addFood = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Image upload failed", error: err });
    }
    try {
      const { title, description } = req.body;
      const image = req.file ? req.file.path : ""; // If image uploaded, set image path, otherwise empty string
      const food = new Food({ title, description, image });
      await food.save();
      res.status(201).json({ message: "Food item added successfully", food });
    } catch (error) {
      next(error);
    }
  });
};

exports.updateFood = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Image upload failed", error: err });
    }
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      let updatedFoodData = { title, description };
      if (req.file) {
        updatedFoodData.image = req.file.path; // Update image if new image is uploaded
      }
      const updatedFood = await Food.findByIdAndUpdate(id, updatedFoodData, {
        new: true,
      });
      if (!updatedFood) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json({
        message: "Food item updated successfully",
        food: updatedFood,
      });
    } catch (error) {
      next(error);
    }
  });
};

exports.deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedFood = await Food.findByIdAndDelete(id);
    if (!deletedFood) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getAllFood = async (req, res, next) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    next(error);
  }
};
