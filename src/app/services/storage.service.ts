import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';
import { Article } from '@interfaces';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;
  private _localArticles: Article[] = [];
  private readonly articles = 'articles';

  constructor(private storage: Storage) {
    this.init();
  }

  get localArticles() {
    return [...this._localArticles];
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    this.loadFavorites();
  }

  async saveOrRemoveArticle(article: Article) {
    const exists = this._localArticles.find(
      (localArticle) => localArticle.title === article.title
    );

    if (exists) {
      this._localArticles = this._localArticles.filter(
        (localArticle) => localArticle.title !== article.title
      );
    } else {
      this._localArticles = [article, ...this._localArticles];
    }

    this._storage.set(this.articles, this._localArticles);
  }

  async loadFavorites() {
    try {
      const articles = await this._storage.get(this.articles);
      this._localArticles = articles || [];
    } catch (error) {}
  }

  isArticleAtFavorites(article: Article) {
    return !!this._localArticles.find(
      (localArticle) => localArticle.title === article.title
    );
  }
}
