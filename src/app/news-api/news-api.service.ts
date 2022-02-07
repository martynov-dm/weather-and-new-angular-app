import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, pluck, Subject, switchMap, tap, throwError} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {NotificationsService} from "../notifications/notifications.service";

export interface Article {
  title: string
  url: string
  source: string
}

interface NewsApiResponse {
  pagination: { total: number }
  data: Article[]
}

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {
  private url = 'http://api.mediastack.com/v1/news'
  private limit = 10
  private apiKey = 'f2dacfcf98e9db4425d2e46bf3c4c9a8'
  private source = 'bbc'

  isLoading!: BehaviorSubject<boolean>
  pagesInput!: Subject<number>
  pagesOutput!: Observable<Article[]>
  numberOfPages!: Subject<number>

  constructor(private http: HttpClient, private notificationsService: NotificationsService) {
    this.numberOfPages = new Subject()

    this.pagesInput = new Subject()
    this.isLoading = new BehaviorSubject<boolean>(false)
    this.pagesOutput = this.pagesInput.pipe(
      tap(() => this.isLoading.next(true)),
      map((offset) => {
        return new HttpParams()
          .set('access_key', this.apiKey)
          .set('sources', this.source)
          .set('limit', this.limit)
          .set('offset', offset)
      }),
      switchMap((params) => {
        return this.http.get<NewsApiResponse>(this.url, { params })
      }),
      tap(response => {
        const totalPages = Math.ceil(response.pagination.total / this.limit)
        this.numberOfPages.next(totalPages)
        this.isLoading.next(false)
      }),
      tap(() => {
        this.notificationsService.addSuccess(`Got news`)
      }),
      catchError((err) => {
        this.notificationsService.addError('Failed to get news')
        return throwError(err)
      }),
      pluck('data')
    )
  }

   getPage(page: number) {
    this.pagesInput.next((page - 1) * 10)
  }
}
