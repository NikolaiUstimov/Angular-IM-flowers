import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteType[] = [];
  serverStaticPath: string = environment.serverStaticPath;
  cart: CartType | null = null;

  constructor(private favoriteService: FavoriteService,
              private cartService: CartService,) { }

  ngOnInit(): void {

    //Получение количества товара в корзине
    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = (data as CartType);

        this.favoriteService.getFavorites()
          .subscribe((data: FavoriteType[] | DefaultResponseType) => {
            //(data as DefaultResponseType) !== undefined  это в условии не работает
            if ((data as DefaultResponseType).error !== undefined) {
              const error = (data as DefaultResponseType).message;
              throw new Error(error);
            }
            this.products = (data as FavoriteType[]).map(product => {
              const productInCart = this.cart?.items.find(item => item.product.id === product.id);
              product.inCart = false;
              if (productInCart) {
                product.countInCart = productInCart.quantity;
                product.inCart = true;
              }
              return product;
            });
            console.log(this.products);
          });
      });
  }

  addToCart(productId: string): void {
    const product = this.products.find(product => product.id === productId);
    if (!product) return;

    this.cartService.updateCart(productId, product.countInCart ? product.countInCart : 1)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        product.inCart = true;
      });
  }

  removeFromCart(productId: string): void {
    this.cartService.updateCart(productId, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        const product = this.products.find(product => product.id === productId);
        if (product) {
          product.countInCart = 0;
          product.inCart = false;
        }
      })
  }

  removeFromFavorites(id: string): void {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          //..
          throw new Error(data.message);
        }

        //Удаляем из массива продукт по его id
        this.products = this.products.filter(item => item.id !== id);
      });
  }

  //Обновление количества товара
  updateCount(productId: string, quantity: number): void {
    const product = this.products.find(product => product.id === productId);
    if (!product) return;

    product.countInCart = quantity;
    if (product.inCart) {
      this.cartService.updateCart(productId, quantity)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
        });
    }
  }

}
