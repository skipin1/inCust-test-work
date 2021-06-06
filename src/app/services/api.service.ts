import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  category: Category[];
  description: string;
  image: string;
  manufacturer: string;
  model: string;
  name: string;
  price: number;
  shipping: number;
  sku: number;
  type: 'HardGood' | 'Software';
  upc: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private _jsonURL = '../../assets/data/data.json';
  data: Product[];
  itemsCount = environment.itemsCount;

  constructor(private http: HttpClient) {}

  async getJSONData(): Promise<void> {
    this.data = await this.http.get<Product[]>(this._jsonURL).toPromise();
  }

  getFilteredProducts(start: number = 0, end: number = this.itemsCount, searchvalue: string = ''): Product[] {
    return this.data
      .filter((product) => product.name.toLowerCase().indexOf(searchvalue.toLowerCase()) > -1)
      .slice(start, end);
  }

  getProduct(upc: string): Product {
    return this.data.find((product) => product.upc === upc);
  }
}
