import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSearchbar } from '@ionic/angular';
import { debounceTime, distinctUntilChanged, map, takeWhile } from 'rxjs/operators';
import { ApiService, Product } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit, OnDestroy {
  products: Product[];
  private searchValue: string = '';
  private isComponentPresent: boolean;
  private itemsCount = environment.itemsCount;
  private searchValueName = 'searchValue';
  @ViewChild(IonSearchbar, { static: false }) searchBar: IonSearchbar;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    this.isComponentPresent = true;
    await this.apiService.getJSONData();
    this.watchSearchbarInput();
  }

  async ionViewDidEnter() {
    this.searchValue = (await this.storageService.get(this.searchValueName)) || '';
    this.products = this.apiService.getFilteredProducts(undefined, undefined, this.searchValue);
    if (this.searchValue.length) {
      (await this.searchBar.getInputElement()).value = this.searchValue;
      await this.searchBar.setFocus();
    }
  }

  ngOnDestroy(): void {
    this.isComponentPresent = false;
  }

  loadData(event) {
    this.products = [
      ...this.products,
      ...this.apiService.getFilteredProducts(
        this.products.length,
        this.products.length + this.itemsCount,
        this.searchValue
      ),
    ];
    event.target.complete();
    if (this.products.length === this.apiService.data.length) {
      event.target.disabled = true;
    }
  }

  private watchSearchbarInput(): void {
    this.searchBar.ionChange
      .pipe(
        takeWhile(() => this.isComponentPresent),
        map((event) => (event.target as HTMLInputElement).value.trim()),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.searchValue = value;
        this.storageService.set(this.searchValueName, value);
        this.products = this.apiService.getFilteredProducts(undefined, undefined, value);
      });
  }

  showProduct(product: Product): void {
    this.router.navigate(['/products', product.upc]);
  }

  trackByFunc(index, item: Product) {
    return item.upc;
  }
}
