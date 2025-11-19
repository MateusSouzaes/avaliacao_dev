import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.post('/', validate(createUserSchema), userController.createUser.bind(userController));
router.put('/:id', validate(updateUserSchema), userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

router.get('/:id/groups', userController.getUserGroups.bind(userController));
router.post('/:id/groups', userController.addUserToGroup.bind(userController));
router.delete('/:id/groups', userController.removeUserFromGroup.bind(userController));

export default router;

