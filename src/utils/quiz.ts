import type { Quiz, QuizMetadata, Answer } from '../types/quiz'
import { getFromStorage } from './storage'

// Cache for loaded quizzes to avoid repeated imports
let quizzesCache: Quiz[] | null = null
let currentLocale: string | null = null

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Shuffle answers for a question while maintaining correct answer mapping
 */
function shuffleQuestionAnswers(question: any): any {
  if (!question.options || !Array.isArray(question.options)) {
    return question
  }

  // Convert string options to Answer objects if they're not already
  const answers: Answer[] = question.options.map(
    (option: any, index: number) => {
      if (typeof option === 'string') {
        return {
          id: `answer_${question.id}_${index}`,
          text: option,
        }
      }
      return option
    }
  )

  // Shuffle the answers
  const shuffledAnswers = shuffleArray(answers)

  // Update correct answer IDs to match the new shuffled positions
  const correctAnswerIds =
    question.correctAnswerIds
      ?.map((correctId: string) => {
        const originalAnswer = answers.find((answer) => answer.id === correctId)
        if (!originalAnswer) {
          console.warn(`Correct answer ID ${correctId} not found in options`)
          return null
        }
        return originalAnswer.id
      })
      .filter((id: string | null) => id !== null) || []

  return {
    ...question,
    options: shuffledAnswers,
    correctAnswerIds,
  }
}

/**
 * Get current locale from localStorage
 */
function getCurrentLocale(): string {
  try {
    const locale = getFromStorage('locale') || 'en'
    return locale
  } catch {
    return 'en'
  }
}

/**
 * Get metadata for all quizzes (lightweight info for main screen)
 */
