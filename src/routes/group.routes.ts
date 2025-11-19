import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { validate } from '../middleware/validation.middleware';
import { createGroupSchema, updateGroupSchema } from '../validators/group.validator';

const router = Router();
const groupController = new GroupController();

router.get('/', groupController.getAllGroups.bind(groupController));
router.get('/:id', groupController.getGroupById.bind(groupController));
router.post('/', validate(createGroupSchema), groupController.createGroup.bind(groupController));
router.put('/:id', validate(updateGroupSchema), groupController.updateGroup.bind(groupController));
router.delete('/:id', groupController.deleteGroup.bind(groupController));

router.get('/:id/users', groupController.getGroupUsers.bind(groupController));

export default router;

