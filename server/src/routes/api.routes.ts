import express from 'express';
import * as apiController from '../controllers/api.controller.js';

const router = express.Router();

router.get('/requests', apiController.getRequests);
router.get('/supporters', apiController.getSupporters);
router.get('/stats', apiController.getStats);
router.get('/infrastructure', apiController.getInfrastructure);
router.post('/requests/:id/assign', apiController.assignSupporter);

export default router;
