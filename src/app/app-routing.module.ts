import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'recuperar-clave',
    loadChildren: () => import('./pages/recuperar-clave/recuperar-clave.module').then(m => m.RecuperarClavePageModule)
  },
  {
    path: 'crear-viaje',
    loadChildren: () => import('./pages/crear-viaje/crear-viaje.module').then(m => m.CrearViajePageModule)
  },
  {
    path: 'buscar-viaje',
    loadChildren: () => import('./pages/buscar-viaje/buscar-viaje.module').then(m => m.BuscarViajePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
