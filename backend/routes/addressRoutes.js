const express = require('express');
const addressController = require('../controllers/addressController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const {
  createAddressSchema,
  updateAddressSchema,
  idParamSchema,
} = require('../validators/addressValidators');

const router = express.Router();

router.use(authMiddleware, roleCheck(['customer', 'admin']));

router.get('/', addressController.getAddresses);
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.get('/:id', validate(idParamSchema, 'params'), addressController.getAddressById);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateAddressSchema), addressController.updateAddress);
router.patch('/:id/default', validate(idParamSchema, 'params'), addressController.setDefaultAddress);
router.delete('/:id', validate(idParamSchema, 'params'), addressController.deleteAddress);

module.exports = router;
