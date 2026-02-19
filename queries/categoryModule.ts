import api from "@/providers/axios";
import { Category } from "@/types/types";

export type newCategory = Omit<Category, "id" | "createdAt" | "updatedAt" | "type">;
class CategoryQueries {
  route = "/request";

  // ============================
  //       CATEGORY ROUTES
  // ============================

  // GET /request/category
  getCategories = async (): Promise<{ data: Category[] }> => {
    return api.get(`${this.route}/category`).then((res) => res.data);
  };

  // POST /request/category
  createCategory = async (
    data: newCategory
  ): Promise<{ message: string; data: Category }> => {
    return api.post(`${this.route}/category`, data).then((res) => res.data);
  };

  // GET /request/category/{id}
  getCategory = async (id: number): Promise<{ data: Category }> => {
    return api.get(`${this.route}/category/${id}`).then((res) => res.data);
  };

  // PUT /request/category/{id}
  updateCategory = async (
    id: number,
    data: Partial<Category>
  ): Promise<{ data: Category }> => {
    return api
      .put(`${this.route}/category/${id}`, data)
      .then((res) => res.data);
  };

  // GET /request/category/{id}/children
  getCategoryChildren = async (id: number): Promise<{ data: Category[] }> => {
    return api
      .get(`${this.route}/category/${id}/children`)
      .then((res) => res.data);
  };

  // GET /request/category/special
  getSpecialCategories = async (): Promise<{ data: Category[] }> => {
    return api.get(`${this.route}/category/special`).then((res) => res.data);
  };

  // GET /request/category/{id}
  deleteCategory = async (id: number): Promise<{ data: Category }> => {
    return api.delete(`${this.route}/category/${id}`).then((res) => res.data);
  };
}

export const categoryQ = new CategoryQueries();
