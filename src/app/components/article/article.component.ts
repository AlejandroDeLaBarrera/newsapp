import { Component, Input, OnInit } from '@angular/core';
import {
  ActionSheetButton,
  ActionSheetController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { Article } from '@interfaces';

import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { StorageService } from '@services';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent {
  @Input() index: number;
  @Input() article: Article;

  constructor(
    private iab: InAppBrowser,
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private socialSharing: SocialSharing,
    private storageService: StorageService,
    private toastController: ToastController
  ) {}

  openArticle() {
    if (this.platform.is('ios') || this.platform.is('android')) {
      const browser = this.iab.create(this.article.url);
      browser.show();
      return;
    }

    window.open(this.article.url, '_blank');
  }

  async onOpenMenu() {
    const articleAtFavorite = this.storageService.isArticleAtFavorites(
      this.article
    );
    const buttons: ActionSheetButton[] = [
      {
        text: articleAtFavorite ? 'Remover favorito' : 'Favorito',
        icon: articleAtFavorite ? 'heart' : 'heart-outline',
        handler: () => this.onToogleFavorite(),
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel',
      },
    ];

    const share: ActionSheetButton = {
      text: 'Compartir',
      icon: 'share-outline',
      handler: () => this.onShareArticle(),
    };

    if (this.platform.is('capacitor') || navigator.share) {
      buttons.unshift(share);
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons,
    });

    await actionSheet.present();
  }

  onShareArticle() {
    const { title, source, url } = this.article;

    if (this.platform.is('capacitor')) {
      this.socialSharing.share(title, source.name, null, url);
    }

    if (navigator.share) {
      navigator.share({ title, text: source.name, url });
    }
  }

  async onToogleFavorite() {
    await this.storageService.saveOrRemoveArticle(this.article);

    const isFavorite = this.storageService.isArticleAtFavorites(this.article);

    if (isFavorite) {
      this.presentToast('Agregado a favoritos');
    } else {
      this.presentToast('Removido de favoritos');
    }
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      mode: 'ios'
    });
    toast.present();
  }
}
