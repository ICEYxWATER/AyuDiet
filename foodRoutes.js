import express from 'express';
import {
  getFoods,
  getFoodById,
  getCategories,
  getDoshaRecommendations,
  createFood
} from '../controllers/foodController.js';

const router = express.Router();

// Specific routes first
router.get('/categories/summary', getCategories);
router.get('/dosha/:dosha', getDoshaRecommendations);

// General collection & item routes
router.route('/')
  .get(getFoods)
  .post(createFood);

router.get('/:identifier', getFoodById);

export default router;
