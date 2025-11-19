import { db } from '../database/connection';
import { products, groups } from '../database/schema';
import { eq, sql } from 'drizzle-orm';

export class ProductRepository {
  async findAll() {
    return await db.select().from(products);
  }

  async findById(id: number) {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    groupId?: number;
  }) {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    groupId: number;
  }>) {
    const result = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number) {
    await db.delete(products).where(eq(products.id, id));
  }

  // PROBLEMA INTENCIONAL: SQL Injection potencial e falta de validação
  async searchByName(searchTerm: string) {
    const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`;
    return await db.execute(sql.raw(query));
  }

  async findByGroup(groupId: number) {
    return await db
      .select()
      .from(products)
      .where(eq(products.groupId, groupId));
  }
}

