import type { Quiz, QuizMetadata } from '../types/quiz'

// Cache for loaded quizzes to avoid repeated imports
let quizzesCache: Quiz[] | null = null

/**
 * Get metadata for all quizzes (lightweight info for main screen)
 */
export async function getQuizzesMetadata(): Promise<QuizMetadata[]> {
  try {
    const quizzes = await getAllQuizzes()
    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      categories: quiz.categories,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      questionCount: quiz.questions.length,
      estimatedTime: Math.ceil(quiz.timeLimit / 60), // Convert to minutes
      tags: quiz.tags || [],
      lastUpdated: quiz.lastUpdated || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error getting quizzes metadata:', error)
    return []
  }
}

/**
 * Get full quiz data by ID
 */
export async function getQuizById(quizId: string): Promise<Quiz | null> {
  try {
    const quizzes = await getAllQuizzes()
    return quizzes.find((quiz) => quiz.id === quizId) || null
  } catch (error) {
    console.error(`Error getting quiz by ID ${quizId}:`, error)
    return null
  }
}

/**
 * Get quizzes by category
 */
export async function getQuizzesByCategory(
  category: string
): Promise<QuizMetadata[]> {
  try {
    const metadata = await getQuizzesMetadata()
    return metadata.filter((quiz) =>
      quiz.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    )
  } catch (error) {
    console.error(`Error getting quizzes by category ${category}:`, error)
    return []
  }
}

/**
 * Get quizzes by difficulty level
 */
export async function getQuizzesByDifficulty(
  difficulty: string
): Promise<QuizMetadata[]> {
  try {
    const metadata = await getQuizzesMetadata()
    return metadata.filter(
      (quiz) => quiz.difficulty.toLowerCase() === difficulty.toLowerCase()
    )
  } catch (error) {
    console.error(`Error getting quizzes by difficulty ${difficulty}:`, error)
    return []
  }
}

/**
 * Search quizzes by title or description
 */
export async function searchQuizzes(query: string): Promise<QuizMetadata[]> {
  try {
    const metadata = await getQuizzesMetadata()
    const lowerQuery = query.toLowerCase()
    return metadata.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(lowerQuery) ||
        quiz.description.toLowerCase().includes(lowerQuery) ||
        quiz.categories.some((c) => c.toLowerCase().includes(lowerQuery))
    )
  } catch (error) {
    console.error(`Error searching quizzes with query ${query}:`, error)
    return []
  }
}

/**
 * Get all available categories
 */
export async function getAvailableCategories(): Promise<string[]> {
  try {
    const metadata = await getQuizzesMetadata()
    const categories = metadata.flatMap((quiz) => quiz.categories)
    return [...new Set(categories)] // Remove duplicates
  } catch (error) {
    console.error('Error getting available categories:', error)
    return []
  }
}

/**
 * Get all available difficulty levels
 */
export async function getAvailableDifficulties(): Promise<string[]> {
  try {
    const metadata = await getQuizzesMetadata()
    const difficulties = metadata.map((quiz) => quiz.difficulty)
    return [...new Set(difficulties)] // Remove duplicates
  } catch (error) {
    console.error('Error getting available difficulties:', error)
    return []
  }
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'success'
    case 'intermediate':
      return 'warning'
    case 'advanced':
      return 'error'
    default:
      return 'primary'
  }
}

/**
 * Get quiz statistics
 */
