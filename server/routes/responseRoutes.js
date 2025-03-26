const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');

router.post('/', responseController.createResponse);
router.get('/:id', responseController.getResponseById);
router.put('/:id', responseController.updateResponse);
router.put('/:id/complete', responseController.completeResponse);

module.exports = router; 