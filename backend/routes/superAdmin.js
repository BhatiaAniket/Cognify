const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

// Apply protection and authorization to all routes
router.use(protect);
router.use(authorize('super_admin'));

// Overview
router.get('/overview', superAdminController.getOverview);

// Companies
router.get('/companies', superAdminController.getCompanies);
router.get('/companies/:id', superAdminController.getCompanyDetail);
router.patch('/companies/:id/suspend', superAdminController.suspendCompany);
router.patch('/companies/:id/activate', superAdminController.activateCompany);
router.delete('/companies/:id', superAdminController.deleteCompany);

// Subscriptions
router.get('/subscriptions', superAdminController.getSubscriptions);
router.patch('/subscriptions/:id', superAdminController.updateSubscription);

// Plans
router.get('/plans', superAdminController.getPlans);
router.post('/plans', superAdminController.createPlan);
router.patch('/plans/:id', superAdminController.updatePlan);

// Analytics
router.get('/analytics', superAdminController.getAnalytics);

module.exports = router;
