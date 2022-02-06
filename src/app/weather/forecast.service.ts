import { Injectable } from '@angular/core';
import {
  catchError,
  filter,
  map,
  mergeMap,
  Observable,
  of,
  pluck, retry,
  share,
  switchMap,
  switchMapTo,
  tap, throwError,
  toArray
} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {NotificationsService} from "../notifications/notifications.service";

interface WeatherResponse {
  list: {
    dt_txt: string;
    main: {
      temp: number;
    }
  }[]
}

@Injectable({
  providedIn: 'root'
})
export class ForecastService {
  private url = 'https://api.openweathermap.org/data/2.5/forecast'

  constructor(private http: HttpClient, private notificationsService: NotificationsService) {
  }

  getForecast() {
    return this.getCurrentLocation()
      .pipe(
        map(coords => {
          return new HttpParams()
            .set('lat', String(coords.latitude))
            .set('lon', String(coords.longitude))
            .set('units', 'metric')
            .set('appid', '2abffc245989b92332a9e71281fb7818')
        }),
        switchMap(params => this.http.get<WeatherResponse>(this.url, {params})),
        pluck('list'),
        mergeMap(value => of(...value)),
        filter((value, index) => index % 8 === 0),
        map(value => {
          return {
            dateString: value.dt_txt,
            temp: value.main.temp
          }
        }),
        toArray(),
        share()
      )
  }

  getCurrentLocation() {
    return new Observable<GeolocationCoordinates>((observer) => {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position.coords)
          observer.complete()
        },
        (err) => observer.error(err)
      )
    }).pipe(
      retry(2),
      tap(() => {
        this.notificationsService.addSuccess('Got your location')
      }),
      catchError((err) => {
        this.notificationsService.addError('Failed to get your location')
        return throwError(err)
      })
    )
  }
}
