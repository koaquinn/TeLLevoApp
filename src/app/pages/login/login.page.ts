import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';  // Importamos el servicio de Firebase
import { AlertController } from '@ionic/angular';  // Para mostrar alertas

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  formLogin = {
    correo: '',  // Usamos correo para la autenticación
    password: ''
  };
  loading = false;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,  // Inyectamos el servicio Firebase
    private alertController: AlertController  // Para mostrar mensajes de error
  ) {}

  async iniciarSesion() {
    const { correo, password } = this.formLogin;  // Extraemos los valores del formulario

    if (!correo || !password) {
      this.mostrarAlerta('Error', 'Por favor ingresa correo y contraseña.');
      return;
    }

    this.loading = true;

    try {
      // Validación del inicio de sesión con Firebase
      const userCredential = await this.firebaseService.login(correo, password);
      console.log('Usuario autenticado:', userCredential.user);
      this.router.navigate(['/home']);  // Navega a la página principal después del login exitoso
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      this.mostrarAlerta('Error', 'Correo o contraseña incorrectos.');
    } finally {
      this.loading = false;
    }
  }

  navegarRegistro() {
    if (!this.loading) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/registro']);
      }, 1500);
    }
  }

  // Método para mostrar alertas
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }
}
