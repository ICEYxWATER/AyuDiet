import express from 'express';
import {
  getFoods,
  getFoodById,
  getCategories,
  getDoshaRecommendations,
  createFood,
  updateFood,
  deleteFood
} from './foodController.js';
import { requirePractitioner } from './auth.js';

const router = express.Router();

// Public Read-Only Routes (Accessible by Frontend Clients / Patients)
router.get('/categories/summary', getCategories);
router.get('/dosha/:dosha', getDoshaRecommendations);
router.get('/', getFoods);
router.get('/:identifier', getFoodById);

// Protected Mutation Routes (ONLY Authorized Practitioners / Admins at Backend)
router.post('/', requirePractitioner, createFood);
router.put('/:identifier', requirePractitioner, updateFood);
router.delete('/:identifier', requirePractitioner, deleteFood);

export default router;