export async function getQuizStats(): Promise<{
  totalQuizzes: number
  totalQuestions: number
  averageTime: number
  categories: { name: string; count: number }[]
  difficulties: { level: string; count: number }[]
}> {
  try {
    const metadata = await getQuizzesMetadata()
    const quizzes = await getAllQuizzes()

    const totalQuestions = quizzes.reduce(
      (sum, quiz) => sum + quiz.questions.length,
      0
    )
    const averageTime =
      metadata.reduce((sum, quiz) => sum + quiz.estimatedTime, 0) /
      metadata.length

    // Count categories
    const categoryCounts = metadata.reduce(
      (acc, quiz) => {
        quiz.categories.forEach((category) => {
          acc[category] = (acc[category] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>
    )

    // Count difficulties
    const difficultyCounts = metadata.reduce(
      (acc, quiz) => {
        acc[quiz.difficulty] = (acc[quiz.difficulty] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalQuizzes: metadata.length,
      totalQuestions,
      averageTime: Math.round(averageTime),
      categories: Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count: count as number,
      })),
      difficulties: Object.entries(difficultyCounts).map(([level, count]) => ({
        level,
        count: count as number,
      })),
    }
  } catch (error) {
    console.error('Error getting quiz stats:', error)
    return {
      totalQuizzes: 0,
      totalQuestions: 0,
      averageTime: 0,
      categories: [],
      difficulties: [],
    }
  }
}

/**
 * Load and cache all quizzes from JSON files
 */
async function getAllQuizzes(): Promise<Quiz[]> {
  if (quizzesCache) {
    return quizzesCache
  }

  try {
    // Dynamically import all quiz JSON files from the quizzes directory
    const quizFiles = import.meta.glob('../quizzes/*.json')
    const quizImports = Object.values(quizFiles).map((loader) => loader())
    const loadedQuizzes = await Promise.all(quizImports)

    // Transform the quiz data to match the expected Quiz type
    const transformQuiz = (quiz: any): Quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      categories: quiz.categories || ['General'],
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit || 300,
      tags: quiz.tags || [],
      lastUpdated: quiz.lastUpdated || new Date().toISOString(),
      questions: quiz.questions.map((q: any, index: number) => ({
        id: q.id || index + 1,
        question: q.question,
        type: q.type === 'multiple' ? 'multiple' : 'single',
        options: q.options,
        correctAnswers: Array.isArray(q.correctAnswers)
          ? q.correctAnswers
              .map((ans: any) =>
                typeof ans === 'number' ? ans : q.options.indexOf(ans)
              )
              .filter((i: number) => i !== -1)
          : [q.options.indexOf(q.correctAnswers)].filter(
              (i: number) => i !== -1
            ),
        explanation: q.explanation || 'No explanation provided.',
        difficulty: q.difficulty,
      })),
    })

    const transformedQuizzes = loadedQuizzes.map(transformQuiz)

    // Validate all quizzes using the type guard
    const validQuizzes = transformedQuizzes.filter((quiz: any) => {
      if (!validateQuiz(quiz)) {
        console.warn(`Quiz "${quiz.id}" failed validation and will be skipped`)
        return false
      }
      return true
    })

    quizzesCache = validQuizzes
    return quizzesCache
  } catch (error) {
    console.error('Error loading quizzes:', error)
    return []
  }
}

/**
 * Clear the quiz cache (useful for development or when quizzes are updated)
 */
export function clearQuizCache(): void {
  quizzesCache = null
}

/**
 * Validate quiz data structure (type guard)
 */
export function validateQuiz(quiz: any): quiz is Quiz {
  const requiredFields = ['id', 'title', 'description', 'questions']
  const hasRequiredFields = requiredFields.every(
    (field) => quiz[field] !== undefined
  )

  if (!hasRequiredFields) {
    console.error(
      'Quiz missing required fields:',
      requiredFields.filter((field) => quiz[field] === undefined)
    )
    return false
  }

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    console.error('Quiz must have at least one question')
    return false
  }

  // Validate each question structure
  for (const question of quiz.questions) {
    if (
      !question.question ||
      !Array.isArray(question.options) ||
      question.options.length === 0
    ) {
      console.error('Invalid question structure:', question)
      return false
    }

    if (
      !Array.isArray(question.correctAnswers) ||
      question.correctAnswers.length === 0
    ) {
      console.error('Question must have correct answers:', question)
      return false
    }
  }

  return true
}

/**
 * Validate if the given answers are correct for a specific question
 */
