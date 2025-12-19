import { UserRepository } from '../repositories/user.repository';
import { GroupRepository } from '../repositories/group.repository';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;
  private groupRepository: GroupRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.groupRepository = new GroupRepository();
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
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already in use');
    }
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
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.delete(id);
  }

  async getUserGroups(userId: number) {
    return await this.userRepository.getUserGroups(userId);
  }

  async addUserToGroup(userId: number, groupId: number) {

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    return await this.userRepository.addUserToGroup(userId, groupId);
  }

  async removeUserFromGroup(userId: number, groupId: number) {
    await this.userRepository.removeUserFromGroup(userId, groupId);
  }
}

