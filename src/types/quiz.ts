export interface Quiz {
  id: string
  language: string
  title: string
  description: string
  categories: string[]
  difficulty: string
  timeLimit: number
  questions: Question[]
  tags?: string[]
  lastUpdated?: string
}

export interface QuizMetadata {
  id: string
  language: string
  title: string
  description: string
  categories: string[]
  difficulty: string
  timeLimit: number
  questionCount: number
  estimatedTime: number
  tags: string[]
  lastUpdated: string
}

export interface Answer {
  id: string
  text: string
}

export interface Question {
  id: number
  question: string
  type: 'single' | 'multiple'
  options: Answer[]
  correctAnswerIds: string[]
  explanation: string
  difficulty: string
}

export interface QuizResult {
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeElapsed: number
  answers: (string | string[] | null)[]
  completedAt: Date
}
