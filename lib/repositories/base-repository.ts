// Repository Pattern com Interface Segregation
export interface IRepository<T, K = string> {
  findById(id: K): Promise<T | null>
  findAll(): Promise<T[]>
  save(entity: T): Promise<void>
  delete(id: K): Promise<void>
}

export interface IUserRepository extends IRepository<UserEntity, string> {
  findByEmail(email: string): Promise<UserEntity | null>
  findByWhatsapp(whatsapp: string): Promise<UserEntity | null>
}

export interface IChecklistRepository extends IRepository<ChecklistAnswers, string> {
  findByUserId(userId: string): Promise<ChecklistAnswers | null>
  saveAnswers(userId: string, answers: Record<string, boolean>): Promise<void>
}

// Entities com validação
export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly whatsapp: string,
    public readonly location?: LocationData,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validate()
  }

  private validate(): void {
    if (!this.name?.trim()) throw new Error("Name is required")
    if (!this.email?.includes("@")) throw new Error("Valid email is required")
    if (!this.whatsapp?.trim()) throw new Error("WhatsApp is required")
  }

  public updateLocation(location: LocationData): UserEntity {
    return new UserEntity(this.id, this.name, this.email, this.whatsapp, location, this.createdAt, new Date())
  }
}

export class ChecklistAnswers {
  constructor(
    public readonly userId: string,
    public readonly answers: Record<string, boolean>,
    public readonly completedAt?: Date,
    public readonly updatedAt: Date = new Date(),
  ) {}

  public updateAnswer(questionId: string, answer: boolean): ChecklistAnswers {
    return new ChecklistAnswers(this.userId, { ...this.answers, [questionId]: answer }, this.completedAt, new Date())
  }

  public markCompleted(): ChecklistAnswers {
    return new ChecklistAnswers(this.userId, this.answers, new Date(), this.updatedAt)
  }
}

interface LocationData {
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
}
