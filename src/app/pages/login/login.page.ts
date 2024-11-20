import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  formLogin = {
    correo: '',
    password: ''
  };
  loading = false;


  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private alertController: AlertController
  ) {}


  async iniciarSesion() {
    const { correo, password } = this.formLogin;


    if (!correo || !password) {
      this.mostrarAlerta('Error', 'Por favor ingresa correo y contraseña.');
      return;
    }


    this.loading = true;


    try {
      // Validar inicio de sesión con Firebase
      const userCredential = await this.firebaseService.login(correo, password);
      const user = userCredential.user;


      // Verificar si el usuario tiene el correo electrónico verificado
      if (!user.emailVerified) {
        this.mostrarAlerta('Error', 'Debes verificar tu correo electrónico antes de iniciar sesión.');
        return;
      }


      console.log('Usuario autenticado:', user);
      this.router.navigate(['/home']); // Navegar a la página principal después del login exitoso
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


  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });


    await alert.present();
  }
}



