import { db } from '../database/connection';
import { users, userGroups, groups } from '../database/schema';
import { eq, and } from 'drizzle-orm';

export class UserRepository {
  async findAll() {
    return await db.select().from(users);
  }

  async findById(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const result = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as any,
      })
      .returning();
    return result[0];
  }

  async update(id: number, data: Partial<{
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user' | 'viewer';
    active: boolean;
  }>) {
    const result = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number) {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserGroups(userId: number) {
    return await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.userId, userId));
  }

  async addUserToGroup(userId: number, groupId: number) {
    const result = await db
      .insert(userGroups)
      .values({ userId, groupId })
      .returning();
    return result[0];
  }

  async removeUserFromGroup(userId: number, groupId: number) {
    // PROBLEMA INTENCIONAL: Não verifica se a relação existe antes de deletar
    await db
      .delete(userGroups)
      .where(and(eq(userGroups.userId, userId), eq(userGroups.groupId, groupId)));
  }
}

