import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = 'c771a8aed69b88d5c0c9dd2c3e0945fd'; // Reemplaza con tu API Key
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) {}

  // Método para obtener el clima por coordenadas
  getWeatherForNacimiento(): Observable<any> {
    const lat = -37.5;
    const lon = -72.6667;
    const url = `${this.apiUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`;
    return this.http.get(url);
  }

  // Método para obtener el clima por ciudad
  getWeatherByCity(city: string): Observable<any> {
    const url = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric&lang=es`;
    return this.http.get(url);
  }
}
