import { db } from '../database/connection';
import { groups, userGroups, users } from '../database/schema';
import { eq } from 'drizzle-orm';

export class GroupRepository {
  async findAll() {
    return await db.select().from(groups);
  }

  async findById(id: number) {
    const result = await db.select().from(groups).where(eq(groups.id, id));
    return result[0];
  }

  async create(data: { name: string; description?: string }) {
    const result = await db.insert(groups).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<{ name: string; description: string }>) {
    const result = await db
      .update(groups)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number) {
    await db.delete(groups).where(eq(groups.id, id));
  }

  async getGroupUsers(groupId: number) {
    const userGroupRecords = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.groupId, groupId));

    const userIds = userGroupRecords.map(ug => ug.userId);
    
    // PROBLEMA INTENCIONAL: N+1 Query Problem
    const groupUsers = [];
    for (const userId of userIds) {
      const user = await db.select().from(users).where(eq(users.id, userId));
      groupUsers.push(user[0]);
    }
    
    return groupUsers;
  }
}

