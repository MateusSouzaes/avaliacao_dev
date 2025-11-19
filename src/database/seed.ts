import { db } from './connection';
import { users, groups, products, userGroups } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  // Limpar dados existentes
  await db.delete(userGroups);
  await db.delete(products);
  await db.delete(groups);
  await db.delete(users);

  // Criar usuários
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const [admin] = await db.insert(users).values({
    name: 'Admin',
    email: 'admin@test.com',
    password: hashedPassword,
    role: 'admin',
    active: true,
  }).returning();

  const [user1] = await db.insert(users).values({
    name: 'Usuário 1',
    email: 'user1@test.com',
    password: hashedPassword,
    role: 'user',
    active: true,
  }).returning();

  const [user2] = await db.insert(users).values({
    name: 'Usuário 2',
    email: 'user2@test.com',
    password: hashedPassword,
    role: 'viewer',
    active: true,
  }).returning();

  // Criar grupos
  const [group1] = await db.insert(groups).values({
    name: 'Grupo A',
    description: 'Descrição do Grupo A',
  }).returning();

  const [group2] = await db.insert(groups).values({
    name: 'Grupo B',
    description: 'Descrição do Grupo B',
  }).returning();

  // Associar usuários a grupos
  await db.insert(userGroups).values({
    userId: admin.id,
    groupId: group1.id,
  });

  await db.insert(userGroups).values({
    userId: user1.id,
    groupId: group1.id,
  });

  await db.insert(userGroups).values({
    userId: user2.id,
    groupId: group2.id,
  });

  // Criar produtos
  await db.insert(products).values({
    name: 'Produto 1',
    description: 'Descrição do Produto 1',
    price: 10000, // em centavos
    stock: 10,
    groupId: group1.id,
  });

  await db.insert(products).values({
    name: 'Produto 2',
    description: 'Descrição do Produto 2',
    price: 20000,
    stock: 5,
    groupId: group1.id,
  });

  await db.insert(products).values({
    name: 'Produto 3',
    description: 'Descrição do Produto 3',
    price: 30000,
    stock: 0,
    groupId: group2.id,
  });

  console.log('Database seeded successfully!');
  console.log('\nUsuários criados:');
  console.log('- admin@test.com / 123456 (admin)');
  console.log('- user1@test.com / 123456 (user)');
  console.log('- user2@test.com / 123456 (viewer)');
}

seed()
  .then(() => {
    console.log('Seed completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });

