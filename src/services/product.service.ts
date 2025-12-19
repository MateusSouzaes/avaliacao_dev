import { ProductRepository } from '../repositories/product.repository';
import { GroupRepository } from '../repositories/group.repository';

export class ProductService {
  private productRepository: ProductRepository;
  private groupRepository: GroupRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.groupRepository = new GroupRepository();
  }

  async getAllProducts() {
    return await this.productRepository.findAll();
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    groupId?: number;
  }) {
    if (data.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    if (data.groupId) {
      const group = await this.groupRepository.findById(data.groupId);
      if (!group) {
        throw new Error('Group not found');
      }
    }

    return await this.productRepository.create(data);
  }

  async updateProduct(id: number, data: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    groupId: number;
  }>) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (data.price !== undefined && data.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }
    if (data.groupId !== undefined) {
      const group = await this.groupRepository.findById(data.groupId);
      if (!group) {
        throw new Error('Group not found');
      }
    }

    return await this.productRepository.update(id, data);
  }

  async deleteProduct(id: number) {
    await this.productRepository.delete(id);
  }

  async searchProducts(searchTerm: string) {
    return await this.productRepository.searchByName(searchTerm);
  }

  async getProductsByGroup(groupId: number) {
    return await this.productRepository.findByGroup(groupId);
  }
}

