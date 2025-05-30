import { type IUserRepository, UserEntity } from "./base-repository"
import { Logger } from "../logger-service"

export class LocalStorageUserRepository implements IUserRepository {
  private readonly logger = Logger.getInstance()
  private readonly storageKey = "users"

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const users = await this.getAllUsers()
      const userData = users.find((u) => u.id === id)

      if (!userData) return null

      return new UserEntity(
        userData.id,
        userData.name,
        userData.email,
        userData.whatsapp,
        userData.location,
        new Date(userData.createdAt),
        new Date(userData.updatedAt),
      )
    } catch (error) {
      this.logger.error("Failed to find user by ID", error as Error, { userId: id })
      return null
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const users = await this.getAllUsers()
      const userData = users.find((u) => u.email === email)

      if (!userData) return null

      return new UserEntity(
        userData.id,
        userData.name,
        userData.email,
        userData.whatsapp,
        userData.location,
        new Date(userData.createdAt),
        new Date(userData.updatedAt),
      )
    } catch (error) {
      this.logger.error("Failed to find user by email", error as Error, { email })
      return null
    }
  }

  async findByWhatsapp(whatsapp: string): Promise<UserEntity | null> {
    try {
      const users = await this.getAllUsers()
      const userData = users.find((u) => u.whatsapp === whatsapp)

      if (!userData) return null

      return new UserEntity(
        userData.id,
        userData.name,
        userData.email,
        userData.whatsapp,
        userData.location,
        new Date(userData.createdAt),
        new Date(userData.updatedAt),
      )
    } catch (error) {
      this.logger.error("Failed to find user by WhatsApp", error as Error, { whatsapp })
      return null
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      const users = await this.getAllUsers()
      return users.map(
        (userData) =>
          new UserEntity(
            userData.id,
            userData.name,
            userData.email,
            userData.whatsapp,
            userData.location,
            new Date(userData.createdAt),
            new Date(userData.updatedAt),
          ),
      )
    } catch (error) {
      this.logger.error("Failed to find all users", error as Error)
      return []
    }
  }

  async save(entity: UserEntity): Promise<void> {
    try {
      const users = await this.getAllUsers()
      const existingIndex = users.findIndex((u) => u.id === entity.id)

      const userData = {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        whatsapp: entity.whatsapp,
        location: entity.location,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
      }

      if (existingIndex >= 0) {
        users[existingIndex] = userData
      } else {
        users.push(userData)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(users))
      this.logger.info("User saved successfully", { userId: entity.id })
    } catch (error) {
      this.logger.error("Failed to save user", error as Error, { userId: entity.id })
      throw new Error("Failed to save user")
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const users = await this.getAllUsers()
      const filteredUsers = users.filter((u) => u.id !== id)

      localStorage.setItem(this.storageKey, JSON.stringify(filteredUsers))
      this.logger.info("User deleted successfully", { userId: id })
    } catch (error) {
      this.logger.error("Failed to delete user", error as Error, { userId: id })
      throw new Error("Failed to delete user")
    }
  }

  private async getAllUsers(): Promise<any[]> {
    const data = localStorage.getItem(this.storageKey)
    return data ? JSON.parse(data) : []
  }
}