export async function getQuizzesMetadata(): Promise<QuizMetadata[]> {
  try {
    const quizzes = await getAllQuizzes()
    return quizzes.map((quiz) => ({
      id: quiz.id,
      language: quiz.language,
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
 * Get full quiz data by ID (for current locale)
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
 * Get full quiz data by ID and language
 */
export async function getQuizByIdAndLanguage(
  quizId: string,
  language: string
): Promise<Quiz | null> {
  try {
    // Dynamically import all quiz JSON files from the quizzes directory
    const quizFiles = import.meta.glob('../quizzes/*.json')
    const quizImports = Object.values(quizFiles).map((loader) => loader())
    const loadedQuizzes = await Promise.all(quizImports)

    // Transform the quiz data to match the expected Quiz type
    const transformQuiz = (quiz: any): Quiz => ({
      id: quiz.id,
      language: quiz.language || 'en',
      title: quiz.title,
      description: quiz.description,
      categories: quiz.categories || ['General'],
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit || 300,
      tags: quiz.tags || [],
      lastUpdated: quiz.lastUpdated || new Date().toISOString(),
      questions: quiz.questions.map((q: any, index: number) => {
        // Shuffle the answers for this question
        const shuffledQuestion = shuffleQuestionAnswers(q)

        return {
          id: shuffledQuestion.id || index + 1,
          question: shuffledQuestion.question,
          type: shuffledQuestion.type === 'multiple' ? 'multiple' : 'single',
          options: shuffledQuestion.options,
          correctAnswerIds: shuffledQuestion.correctAnswerIds,
          explanation:
            shuffledQuestion.explanation || 'No explanation provided.',
          difficulty: shuffledQuestion.difficulty,
        }
      }),
    })

    const transformedQuizzes = loadedQuizzes.map(transformQuiz)

    return (
      transformedQuizzes.find(
        (quiz) => quiz.id === quizId && quiz.language === language
      ) || null
    )
  } catch (error) {
    console.error(
      `Error getting quiz by ID ${quizId} and language ${language}:`,
      error
    )
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
  const locale = getCurrentLocale()

  // Check if we need to reload quizzes due to locale change
  if (quizzesCache && currentLocale === locale) {
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
      language: quiz.language || 'en',
      title: quiz.title,
      description: quiz.description,
      categories: quiz.categories || ['General'],
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit || 300,
      tags: quiz.tags || [],
      lastUpdated: quiz.lastUpdated || new Date().toISOString(),
      questions: quiz.questions.map((q: any, index: number) => {
        // Shuffle the answers for this question
        const shuffledQuestion = shuffleQuestionAnswers(q)

        return {
          id: shuffledQuestion.id || index + 1,
          question: shuffledQuestion.question,
          type: shuffledQuestion.type === 'multiple' ? 'multiple' : 'single',
          options: shuffledQuestion.options,
          correctAnswerIds: shuffledQuestion.correctAnswerIds,
          explanation:
            shuffledQuestion.explanation || 'No explanation provided.',
          difficulty: shuffledQuestion.difficulty,
        }
      }),
    })

    const transformedQuizzes = loadedQuizzes.map(transformQuiz)

    // Filter quizzes based on locale
    let filteredQuizzes = transformedQuizzes

    // Filter quizzes by language based on current locale
    filteredQuizzes = transformedQuizzes.filter((quiz: any) => {
      const quizLanguage = quiz.language || 'en'

      // Match quiz language with current locale
      if (quizLanguage === locale) {
        return true
      }

      return false
    })

    // Validate all quizzes using the type guard
    const validQuizzes = filteredQuizzes.filter((quiz: any) => {
      if (!validateQuiz(quiz)) {
        console.warn(`Quiz "${quiz.id}" failed validation and will be skipped`)
        return false
      }
      return true
    })

    quizzesCache = validQuizzes
    currentLocale = locale
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
  currentLocale = null
}

/**
 * Clear quiz cache when language changes
 */
export function clearQuizCacheOnLanguageChange(): void {
  quizzesCache = null
  currentLocale = null
}

/**
 * Validate quiz data structure (type guard)
 */
export function validateQuiz(quiz: any): quiz is Quiz {
  const requiredFields = ['id', 'language', 'title', 'description', 'questions']
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

  // Validate language field
  if (!['en', 'ar'].includes(quiz.language)) {
    console.error('Quiz language must be "en" or "ar"')
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

    // Validate that options are Answer objects with id and text
    for (const option of question.options) {
      if (!option || typeof option !== 'object' || !option.id || !option.text) {
        console.error('Invalid option structure:', option)
        return false
      }
    }

    if (
      !Array.isArray(question.correctAnswerIds) ||
      question.correctAnswerIds.length === 0
    ) {
      console.error('Question must have correct answers:', question)
      return false
    }

    // Validate that all correctAnswerIds exist in the options
    const optionIds = question.options.map((opt: any) => opt.id)
    for (const correctId of question.correctAnswerIds) {
      if (!optionIds.includes(correctId)) {
        console.error('Correct answer ID not found in options:', correctId)
        return false
      }
    }
  }

  return true
}

/**
 * Validate if the given answers are correct for a specific question
 */
export function validateAnswer(
  question: any,
  userAnswerIds: string[]
): boolean {
  if (
    !question ||
    !Array.isArray(question.correctAnswerIds) ||
    !Array.isArray(userAnswerIds)
  ) {
    return false
  }

  // Sort both arrays to ensure order doesn't matter
  const sortedCorrectAnswerIds = [...question.correctAnswerIds].sort()
  const sortedUserAnswerIds = [...userAnswerIds].sort()

  // Check if arrays have the same length and content
  if (sortedCorrectAnswerIds.length !== sortedUserAnswerIds.length) {
    return false
  }

  return sortedCorrectAnswerIds.every(
    (answerId, index) => answerId === sortedUserAnswerIds[index]
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
 * @param userAnswerIds - Array of user's selected answer IDs
 * @returns Object containing validation result, color, and icon
 */
export async function validateQuestionAnswer(
  quizId: string,
  questionId: number,
  userAnswerIds: string[]
): Promise<{
  isCorrect: boolean
  color: string
  icon: string
  correctAnswerIds: string[]
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

    const isCorrect = validateAnswer(question, userAnswerIds)
    const color = getResultColor(isCorrect)
    const icon = getResultIcon(isCorrect)

    return {
      isCorrect,
      color,
      icon,
      correctAnswerIds: question.correctAnswerIds,
      explanation: question.explanation || 'No explanation provided.',
    }
  } catch (error) {
    console.error('Error validating question answer:', error)
    return {
      isCorrect: false,
      color: 'error',
      icon: 'mdi-alert-circle',
      correctAnswerIds: [],
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
  userAnswerIds: string[]
): Promise<{
  isCorrect: boolean
  color: string
  icon: string
  correctAnswerIds: string[]
  userAnswerIds: string[]
  explanation: string
  question: string
  options: Answer[]
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

    const isCorrect = validateAnswer(question, userAnswerIds)
    const color = getResultColor(isCorrect)
    const icon = getResultIcon(isCorrect)

    return {
      isCorrect,
      color,
      icon,
      correctAnswerIds: question.correctAnswerIds,
      userAnswerIds,
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
      correctAnswerIds: [],
      userAnswerIds,
      explanation: 'Error occurred while validating answer.',
      question: '',
      options: [],
      isMultipleChoice: false,
    }
  }
}
