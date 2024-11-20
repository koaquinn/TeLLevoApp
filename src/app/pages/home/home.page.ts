import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  nombreUsuario: string = '';
  apellidoUsuario: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    // Verificar el estado de autenticación inmediatamente en el constructor
    this.auth.user.subscribe(user => {
      if (user) {
        // Consultar los datos del usuario en Firestore
        this.firestore
          .collection('users')
          .doc(user.uid)  // Usar el UID del usuario
          .valueChanges()
          .subscribe((userData: any) => {
            if (userData && userData.nombre && userData.apellido) {
              this.nombreUsuario = userData.nombre;
              this.apellidoUsuario = userData.apellido; // Asignamos el apellido
              console.log('Nombre de usuario obtenido:', this.nombreUsuario);
              console.log('Apellido de usuario obtenido:', this.apellidoUsuario); // Para depurar
            } else {
              this.nombreUsuario = 'Usuario';
              this.apellidoUsuario = '';  // Si no hay apellido, dejamos el campo vacío
              console.log('No se encontraron datos del usuario');
            }
          }, error => {
            console.error('Error al obtener datos:', error);
            this.nombreUsuario = 'Usuario';
            this.apellidoUsuario = ''; // Si hay error, dejamos el apellido vacío
          });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
  ngOnInit() {}

  async logout() {
    try {
      await this.firebaseService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}