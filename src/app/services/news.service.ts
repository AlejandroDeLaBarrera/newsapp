import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Article, ArticlesByCategoryAndPage, NewsResponse } from '@interfaces';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { storedArticlesByCategory } from '@data';

const apiUrl = environment.apiUrl;
const apiKey = environment.apiKey;
@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private articlesByCategoryAndPage: ArticlesByCategoryAndPage = storedArticlesByCategory;

  constructor(private http: HttpClient) {}

  getTopHeadlines(): Observable<Article[]> {
    return this.getTopHeadlinesByCategory('business');
  }

  getTopHeadlinesByCategory(
    category: string,
    loadMore = false
  ): Observable<Article[]> {
    return of(this.articlesByCategoryAndPage[category].articles);
    // if (loadMore) {
    //   return this.getArticlesByCategory(category);
    // }

    // if (this.articlesByCategoryAndPage[category]) {
    //   return of(this.articlesByCategoryAndPage[category].articles);
    // }

    // return this.getArticlesByCategory(category);
  }

  private getArticlesByCategory(category: string): Observable<Article[]> {
    if (Object.keys(this.articlesByCategoryAndPage).includes(category)) {
      // Ya existe
      // this.articlesByCategoryAndPage[category].page += 0;
    } else {
      // No existe
      this.articlesByCategoryAndPage[category] = {
        page: 0,
        articles: [],
      };
    }

    const page = this.articlesByCategoryAndPage[category].page + 1;

    return this.executeQuery<NewsResponse>(
      `/top-headlines?category=${category}&${page}`
    ).pipe(
      map(({ articles }) => {
        if (articles.length === 0) {
          return this.articlesByCategoryAndPage[category].articles;
        }

        this.articlesByCategoryAndPage[category] = {
          page,
          articles: [
            ...this.articlesByCategoryAndPage[category].articles,
            ...articles,
          ],
        };
        return this.articlesByCategoryAndPage[category].articles;
      })
    );
  }

  private executeQuery<T>(endpoint: string) {
    console.log('Peticion HTTP realizada');
    return this.http.get<T>(`${apiUrl}${endpoint}`, {
      params: {
        apiKey,
        country: 'us',
      },
    });
  }
}
