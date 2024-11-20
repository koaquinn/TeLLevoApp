import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private afAuth: AngularFireAuth,
    public firestore: AngularFirestore
  ) {}

  register(correo: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(correo, password);
  }

  login(correo: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(correo, password);
  }

  logout() {
    return this.afAuth.signOut();
  }

  obtenerUsuarioActual() {
    return this.afAuth.currentUser;
  }

  actualizarPerfilUsuario(nombre: string) {
    const user = this.afAuth.currentUser;
    return user.then(u => {
      return u?.updateProfile({ displayName: nombre });
    });
  }

  ofrecerViaje(viajeData: any) {
    return this.firestore.collection('viajes').add(viajeData);
  }

  obtenerViajes() {
    return this.firestore.collection('viajes').snapshotChanges();
  }

  enviarCorreoRecuperacion(correo: string) {
    return this.afAuth.sendPasswordResetEmail(correo);
  }
}