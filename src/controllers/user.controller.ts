import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await this.userService.getUserById(id);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await this.userService.updateUser(id, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error: any) {
      // PROBLEMA INTENCIONAL: Não trata adequadamente quando usuário não existe
      res.status(500).json({ error: error.message });
    }
  }

  async getUserGroups(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const groups = await this.userService.getUserGroups(id);
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async addUserToGroup(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { groupId } = req.body;
      const result = await this.userService.addUserToGroup(userId, groupId);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeUserFromGroup(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { groupId } = req.body;
      await this.userService.removeUserFromGroup(userId, groupId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

