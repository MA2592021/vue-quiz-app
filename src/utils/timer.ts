import { ref, onMounted, onUnmounted } from 'vue'
import { getFromStorage, removeFromStorage, saveToStorage } from './storage'

interface TimerData {
  startTime: number
  elapsedTime: number
  isRunning: boolean
  timeLimit: number
}

export class SecureTimer {
  private timer: number | null = null
  private startTime = ref<number>(0)
  private elapsedTime = ref<number>(0)
  private isRunning = ref<boolean>(false)
  private timeLimit = ref<number>(300) // 5 minutes in seconds
  private quizId: string

  constructor(quizId: string, timeLimitSeconds: number = 300) {
    this.quizId = quizId
    this.timeLimit.value = timeLimitSeconds
    this.loadTimerState()
  }

  // Generate a unique key for this quiz timer
  private getStorageKey(): string {
    const key = `quiz_timer_${this.quizId}`
    return key
  }

  // Load timer state from localStorage
  private loadTimerState(): void {
    const storageKey = this.getStorageKey()
    const timerDataString = getFromStorage(storageKey)

    if (timerDataString) {
      const timerData = JSON.parse(timerDataString) as TimerData
      if (timerData) {
        this.startTime.value = timerData.startTime
        this.elapsedTime.value = timerData.elapsedTime
        this.isRunning.value = timerData.isRunning
        this.timeLimit.value = timerData.timeLimit || 300

        // If timer was running, adjust start time to account for elapsed time
        if (this.isRunning.value) {
          const now = Date.now()
          // Adjust start time so that elapsed time remains the same
          this.startTime.value = now - this.elapsedTime.value

          // Restart the timer if it was running
          this.timer = window.setInterval(() => {
            if (this.isRunning.value) {
              this.elapsedTime.value = Date.now() - this.startTime.value
              this.saveTimerState()
            }
          }, 1000)
        }
      }
    }
  }

  // Save timer state to localStorage
  private saveTimerState(): void {
    const storageKey = this.getStorageKey()
    const timerData: TimerData = {
      startTime: this.startTime.value,
      elapsedTime: this.elapsedTime.value,
      isRunning: this.isRunning.value,
      timeLimit: this.timeLimit.value,
    }

    saveToStorage(storageKey, JSON.stringify(timerData))
  }

  // Start the timer
  start(): void {
    if (!this.isRunning.value) {
      this.isRunning.value = true

      // If we have existing elapsed time, preserve it
      if (this.elapsedTime.value === 0) {
        this.startTime.value = Date.now()
      } else {
        // Adjust start time to account for existing elapsed time
        this.startTime.value = Date.now() - this.elapsedTime.value
      }

      this.saveTimerState()

      this.timer = window.setInterval(() => {
        if (this.isRunning.value) {
          this.elapsedTime.value = Date.now() - this.startTime.value
          this.saveTimerState()
        }
      }, 1000)
    }
  }

  // Pause the timer
  pause(): void {
    if (this.isRunning.value) {
      this.isRunning.value = false
      this.saveTimerState()

      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  }

  // Stop the timer and reset
  stop(): void {
    this.isRunning.value = false
    this.elapsedTime.value = 0
    this.startTime.value = 0
    this.saveTimerState()

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  // Get remaining time in seconds
  getRemainingTime(): number {
    const elapsed = Math.floor(this.elapsedTime.value / 1000)
    const remaining = this.timeLimit.value - elapsed
    return Math.max(0, remaining)
  }

  // Get formatted countdown time string (MM:SS)
  getFormattedTime(): string {
    const remainingSeconds = this.getRemainingTime()
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Check if time is up
  isTimeUp(): boolean {
    return this.getRemainingTime() <= 0
  }

  // Check if timer is running
  getIsRunning(): boolean {
    return this.isRunning.value
  }

  // Check if timer has existing data
  hasExistingData(): boolean {
    const storageKey = this.getStorageKey()
    const encodedData = getFromStorage(storageKey)
    return encodedData !== null
  }

  // Clean up timer data from localStorage
  cleanup(): void {
    const storageKey = this.getStorageKey()
    if (storageKey) {
      removeFromStorage(storageKey)
    }

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}

// Composable for using the timer in Vue components
export function useSecureTimer(quizId: string) {
  const timer = new SecureTimer(quizId)
  const elapsedTime = ref<number>(0)
  const formattedTime = ref<string>('00:00')
  const isRunning = ref<boolean>(false)

  const updateTimer = () => {
    elapsedTime.value = timer.getRemainingTime()
    formattedTime.value = timer.getFormattedTime()
    isRunning.value = timer.getIsRunning()
  }

  const startTimer = () => {
    timer.start()
    updateTimer()
  }

  const pauseTimer = () => {
    timer.pause()
    updateTimer()
  }

  const stopTimer = () => {
    timer.stop()
    updateTimer()
  }

  const cleanupTimer = () => {
    timer.cleanup()
  }

  // Update timer display every second
  let displayTimer: number | null = null

  onMounted(() => {
    // Immediately update timer state from localStorage
    updateTimer()

    // If timer was running, restart the display timer
    if (isRunning.value) {
      displayTimer = window.setInterval(updateTimer, 1000)
    } else {
      // If timer was paused, still update display but don't start interval
      displayTimer = window.setInterval(updateTimer, 1000)
    }
  })

  onUnmounted(() => {
    if (displayTimer) {
      clearInterval(displayTimer)
    }
  })

  return {
    elapsedTime,
    formattedTime,
    isRunning,
    startTimer,
    pauseTimer,
    stopTimer,
    cleanupTimer,
    isTimeUp: () => timer.isTimeUp(),
    hasExistingData: () => timer.hasExistingData(),
  }
}
