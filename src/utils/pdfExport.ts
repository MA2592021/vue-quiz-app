import jsPDF from 'jspdf'
import type { Quiz, QuizResult } from '../types/quiz'
import { formatTime } from './formatTime'

export interface PDFExportData {
  quiz: Quiz
  result: QuizResult
  language: string
}

export const generateQuizResultsPDF = async (
  data: PDFExportData
): Promise<void> => {
  const { quiz, result, language } = data

  // Create PDF
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pdfWidth - margin * 2
  let yPosition = margin

  // Helper function to add text with page break handling
  const addText = (
    text: string,
    fontSize: number = 12,
    isBold: boolean = false
  ) => {
    pdf.setFontSize(fontSize)
    if (isBold) pdf.setFont('helvetica', 'bold')
    else pdf.setFont('helvetica', 'normal')

    const lines = pdf.splitTextToSize(text, contentWidth)
    const lineHeight = fontSize * 0.4

    // Check if we need a new page
    if (yPosition + lines.length * lineHeight > pdfHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }

    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * lineHeight + 5
  }

  // Helper function to add question with page break prevention
  const addQuestion = (question: any, index: number) => {
    const userAnswer = result.answers[index]
    const userAnswers = Array.isArray(userAnswer)
      ? userAnswer
      : userAnswer
        ? [userAnswer]
        : []
    const isCorrect = validateAnswer(question, userAnswers)

    // Calculate total height needed for this question
    const questionText = `Question ${index + 1} (${question.difficulty}) - ${isCorrect ? '✓ Correct' : '✗ Incorrect'}`
    const questionLines = pdf.splitTextToSize(question.question, contentWidth)
    const optionsText = question.options
      .map((opt: any) => `• ${opt.text}`)
      .join('\n')
    const optionsLines = pdf.splitTextToSize(optionsText, contentWidth)
    const yourAnswerText = `Your Answer: ${
      userAnswers.length > 0
        ? userAnswers
            .map((id: string) => {
              const option = question.options.find((opt: any) => opt.id === id)
              return option ? option.text : id
            })
            .join(', ')
        : 'No answer provided'
    }`
    const correctAnswerText = `Correct Answer: ${question.correctAnswerIds
      .map((id: string) => {
        const option = question.options.find((opt: any) => opt.id === id)
        return option ? option.text : id
      })
      .join(', ')}`

    const totalHeight =
      (questionLines.length + optionsLines.length + 4) * 5 + 20 // Approximate height

    // Check if we need a new page for this question
    if (yPosition + totalHeight > pdfHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }

    // Add question header
    addText(questionText, 12, true)

    // Add question text
    addText(question.question, 11, true)

    // Add options
    addText('Options:', 10, true)
    question.options.forEach((option: any) => {
      const isSelected = userAnswers.includes(option.id)
      const isCorrectOption = question.correctAnswerIds.includes(option.id)
      let prefix = '• '

      if (isCorrectOption && isSelected) {
        prefix = '✓ ' // Correct and selected
      } else if (isCorrectOption && !isSelected) {
        prefix = '✓ ' // Correct but not selected
      } else if (!isCorrectOption && isSelected) {
        prefix = '✗ ' // Incorrect and selected
      }

      addText(`${prefix}${option.text}`, 10, false)
    })

    // Add user answer
    addText(yourAnswerText, 10, false)

    // Add correct answer
    addText(correctAnswerText, 10, false)

    // Add explanation if incorrect
    if (!isCorrect) {
      addText(`Explanation: ${question.explanation}`, 10, false)
    }

    // Add separator
    yPosition += 10
  }

  // Add title
  addText('Quiz Results Report', 20, true)
  addText(quiz.title, 16, true)

  // Add quiz information
  addText('Quiz Information:', 14, true)
  addText(`Description: ${quiz.description}`, 10, false)
  addText(`Difficulty: ${quiz.difficulty}`, 10, false)
  addText(`Categories: ${quiz.categories.join(', ')}`, 10, false)
  addText(`Time Limit: ${formatTime(quiz.timeLimit)}`, 10, false)
  addText(`Time Elapsed: ${formatTime(result.timeElapsed)}`, 10, false)

  // Add performance summary
  addText('Performance Summary:', 14, true)
  addText(`Score: ${Math.round(result.score)}%`, 12, true)
  addText(`Correct Answers: ${result.correctAnswers}`, 10, false)
  addText(
    `Incorrect Answers: ${result.totalQuestions - result.correctAnswers}`,
    10,
    false
  )
  addText(`Total Questions: ${result.totalQuestions}`, 10, false)

  // Add detailed results
  addText('Detailed Results:', 14, true)

  // Add each question
  quiz.questions.forEach((question, index) => {
    addQuestion(question, index)
  })

  // Add footer
  addText(
    `Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    8,
    false
  )
  addText(
    `Quiz completed on ${result.completedAt.toLocaleDateString()} at ${result.completedAt.toLocaleTimeString()}`,
    8,
    false
  )

  // Save PDF
  const fileName = `quiz-results-${quiz.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

// Helper function to validate answer (copied from quiz utils)
const validateAnswer = (question: any, userAnswers: string[]): boolean => {
  if (!userAnswers || userAnswers.length === 0) return false

  const correctAnswerIds = question.correctAnswerIds
  if (!correctAnswerIds || correctAnswerIds.length === 0) return false

  // For single choice questions
  if (question.type === 'single') {
    return userAnswers.length === 1 && correctAnswerIds.includes(userAnswers[0])
  }

  // For multiple choice questions
  if (question.type === 'multiple') {
    if (userAnswers.length !== correctAnswerIds.length) return false

    return (
      userAnswers.every((answer: string) =>
        correctAnswerIds.includes(answer)
      ) &&
      correctAnswerIds.every((answer: string) => userAnswers.includes(answer))
    )
  }

  return false
}

// Helper function to get difficulty color
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return '#4caf50'
    case 'medium':
      return '#ff9800'
    case 'hard':
      return '#f44336'
    default:
      return '#9e9e9e'
  }
}
