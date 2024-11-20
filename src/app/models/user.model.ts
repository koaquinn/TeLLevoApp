export interface User {
    uid: string;
    nombre: string;
    apellido: string;
    rut: string;
    correo: string;
    password: string;
    viajeActualId?: string;  // Añadimos esta propiedad como opcional
  }