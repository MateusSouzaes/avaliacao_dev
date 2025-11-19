import { Request, Response } from 'express';
import { GroupService } from '../services/group.service';

export class GroupController {
  private groupService: GroupService;

  constructor() {
    this.groupService = new GroupService();
  }

  async getAllGroups(req: Request, res: Response) {
    try {
      const groups = await this.groupService.getAllGroups();
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getGroupById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const group = await this.groupService.getGroupById(id);
      res.json(group);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createGroup(req: Request, res: Response) {
    try {
      const group = await this.groupService.createGroup(req.body);
      res.status(201).json(group);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateGroup(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const group = await this.groupService.updateGroup(id, req.body);
      res.json(group);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteGroup(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.groupService.deleteGroup(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getGroupUsers(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const users = await this.groupService.getGroupUsers(id);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

