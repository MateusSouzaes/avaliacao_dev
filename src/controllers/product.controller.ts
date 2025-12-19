import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productService.getProductById(id);
      res.json(product);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productService.updateProduct(id, req.body);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.productService.deleteProduct(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchProducts(req: Request, res: Response) {
    try {
      const { searchTerm } = req.query;
      if (typeof searchTerm !== 'string' || !searchTerm.trim()) {
        return res.status(400).json({ error: 'searchTerm is required' });
      }
      const term = searchTerm.trim();
      const products = await this.productService.searchProducts(term);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProductsByGroup(req: Request, res: Response) {
    try {
      const groupId = parseInt(req.params.groupId);
      const products = await this.productService.getProductsByGroup(groupId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

