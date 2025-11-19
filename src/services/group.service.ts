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
    // PROBLEMA INTENCIONAL: Não valida se grupo com mesmo nome já existe
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
    // PROBLEMA INTENCIONAL: Deleta grupo sem verificar se há produtos associados
    await this.groupRepository.delete(id);
  }

  async getGroupUsers(groupId: number) {
    return await this.groupRepository.getGroupUsers(groupId);
  }
}

