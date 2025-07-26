export function saveToStorage(key: string, value: string) {
  const encodedValue = btoa(value)
  const encodedKey = btoa(key)
  localStorage.setItem(encodedKey, encodedValue)
}

export function getFromStorage(key: string) {
  const encodedKey = btoa(key)
  const encodedValue = localStorage.getItem(encodedKey)
  return encodedValue ? atob(encodedValue) : null
}

export function removeFromStorage(key: string) {
  const encodedKey = btoa(key)
  localStorage.removeItem(encodedKey)
}

// Quiz progress storage functions
export interface QuizProgress {
  quizId: string
  currentQuestionIndex: number
  answers: (string | string[] | null)[]
  isAnswerSubmitted: boolean
  isAnswerCorrect: boolean
  selectedAnswers: string[]
  timestamp: number
}

export function saveQuizProgress(
  quizId: string,
  progress: Omit<QuizProgress, 'quizId' | 'timestamp'>
) {
  const progressData: QuizProgress = {
    quizId,
    ...progress,
    timestamp: Date.now(),
  }

  const key = `quiz_progress_${quizId}`
  saveToStorage(key, JSON.stringify(progressData))
}

export function getQuizProgress(quizId: string): QuizProgress | null {
  const key = `quiz_progress_${quizId}`
  const data = getFromStorage(key)

  if (!data) return null

  try {
    const progress = JSON.parse(data) as QuizProgress
    // Validate that the data is for the correct quiz
    if (progress.quizId !== quizId) {
      return null
    }
    return progress
  } catch (error) {
    console.error('Error parsing quiz progress:', error)
    return null
  }
}

export function removeQuizProgress(quizId: string) {
  const key = `quiz_progress_${quizId}`
  removeFromStorage(key)
}

export function clearAllQuizProgress() {
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    const decodedKey = atob(key)
    if (decodedKey.startsWith('quiz_progress_')) {
      localStorage.removeItem(key)
    }
  })
}
