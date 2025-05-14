/**
 * Tests for model-registry.ts
 * 
 * This file contains tests for the model registry functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { modelRegistry, ModelTypes } from '../model-registry';
import type { Post, Page, Tribute, User, WPEntity } from '$lib/types/wp-models';
import {
  PostModel,
  PageModel,
  TributeModel,
  UserModel
} from '$lib/models/wp-backbone';

// Mock the Backbone models
vi.mock('$lib/models/wp-backbone', () => {
  const mockModel = (type: string, urlRoot: string) => {
    return class {
      attributes: Record<string, any> = {};
      id?: number | string;
      urlRoot: string;
      
      constructor(attributes: Record<string, any> = {}) {
        this.attributes = attributes;
        this.id = attributes.id;
        this.urlRoot = urlRoot;
      }
      
      get(attr: string) {
        return this.attributes[attr];
      }
      
      set(attrs: Record<string, any> | string, value?: any) {
        if (typeof attrs === 'string') {
          this.attributes[attrs] = value;
        } else {
          this.attributes = { ...this.attributes, ...attrs };
        }
        return this;
      }
      
      toJSON() {
        return { ...this.attributes, id: this.id };
      }
      
      fetch(options?: any) {
        // Set the ID in the response
        if (this.id) {
          this.attributes.id = this.id;
        }
        return Promise.resolve(this);
      }
      
      save(attrs?: any, options?: any) {
        // Ensure ID is set after save
        if (!this.id && !this.attributes.id) {
          this.id = 1;
          this.attributes.id = 1;
        }
        return Promise.resolve(this);
      }
      
      destroy(options?: any) {
        return Promise.resolve(true);
      }
      
      // Add parse method
      parse(response: any) {
        return response;
      }
    };
  };
  
  // Create mock collection class
  const mockCollection = (modelClass: any, url: string) => {
    return class {
      models: any[] = [];
      model = modelClass;
      url: string = url;
      
      constructor(models: any[] = []) {
        this.reset(models);
      }
      
      reset(models: any[] = []) {
        this.models = models.map(model => {
          if (!(model instanceof this.model)) {
            return new this.model(model);
          }
          return model;
        });
        return this;
      }
      
      at(index: number) {
        return this.models[index];
      }
      
      get length() {
        return this.models.length;
      }
      
      add(model: any) {
        if (!(model instanceof this.model)) {
          model = new this.model(model);
        }
        this.models.push(model);
        return this;
      }
      
      toJSON() {
        return this.models.map(model => model.toJSON());
      }
      
      fetch(options?: any) {
        return Promise.resolve(this);
      }
    };
  };
  
  const PostModel = mockModel('post', '/api/wp/posts');
  const PageModel = mockModel('page', '/api/wp/pages');
  const TributeModel = mockModel('tribute', '/api/tributes');
  const UserModel = mockModel('user', '/api/wp/users');
  
  return {
    PostModel,
    PageModel,
    TributeModel,
    UserModel,
    PostsCollection: mockCollection(PostModel, '/api/wp/posts'),
    PagesCollection: mockCollection(PageModel, '/api/wp/pages'),
    TributesCollection: mockCollection(TributeModel, '/api/tributes'),
    UsersCollection: mockCollection(UserModel, '/api/wp/users')
  };
});

// Mock fetch API
global.fetch = vi.fn();

describe('Model Registry', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, title: 'Test' })
    });
    
    // Clear the registry cache
    modelRegistry.clearCache();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('getModel', () => {
    it('should get a model from the registry', () => {
      const model = modelRegistry.getModel(ModelTypes.POST, 1);
      expect(model).toBeDefined();
      expect(model.id).toBe(1);
    });
    
    it('should return the same model instance for the same ID', () => {
      const model1 = modelRegistry.getModel(ModelTypes.POST, 1);
      const model2 = modelRegistry.getModel(ModelTypes.POST, 1);
      expect(model1).toBe(model2);
    });
    
    it('should update the model with new attributes', () => {
      const model = modelRegistry.getModel<Post>(ModelTypes.POST, 1, {
        title: { rendered: 'Test' } as any
      });
      expect(model.get('title').rendered).toBe('Test');
      
      modelRegistry.getModel<Post>(ModelTypes.POST, 1, {
        title: { rendered: 'Updated' } as any
      });
      expect(model.get('title').rendered).toBe('Updated');
    });
    
    it('should throw an error for unknown model types', () => {
      expect(() => {
        // @ts-ignore - Testing invalid model type
        modelRegistry.getModel('unknown', 1);
      }).toThrow();
    });
  });
  
  describe('fetchModel', () => {
    it('should fetch a model from the API', async () => {
      const model = await modelRegistry.fetchModel(ModelTypes.POST, 1);
      expect(model).toBeDefined();
      expect(model.id).toBe(1);
    });
    
    it('should cache the fetched model', async () => {
      await modelRegistry.fetchModel(ModelTypes.POST, 1);
      expect(modelRegistry.hasModel(ModelTypes.POST, 1)).toBe(true);
    });
    
    it('should handle fetch errors', async () => {
      // Mock a failed fetch
      (global.fetch as any).mockRejectedValueOnce(new Error('Fetch error'));
      
      await expect(modelRegistry.fetchModel(ModelTypes.POST, 1)).rejects.toThrow();
    });
  });
  
  describe('saveModel', () => {
    it('should save a model to the API', async () => {
      const model = await modelRegistry.saveModel<Post>(ModelTypes.POST, {
        title: { rendered: 'Test' },
        content: { rendered: 'Content' },
        excerpt: { rendered: '' },
        author: 1,
        status: 'draft'
      } as Partial<Post>);
      
      expect(model).toBeDefined();
      expect(model.title?.rendered).toBe('Test');
    });
    
    it('should update an existing model', async () => {
      // First, get a model
      modelRegistry.getModel<Post>(ModelTypes.POST, 1, {
        title: { rendered: 'Test' },
        content: { rendered: 'Content' }
      } as Partial<Post>);
      
      // Then, save it with updated attributes
      const updated = await modelRegistry.saveModel<Post>(ModelTypes.POST, {
        id: 1,
        title: { rendered: 'Updated' }
      } as Partial<Post>);
      
      expect(updated.title?.rendered).toBe('Updated');
    });
    
    it('should cache the saved model', async () => {
      await modelRegistry.saveModel(ModelTypes.POST, { id: 1, title: 'Test' });
      expect(modelRegistry.hasModel(ModelTypes.POST, 1)).toBe(true);
    });
    it('should handle save errors', async () => {
      // Mock a failed save
      vi.spyOn(PostModel.prototype, 'save').mockRejectedValueOnce(new Error('Save error'));
      
      await expect(modelRegistry.saveModel<Post>(ModelTypes.POST, {
        title: { rendered: 'Test' },
        content: { rendered: 'Content' }
      } as Partial<Post>)).rejects.toThrow();
      await expect(modelRegistry.saveModel(ModelTypes.POST, { title: { rendered: 'Test' } } as Partial<Post>)).rejects.toThrow();
    });
  });
  
  describe('deleteModel', () => {
    it('should delete a model from the API', async () => {
      // First, get a model
      modelRegistry.getModel(ModelTypes.POST, 1);
      
      // Then, delete it
      const result = await modelRegistry.deleteModel(ModelTypes.POST, 1);
      expect(result).toBe(true);
    });
    
    it('should remove the model from the cache', async () => {
      // First, get a model
      modelRegistry.getModel(ModelTypes.POST, 1);
      
      // Then, delete it
      await modelRegistry.deleteModel(ModelTypes.POST, 1);
      expect(modelRegistry.hasModel(ModelTypes.POST, 1)).toBe(false);
    });
    
    it('should handle delete errors', async () => {
      // Mock a failed delete
      vi.spyOn(PostModel.prototype, 'destroy').mockRejectedValueOnce(new Error('Delete error'));
      
      await expect(modelRegistry.deleteModel(ModelTypes.POST, 1)).rejects.toThrow();
    });
  });
  
  describe('clearCache', () => {
    it('should clear the entire cache', () => {
      // Add some models to the cache
      modelRegistry.getModel(ModelTypes.POST, 1);
      modelRegistry.getModel(ModelTypes.PAGE, 1);
      
      // Clear the cache
      modelRegistry.clearCache();
      
      // Check that the cache is empty
      expect(modelRegistry.hasModel(ModelTypes.POST, 1)).toBe(false);
      expect(modelRegistry.hasModel(ModelTypes.PAGE, 1)).toBe(false);
    });
    
    it('should clear the cache for a specific model type', () => {
      // Add some models to the cache
      modelRegistry.getModel(ModelTypes.POST, 1);
      modelRegistry.getModel(ModelTypes.PAGE, 1);
      
      // Clear the cache for posts only
      modelRegistry.clearCache(ModelTypes.POST);
      
      // Check that only posts are cleared
      expect(modelRegistry.hasModel(ModelTypes.POST, 1)).toBe(false);
      expect(modelRegistry.hasModel(ModelTypes.PAGE, 1)).toBe(true);
    });
  });
  
  describe('getModelsOfType', () => {
    it('should get all models of a specific type', () => {
      // Add some models to the cache
      modelRegistry.getModel<Post>(ModelTypes.POST, 1, {
        title: { rendered: 'Post 1' },
        content: { rendered: 'Content 1' }
      } as Partial<Post>);
      
      modelRegistry.getModel<Post>(ModelTypes.POST, 2, {
        title: { rendered: 'Post 2' },
        content: { rendered: 'Content 2' }
      } as Partial<Post>);
      
      modelRegistry.getModel<Page>(ModelTypes.PAGE, 1, {
        title: { rendered: 'Page 1' },
        content: { rendered: 'Content' }
      } as Partial<Page>);
      
      // Get all posts
      const posts = modelRegistry.getModelsOfType<Post>(ModelTypes.POST);
      
      // Check that we got the right models
      expect(posts.length).toBe(2);
      expect(posts.some(p => p.title?.rendered === 'Post 1')).toBe(true);
      expect(posts.some(p => p.title?.rendered === 'Post 2')).toBe(true);
    });
    
    it('should return an empty array if no models of the type exist', () => {
      const models = modelRegistry.getModelsOfType(ModelTypes.TRIBUTE);
      expect(models).toEqual([]);
    });
  });
  
  describe('hasModel', () => {
    it('should check if a model exists in the cache', () => {
      // Add a model to the cache
      modelRegistry.getModel(ModelTypes.POST, 1);
      
      // Check that it exists
      expect(modelRegistry.hasModel(ModelTypes.POST, 1)).toBe(true);
      
      // Check that a non-existent model doesn't exist
      expect(modelRegistry.hasModel(ModelTypes.POST, 2)).toBe(false);
    });
  });
});