import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  registerForm!: FormGroup;
  loading = false;

  constructor(
    private router: Router, 
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      rut: ['', [Validators.required, this.rutValidator.bind(this)]],  
      correo: ['', [Validators.required, Validators.email]],  
      password: ['', [Validators.required, Validators.minLength(6)]],  
      carrera: ['', [Validators.required]]  
    });
  }

  rutValidator(control: AbstractControl) {
    const rut = control.value;
    if (!rut || !this.validarRut(rut)) {
      return { invalidRut: true };
    }
    return null;
  }

  validarRut(rut: string): boolean {
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    const rutRegex = /^[0-9]+[0-9kK]{1}$/;
    if (!rutRegex.test(rut)) return false;

    const dv = rut.charAt(rut.length - 1).toLowerCase();
    const rutBody = rut.substring(0, rut.length - 1);
    return this.validarDigitoVerificador(rutBody, dv);
  }

  validarDigitoVerificador(rutBody: string, dv: string): boolean {
    let suma = 0;
    let factor = 2;
    for (let i = rutBody.length - 1; i >= 0; i--) {
      suma += parseInt(rutBody[i]) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }

    const expectedDv = 11 - (suma % 11);
    const expectedDvString = expectedDv === 11 ? '0' : expectedDv === 10 ? 'k' : expectedDv.toString();
    return dv === expectedDvString;
  }

  async completarRegistro() {
    if (this.registerForm.invalid) {
      this.showAlert('Error', 'Por favor, complete todos los campos correctamente.');
      return;
    }

    this.loading = true;
    
    const { correo, password, nombre, apellido, rut, carrera } = this.registerForm.value;

    try {
      // Registro del usuario en Firebase Authentication
      const userCredential = await this.firebaseService.register(correo, password);
      const user = userCredential.user;

      // Enviar correo de verificación
      await user.sendEmailVerification();

      // Guardar datos adicionales en Firestore
      await this.firebaseService.firestore.collection('users').doc(user.uid).set({
        nombre,
        apellido,
        rut,
        correo,
        carrera,
        verificado: false
      });

      this.showAlert('Registro exitoso', 'Se ha enviado un correo de verificación. Por favor, revisa tu bandeja de entrada.');
      this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      
      // Manejo de errores específicos de Firebase
      let errorMessage = 'No se pudo completar el registro. Inténtalo de nuevo.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está registrado.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil.';
      }
      
      this.showAlert('Error', errorMessage);
    } finally {
      this.loading = false;
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.completarRegistro();
    } else {
      this.showAlert('Error', 'Por favor, complete todos los campos correctamente.');
    }
  }
}