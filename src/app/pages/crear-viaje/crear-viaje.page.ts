import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage {
  viajeData = {
    nombreConductor: '',
    apellidoConductor: '',
    destino: '',
    fecha: '',
    hora: '',
    asientosDisponibles: 0,
    precio: 0,
    pasajeros: [],
    conductorId: ''
  };

  fechaMinima: string;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.inicializarConductor();
    this.establecerFechaMinima();
  }

  establecerFechaMinima() {
    const hoy = new Date();
    // Formato YYYY-MM-DD para el input type="date"
    this.fechaMinima = hoy.toISOString().split('T')[0]; // Establecer la fecha mínima al formato adecuado
    // Establecer la fecha actual como valor por defecto
    this.viajeData.fecha = this.fechaMinima;
  }

  async inicializarConductor() {
    const user = await this.firebaseService.obtenerUsuarioActual();
    if (user) {
      const userUid = (await user).uid;
      this.viajeData.conductorId = userUid;
      
      const userDoc = await this.firebaseService.firestore
        .collection('users')
        .doc(userUid)
        .get()
        .toPromise();
      
      if (userDoc?.exists) {
        const userData = userDoc.data();
        if (userData) {
          this.viajeData.nombreConductor = userData['nombre'];
          this.viajeData.apellidoConductor = userData['apellido'];
        }
      }
    }
  }

  async ofrecerViaje() {
    if (this.validarDatos()) {
      try {
        await this.firebaseService.ofrecerViaje(this.viajeData);
        console.log('Viaje ofrecido exitosamente');
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Error al ofrecer viaje: ', error);
      }
    }
  }

  validarDatos(): boolean {
    const fechaSeleccionada = this.viajeData.fecha; // La fecha ya está en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0]; // Hoy también en formato YYYY-MM-DD
    
    if (!this.viajeData.destino || 
        !this.viajeData.fecha || 
        !this.viajeData.hora || 
        this.viajeData.asientosDisponibles <= 0 ||
        this.viajeData.precio <= 0) {
      console.error('Por favor complete todos los campos');
      return false;
    }

    if (fechaSeleccionada < hoy) {
      console.error('La fecha no puede ser anterior a hoy');
      return false;
    }

    return true;
  }
}
