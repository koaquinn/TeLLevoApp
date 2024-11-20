import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { AlertController } from '@ionic/angular';
import { User } from '../../models/user.model';
import { Viaje } from '../../models/viaje.model';

@Component({
  selector: 'app-buscar-viaje',
  templateUrl: './buscar-viaje.page.html',
  styleUrls: ['./buscar-viaje.page.scss'],
})
export class BuscarViajePage implements OnInit {
  viajes: Viaje[] = [];
  usuarioActual: User | null = null;
  viajeActual: Viaje | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    await this.inicializarUsuario();
    this.cargarViajes();
  }

  async inicializarUsuario() {
    const user = await this.firebaseService.obtenerUsuarioActual();
    if (user) {
      const userDoc = await this.firebaseService.firestore
        .collection('users')
        .doc(user.uid)
        .get()
        .toPromise();
      
      if (userDoc?.exists) {
        this.usuarioActual = {
          uid: user.uid,
          ...(userDoc.data() as User)
        };
        if (this.usuarioActual.viajeActualId) {
          await this.obtenerViajeActual();
        }
      }
    }
  }

  cargarViajes() {
    this.firebaseService.obtenerViajes().subscribe({
      next: (data) => {
        this.viajes = data.map(doc => {
          const datos = doc.payload.doc.data();
          return {
            id: doc.payload.doc.id,
            conductorId: datos['conductorId'],
            nombreConductor: datos['nombreConductor'],
            apellidoConductor: datos['apellidoConductor'],
            destino: datos['destino'],
            fecha: datos['fecha'],
            hora: datos['hora'],
            asientosDisponibles: datos['asientosDisponibles'],
            precio: datos['precio'],
            pasajeros: datos['pasajeros'] || []
          } as Viaje;
        }).filter(viaje => 
          viaje.asientosDisponibles > 0 && 
          viaje.conductorId !== this.usuarioActual?.uid
        );
      },
      error: (error) => {
        console.error('Error al cargar los viajes:', error);
      }
    });
  }

  async obtenerViajeActual() {
    if (this.usuarioActual?.viajeActualId) {
      const viajeDoc = await this.firebaseService.firestore
        .collection('viajes')
        .doc(this.usuarioActual.viajeActualId)
        .get()
        .toPromise();
      
      if (viajeDoc?.exists) {
        this.viajeActual = {
          id: viajeDoc.id,
          ...(viajeDoc.data() as Viaje)
        };
      }
    }
  }

  async tomarViaje(viaje: Viaje) {
    if (!this.usuarioActual) {
      await this.mostrarAlerta('Error', 'Debes iniciar sesión para tomar un viaje');
      return;
    }

    if (this.viajeActual) {
      await this.mostrarAlerta(
        'Viaje Actual', 
        'Ya tienes un viaje reservado. Debes cancelar tu viaje actual antes de tomar uno nuevo.'
      );
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar reserva',
      message: `¿Deseas reservar un asiento en el viaje a ${viaje.destino}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => this.confirmarTomarViaje(viaje)
        }
      ]
    });

    await alert.present();
  }

  async confirmarTomarViaje(viaje: Viaje) {
    try {
      if (!this.usuarioActual) return;
  
      // Primero verificamos el estado actual del viaje
      const viajeRef = await this.firebaseService.firestore
        .collection('viajes')
        .doc(viaje.id)
        .get()
        .toPromise();
  
      if (!viajeRef?.exists) {
        await this.mostrarAlerta('Error', 'No se encontró el viaje');
        return;
      }
  
      const viajeActualizado = viajeRef.data() as Viaje;
  
      // Verificamos que aún haya asientos disponibles
      if (viajeActualizado.asientosDisponibles <= 0) {
        await this.mostrarAlerta('Error', 'Ya no hay asientos disponibles');
        this.cargarViajes(); // Actualizamos la lista
        return;
      }
  
      // Actualizar el viaje
      await this.firebaseService.firestore.collection('viajes').doc(viaje.id).update({
        asientosDisponibles: viajeActualizado.asientosDisponibles - 1,
        pasajeros: [...(viajeActualizado.pasajeros || []), this.usuarioActual.uid]
      });
  
      // Actualizar el usuario
      await this.firebaseService.firestore.collection('users').doc(this.usuarioActual.uid).update({
        viajeActualId: viaje.id
      });
  
      // Actualizar estado local
      this.viajeActual = {
        ...viajeActualizado,
        id: viaje.id,
        asientosDisponibles: viajeActualizado.asientosDisponibles - 1,
        pasajeros: [...(viajeActualizado.pasajeros || []), this.usuarioActual.uid]
      };
      this.usuarioActual.viajeActualId = viaje.id;
      
      await this.mostrarAlerta('Éxito', 'Has reservado tu asiento exitosamente');
      this.cargarViajes();
    } catch (error) {
      console.error('Error al tomar el viaje:', error);
      await this.mostrarAlerta('Error', 'No se pudo completar la reserva');
    }
  }

  async cancelarViaje() {
    if (!this.viajeActual) {
      await this.mostrarAlerta('Error', 'No tienes ningún viaje para cancelar');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro de que deseas cancelar tu reserva?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí',
          handler: () => this.confirmarCancelarViaje()
        }
      ]
    });

    await alert.present();
  }

  async confirmarCancelarViaje() {
    try {
      if (!this.viajeActual || !this.usuarioActual) return;
  
      // Primero obtenemos el estado actual del viaje desde Firestore
      const viajeRef = await this.firebaseService.firestore
        .collection('viajes')
        .doc(this.viajeActual.id)
        .get()
        .toPromise();
  
      if (!viajeRef?.exists) {
        await this.mostrarAlerta('Error', 'No se encontró el viaje');
        return;
      }
  
      const viajeActualizado = viajeRef.data() as Viaje;
  
      // Actualizar el viaje
      await this.firebaseService.firestore.collection('viajes').doc(this.viajeActual.id).update({
        // Incrementamos en 1 los asientos disponibles
        asientosDisponibles: viajeActualizado.asientosDisponibles + 1,
        // Removemos al usuario de la lista de pasajeros
        pasajeros: viajeActualizado.pasajeros.filter(id => id !== this.usuarioActual!.uid)
      });
  
      // Actualizar el usuario
      await this.firebaseService.firestore.collection('users').doc(this.usuarioActual.uid).update({
        viajeActualId: null
      });
  
      // Actualizar estado local
      this.viajeActual = null;
      this.usuarioActual.viajeActualId = null;
  
      await this.mostrarAlerta('Éxito', 'Has cancelado tu reserva exitosamente');
      this.cargarViajes();
    } catch (error) {
      console.error('Error al cancelar el viaje:', error);
      await this.mostrarAlerta('Error', 'No se pudo cancelar la reserva');
    }
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}