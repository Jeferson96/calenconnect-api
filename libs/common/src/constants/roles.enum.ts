/**
 * Enum que define los roles de usuario en el sistema
 *
 * Basado en la documentación ARD:
 * - PATIENT: Solo puede gestionar sus propias citas
 * - PROFESSIONAL: Puede gestionar su disponibilidad y citas asignadas
 * - ADMIN: (Futuro) Para auditoría y configuración global
 */
export enum UserRole {
  PATIENT = 'patient',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
}
