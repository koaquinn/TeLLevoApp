import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-recuperar-clave',
  templateUrl: './recuperar-clave.page.html',
  styleUrls: ['./recuperar-clave.page.scss'],
})
export class RecuperarClavePage {
  formRecuperar = {
    nombreUsuario: '',
    correoUsuario: ''
  };

  constructor(private router: Router, private firebaseService: FirebaseService) {}

  recuperarClave() {
    const correo = this.formRecuperar.correoUsuario;
    this.firebaseService.enviarCorreoRecuperacion(correo)
      .then(() => {
        console.log('Correo de recuperación enviado a:', correo);
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Error al enviar el correo de recuperación:', error);
        // Maneja el error, por ejemplo mostrando un mensaje al usuario
      });
  }
}