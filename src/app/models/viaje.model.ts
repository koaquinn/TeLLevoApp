export interface Viaje {
  id: string;
  conductorId: string;
  nombreConductor: string;
  apellidoConductor: string;
  destino: string;
  fecha: string;
  hora: string;
  asientosDisponibles: number;
  precio: number;
  pasajeros: string[];
}