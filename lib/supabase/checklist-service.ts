import { supabase, type ChecklistAnswers } from "./client"

export class SupabaseChecklistService {
  async saveAnswers(userId: string, answers: Record<string, boolean>): Promise<ChecklistAnswers> {
    // First, try to update existing answers
    const { data: existing } = await supabase.from("checklist_answers").select("*").eq("user_id", userId).single()

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("checklist_answers")
        .update({
          answers,
          completed_at: this.isCompleted(answers) ? new Date().toISOString() : null,
        })
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update answers: ${error.message}`)
      }

      return data
    } else {
      // Create new
      const { data, error } = await supabase
        .from("checklist_answers")
        .insert([
          {
            user_id: userId,
            answers,
            completed_at: this.isCompleted(answers) ? new Date().toISOString() : null,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save answers: ${error.message}`)
      }

      return data
    }
  }

  async getAnswers(userId: string): Promise<ChecklistAnswers | null> {
    const { data, error } = await supabase.from("checklist_answers").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw new Error(`Failed to get answers: ${error.message}`)
    }

    return data
  }

  async getAllAnswers(): Promise<ChecklistAnswers[]> {
    const { data, error } = await supabase
      .from("checklist_answers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to get all answers: ${error.message}`)
    }

    return data || []
  }

  private isCompleted(answers: Record<string, boolean>): boolean {
    const totalAnswers = Object.keys(answers).length
    return totalAnswers > 0 // You can adjust this logic based on your requirements
  }
}
