export interface Onboarding {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'pending'
  progress: number
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  onboarding_id: string
  title: string
  completed: boolean
  order: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
}
