import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable, pluck, Subject, switchMap, tap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";

export interface Article {
  title: string
  url: string
  source: {
    name: string
  }
}

interface NewsApiResponse {
  totalResults: number
  articles: Article[]
}

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {
  private url = 'https://newsapi.org/v2/top-headlines'
  private pageSize = 10
  private apiKey = '4ef8f2d30bdf4ab891897f99d2edc254'
  private country = 'ru'

  isLoading!: BehaviorSubject<boolean>
  pagesInput!: Subject<number>
  pagesOutput!: Observable<Article[]>
  numberOfPages!: Subject<number>

  constructor(private http: HttpClient) {
    this.numberOfPages = new Subject()

    this.pagesInput = new Subject()
    this.isLoading = new BehaviorSubject<boolean>(false)
    this.pagesOutput = this.pagesInput.pipe(
      tap(() => this.isLoading.next(true)),
      map((page) => {
        return new HttpParams()
          .set('apiKey', this.apiKey)
          .set('country', this.country)
          .set('pageSize', this.pageSize)
          .set('page', page)
      }),
      switchMap((params) => {
        return this.http.get<NewsApiResponse>(this.url, { params })
      }),
      tap(response => {
        const totalPages = Math.ceil(response.totalResults / this.pageSize)
        this.numberOfPages.next(totalPages)
        this.isLoading.next(false)
      }),
      pluck('articles')
    )
  }

   getPage(page: number) {
    this.pagesInput.next(page)
  }
}
