import { UserEntity } from '../../../entities/user.entity';
import { UserRole } from '../../../value-objects/user-role.enum';

describe('UserEntity', () => {
  describe('constructor', () => {
    it('should create a valid user entity with all properties', () => {
      // Arrange
      const userId = '123';

      // Act
      const user = new UserEntity({
        id: userId,
        authUserId: 'auth123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PROFESSIONAL,
      });

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.authUserId).toBe('auth123');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe(UserRole.PROFESSIONAL);
    });

    it('should allow creating user with minimal required properties and default id', () => {
      // Arrange & Act
      const user = new UserEntity({
        authUserId: 'auth456',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.PATIENT,
      });

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBe('');
      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
      expect(user.role).toBe(UserRole.PATIENT);
    });
  });

  describe('fullName', () => {
    it('should return concatenated firstName and lastName', () => {
      // Arrange
      const user = new UserEntity({
        id: '789',
        authUserId: 'auth789',
        firstName: 'Carlos',
        lastName: 'González',
        role: UserRole.PATIENT,
      });

      // Act
      const fullName = user.fullName;

      // Assert
      expect(fullName).toBe('Carlos González');
    });
  });

  describe('isProfessional', () => {
    it('should return true for professional users', () => {
      // Arrange
      const user = new UserEntity({
        authUserId: 'auth123',
        firstName: 'Doctor',
        lastName: 'Test',
        role: UserRole.PROFESSIONAL,
      });

      // Act & Assert
      expect(user.isProfessional()).toBe(true);
      expect(user.isPatient()).toBe(false);
    });
  });

  describe('isPatient', () => {
    it('should return true for patient users', () => {
      // Arrange
      const user = new UserEntity({
        authUserId: 'auth123',
        firstName: 'Patient',
        lastName: 'Test',
        role: UserRole.PATIENT,
      });

      // Act & Assert
      expect(user.isPatient()).toBe(true);
      expect(user.isProfessional()).toBe(false);
    });
  });
});