export function validateAnswer(question: any, userAnswers: number[]): boolean {
  if (
    !question ||
    !Array.isArray(question.correctAnswers) ||
    !Array.isArray(userAnswers)
  ) {
    return false
  }

  // Sort both arrays to ensure order doesn't matter
  const sortedCorrectAnswers = [...question.correctAnswers].sort(
    (a, b) => a - b
  )
  const sortedUserAnswers = [...userAnswers].sort((a, b) => a - b)

  // Check if arrays have the same length and content
  if (sortedCorrectAnswers.length !== sortedUserAnswers.length) {
    return false
  }

  return sortedCorrectAnswers.every(
    (answer, index) => answer === sortedUserAnswers[index]
  )
}

/**
 * Get result icon based on whether the answer is correct
 */
export function getResultIcon(isCorrect: boolean): string {
  return isCorrect ? 'mdi-check-circle' : 'mdi-close-circle'
}

/**
 * Get result color based on whether the answer is correct
 */
export function getResultColor(isCorrect: boolean): string {
  return isCorrect ? 'success' : 'error'
}

/**
 * Main function to validate answers and get result information
 * @param quizId - The ID of the quiz
 * @param questionId - The ID of the question
 * @param userAnswers - Array of user's selected answer indices
 * @returns Object containing validation result, color, and icon
 */
export async function validateQuestionAnswer(
  quizId: string,
  questionId: number,
  userAnswers: number[]
): Promise<{
  isCorrect: boolean
  color: string
  icon: string
  correctAnswers: number[]
  explanation: string
}> {
  try {
    const quiz = await getQuizById(quizId)
    if (!quiz) {
      throw new Error(`Quiz with ID ${quizId} not found`)
    }

    const question = quiz.questions.find((q) => q.id === questionId)
    if (!question) {
      throw new Error(
        `Question with ID ${questionId} not found in quiz ${quizId}`
      )
    }

    const isCorrect = validateAnswer(question, userAnswers)
    const color = getResultColor(isCorrect)
    const icon = getResultIcon(isCorrect)

    return {
      isCorrect,
      color,
      icon,
      correctAnswers: question.correctAnswers,
      explanation: question.explanation || 'No explanation provided.',
    }
  } catch (error) {
    console.error('Error validating question answer:', error)
    return {
      isCorrect: false,
      color: 'error',
      icon: 'mdi-alert-circle',
      correctAnswers: [],
      explanation: 'Error occurred while validating answer.',
    }
  }
}

/**
 * Get detailed answer validation with additional information
 */
export async function getDetailedAnswerValidation(
  quizId: string,
  questionId: number,
  userAnswers: number[]
): Promise<{
  isCorrect: boolean
  color: string
  icon: string
  correctAnswers: number[]
  userAnswers: number[]
  explanation: string
  question: string
  options: string[]
  isMultipleChoice: boolean
}> {
  try {
    const quiz = await getQuizById(quizId)
    if (!quiz) {
      throw new Error(`Quiz with ID ${quizId} not found`)
    }

    const question = quiz.questions.find((q) => q.id === questionId)
    if (!question) {
      throw new Error(
        `Question with ID ${questionId} not found in quiz ${quizId}`
      )
    }

    const isCorrect = validateAnswer(question, userAnswers)
    const color = getResultColor(isCorrect)
    const icon = getResultIcon(isCorrect)

    return {
      isCorrect,
      color,
      icon,
      correctAnswers: question.correctAnswers,
      userAnswers,
      explanation: question.explanation || 'No explanation provided.',
      question: question.question,
      options: question.options,
      isMultipleChoice: question.type === 'multiple',
    }
  } catch (error) {
    console.error('Error getting detailed answer validation:', error)
    return {
      isCorrect: false,
      color: 'error',
      icon: 'mdi-alert-circle',
      correctAnswers: [],
      userAnswers,
      explanation: 'Error occurred while validating answer.',
      question: '',
      options: [],
      isMultipleChoice: false,
    }
  }
}
