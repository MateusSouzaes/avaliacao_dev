import { GroupRepository } from '../repositories/group.repository';
import { ProductRepository } from '../repositories/product.repository';

export class GroupService {
  private groupRepository: GroupRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.groupRepository = new GroupRepository();
    this.productRepository = new ProductRepository();
  }

  async getAllGroups() {
    return await this.groupRepository.findAll();
  }

  async getGroupById(id: number) {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new Error('Group not found');
    }
    return group;
  }

  async createGroup(data: { name: string; description?: string }) {
    const group = await this.groupRepository.findByName(data.name);
    if (group) {
      throw new Error('Group name already in use');
    }
    return await this.groupRepository.create(data);
  }

  async updateGroup(id: number, data: Partial<{ name: string; description: string }>) {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new Error('Group not found');
    }

    return await this.groupRepository.update(id, data);
  }

  async deleteGroup(id: number) {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new Error('Group not found');
    }
    const products = await this.productRepository.findByGroup(id);
    if (products.length > 0) {
      throw new Error('Cannot delete group with associated products');
    }
    await this.groupRepository.delete(id);
  }

  async getGroupUsers(groupId: number) {
    return await this.groupRepository.getGroupUsers(groupId);
  }
}

