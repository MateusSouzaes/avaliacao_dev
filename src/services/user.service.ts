import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
  }) {
    // PROBLEMA INTENCIONAL: Falta validação de email duplicado antes de criar
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: 'user',
    });
  }

  async updateUser(id: number, data: Partial<{
    name: string;
    email: string;
    password: string;
    active: boolean;
  }>) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // PROBLEMA INTENCIONAL: Permite atualizar senha sem hash
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return await this.userRepository.update(id, data);
  }

  async updateUserRole(id: number, role: 'admin' | 'user' | 'viewer') {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
  
    return await this.userRepository.update(id, { role });
  }

  async deleteUser(id: number) {
    // PROBLEMA INTENCIONAL: Não verifica se usuário existe antes de deletar
    await this.userRepository.delete(id);
  }

  async getUserGroups(userId: number) {
    return await this.userRepository.getUserGroups(userId);
  }

  async addUserToGroup(userId: number, groupId: number) {
    // PROBLEMA INTENCIONAL: Não valida se usuário ou grupo existem
    return await this.userRepository.addUserToGroup(userId, groupId);
  }

  async removeUserFromGroup(userId: number, groupId: number) {
    await this.userRepository.removeUserFromGroup(userId, groupId);
  }
}

