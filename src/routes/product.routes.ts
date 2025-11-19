import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validation.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getAllProducts.bind(productController));
router.get('/search', productController.searchProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));
router.post('/', validate(createProductSchema), productController.createProduct.bind(productController));
router.put('/:id', validate(updateProductSchema), productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct.bind(productController));

router.get('/group/:groupId', productController.getProductsByGroup.bind(productController));

export default router;

