const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { createUserSchema, updateUserSchema, idParamSchema } = require('../validators/userValidators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', roleCheck(['admin']), userController.getUsers);
router.post('/', roleCheck(['admin']), validate(createUserSchema), userController.createUser);
router.get('/:id', validate(idParamSchema, 'params'), userController.getUserById);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', roleCheck(['admin']), validate(idParamSchema, 'params'), userController.deleteUser);

module.exports = router;
