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
    // PROBLEMA INTENCIONAL: Não valida se grupo existe quando groupId é fornecido
    // PROBLEMA INTENCIONAL: Não valida se price é negativo
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

    // PROBLEMA INTENCIONAL: Permite atualizar estoque para negativo
    return await this.productRepository.update(id, data);
  }

  async deleteProduct(id: number) {
    await this.productRepository.delete(id);
  }

  async searchProducts(searchTerm: string) {
    // PROBLEMA INTENCIONAL: Usa método com SQL injection potencial
    return await this.productRepository.searchByName(searchTerm);
  }

  async getProductsByGroup(groupId: number) {
    return await this.productRepository.findByGroup(groupId);
  }
}

