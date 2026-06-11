const express = require('express');
const auditController = require('../controllers/auditController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { z } = require('zod');

const router = express.Router();
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

router.use(authMiddleware, roleCheck(['admin']));

router.get('/', auditController.getAuditLogs);
router.get('/:id', validate(idParamSchema, 'params'), auditController.getAuditLogById);

module.exports = router;
