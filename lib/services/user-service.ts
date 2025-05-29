import { type IUserRepository, UserEntity } from "../repositories/base-repository"
import { Logger } from "../logger-service"

export interface IUserService {
  createUser(userData: CreateUserData): Promise<UserEntity>
  getUserById(id: string): Promise<UserEntity | null>
  updateUserLocation(userId: string, location: LocationData): Promise<void>
  deleteUser(id: string): Promise<void>
  getAllUsers(): Promise<UserEntity[]>
}

export interface CreateUserData {
  name: string
  email: string
  whatsapp: string
  location?: LocationData
}

interface LocationData {
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
}

export class UserService implements IUserService {
  private readonly logger = Logger.getInstance()

  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(userData: CreateUserData): Promise<UserEntity> {
    try {
      // Validar se usuário já existe
      const existingUser = await this.userRepository.findByEmail(userData.email)
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      const existingWhatsApp = await this.userRepository.findByWhatsapp(userData.whatsapp)
      if (existingWhatsApp) {
        throw new Error("User with this WhatsApp already exists")
      }

      // Criar novo usuário
      const userId = this.generateUserId()
      const user = new UserEntity(userId, userData.name, userData.email, userData.whatsapp, userData.location)

      await this.userRepository.save(user)
      this.logger.info("User created successfully", { userId })

      return user
    } catch (error) {
      this.logger.error("Failed to create user", error as Error, userData)
      throw error
    }
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findById(id)
      if (user) {
        this.logger.debug("User found", { userId: id })
      }
      return user
    } catch (error) {
      this.logger.error("Failed to get user by ID", error as Error, { userId: id })
      throw new Error("Failed to retrieve user")
    }
  }

  async updateUserLocation(userId: string, location: LocationData): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      const updatedUser = user.updateLocation(location)
      await this.userRepository.save(updatedUser)

      this.logger.info("User location updated", { userId, location })
    } catch (error) {
      this.logger.error("Failed to update user location", error as Error, { userId })
      throw error
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        throw new Error("User not found")
      }

      await this.userRepository.delete(id)
      this.logger.info("User deleted successfully", { userId: id })
    } catch (error) {
      this.logger.error("Failed to delete user", error as Error, { userId: id })
      throw error
    }
  }

  async getAllUsers(): Promise<UserEntity[]> {
    try {
      const users = await this.userRepository.findAll()
      this.logger.debug("Retrieved all users", { count: users.length })
      return users
    } catch (error) {
      this.logger.error("Failed to get all users", error as Error)
      throw new Error("Failed to retrieve users")
    }
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
