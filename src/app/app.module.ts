import { NgModule } from '@angular/core';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';  // Importación de formularios reactivos
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

export const firebaseConfig = {
  apiKey: "AIzaSyCpGAtrRltjYrw-62LpR9KNphLMtcg0Z4M",
  authDomain: "tellevoapp-10.firebaseapp.com",
  projectId: "tellevoapp-10",
  storageBucket: "tellevoapp-10.appspot.com",
  messagingSenderId: "890426464331",
  appId: "1:890426464331:web:3f71ed4498b7e6b45f55ce",
  measurementId: "G-VS2H2ELC8T"
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    ReactiveFormsModule,  // Añadir ReactiveFormsModule aquí
    AngularFireModule.initializeApp(firebaseConfig),  // Configuración de Firebase
    AngularFirestoreModule  // Habilitar Firestore
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, SQLite],
  bootstrap: [AppComponent],
})
export class AppModule {}
