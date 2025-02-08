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
  count: number = 1;
  countInCart: number = 0;
  cart: CartType | null = null;

  constructor(private favoriteService: FavoriteService,
              private cartService: CartService,) { }

  ngOnInit(): void {
    // this.favoriteService.getFavorites()
    //   .subscribe((data: FavoriteType[] | DefaultResponseType) => {
    //     //(data as DefaultResponseType) !== undefined  это в условии не работает
    //     if ((data as DefaultResponseType).error !== undefined) {
    //       const error = (data as DefaultResponseType).message;
    //       throw new Error(error);
    //     }
    //     if (this.cart && this.cart.items.length > 0) {
    //       this.products = (data as FavoriteType[]).map(product => {
    //         if (this.cart) {
    //           const productInCart = this.cart.items.find(item => item.product.id === product.id);
    //           if (productInCart) {
    //             product.countInCart = productInCart.quantity;
    //           }
    //         }
    //         return product;
    //       });
    //
    //     }
    //   });

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
            if (this.cart && this.cart.items.length > 0) {
              this.products = (data as FavoriteType[]).map(product => {
                if (this.cart) {
                  const productInCart = this.cart.items.find(item => item.product.id === product.id);
                  if (productInCart) {
                    product.countInCart = productInCart.quantity;
                    this.count = product.countInCart;
                  }
                }
                return product;
              });

            }
          });
      });
  }

  addToCart(): void {
    // this.cartService.updateCart(this.product.id, this.count)
    //   .subscribe((data: CartType | DefaultResponseType) => {
    //     if ((data as DefaultResponseType).error !== undefined) {
    //       throw new Error((data as DefaultResponseType).message);
    //     }
    //     this.countInCart = this.count;
    //   })
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
  updateCount(value: number) {
    // this.count = value;
    // if (this.product.countInCart) {
    //   this.cartService.updateCart(this.product.id, this.count)
    //     .subscribe((data: CartType | DefaultResponseType) => {
    //       if ((data as DefaultResponseType).error !== undefined) {
    //         throw new Error((data as DefaultResponseType).message);
    //       }
    //       this.product.countInCart = this.count;
    //     })
    // }
  }

}
