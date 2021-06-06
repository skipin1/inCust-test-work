import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, takeWhile } from 'rxjs/operators';
import { ApiService, Product } from 'src/app/services/api.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit, OnDestroy {
  product: Product;
  calcForm: FormGroup;
  private isComponentPresent: boolean;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.isComponentPresent = true;
    this.route.params.pipe(takeWhile(() => this.isComponentPresent)).subscribe(async (params: Params) => {
      if (!this.apiService.data) {
        await this.apiService.getJSONData();
      }
      this.product = this.apiService.getProduct(params['id']);
      this.initForm();
      this.watchFormChanges();
    });
  }

  ngOnDestroy(): void {
    this.isComponentPresent = false;
  }

  initForm(): void {
    this.calcForm = this.formBuilder.group({
      amount: [null],
      quantity: [null],
    });
  }

  watchFormChanges(): void {
    this.calcForm
      .get('amount')
      .valueChanges.pipe(
        takeWhile(() => this.isComponentPresent),
        debounceTime(350),
        distinctUntilChanged(),
        map((data) => Number(data)),
        filter((data) => !isNaN(data))
      )
      .subscribe((value) => this.calcAmount(value));

    this.calcForm
      .get('quantity')
      .valueChanges.pipe(
        takeWhile(() => this.isComponentPresent),
        debounceTime(350),
        distinctUntilChanged(),
        map((data) => Number(data)),
        filter((data) => !isNaN(data))
      )
      .subscribe((value) => this.calcQuantity(value));
  }

  calcAmount(data: number): void {
    this.calcForm
      .get('quantity')
      .patchValue(Number((data / Number(this.product.price)).toFixed(2)), { emitEvent: false });
  }
  calcQuantity(data: number): void {
    this.calcForm
      .get('amount')
      .patchValue(Number((data * Number(this.product.price)).toFixed(2)), { emitEvent: false });
  }

  setAmount(amount: number): void {
    this.calcForm.get('amount').patchValue(Number(amount));
  }

  setQuantity(qty: number): void {
    this.calcForm.get('quantity').patchValue(Number(qty));
  }
}
