/**
 * Interfaz base para todos los repositorios
 * Define los métodos CRUD básicos que todos los repositorios deben implementar
 */
export interface IBaseRepository<T> {
  /**
   * Crea un nuevo registro
   * @param data Datos del registro a crear
   * @returns El registro creado
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Obtiene un registro por su ID
   * @param id ID del registro
   * @returns El registro encontrado o null si no existe
   */
  findById(id: string): Promise<T | null>;

  /**
   * Obtiene todos los registros
   * @returns Lista de registros
   */
  findAll(): Promise<T[]>;

  /**
   * Actualiza un registro
   * @param id ID del registro a actualizar
   * @param data Datos a actualizar
   * @returns El registro actualizado
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Elimina un registro
   * @param id ID del registro a eliminar
   * @returns El registro eliminado
   */
  delete(id: string): Promise<T>;
}
