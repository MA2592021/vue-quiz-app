import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  description: string
  action: () => void
}

export function useKeyboardNavigation() {
  const router = useRouter()
  const isKeyboardNavigationEnabled = ref(true)
  const shortcuts = ref<KeyboardShortcut[]>([])
  const isHelpShowing = ref(false)

  // Global navigation shortcuts
  const globalShortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      description: 'Go to Home',
      action: () => router.push('/'),
    },
    {
      key: 's',
      description: 'Open Settings',
      action: () => emit('open-settings'),
    },
    {
      key: 'Escape',
      description: 'Go back or close modal',
      action: () => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      },
    },
    {
      key: '0',
      description: 'Show keyboard shortcuts help',
      action: () => showKeyboardHelp(),
    },
  ]

  // Quiz-specific shortcuts
  const quizShortcuts: KeyboardShortcut[] = [
    {
      key: 'ArrowLeft',
      description: 'Previous question',
      action: () => emit('previous'),
    },
    {
      key: 'ArrowRight',
      description: 'Next question',
      action: () => emit('next'),
    },
    {
      key: 'Enter',
      description: 'Submit answer or continue',
      action: () => emit('submit'),
    },
    {
      key: 'Space',
      description: 'Select/deselect answer option',
      action: () => emit('toggle-option'),
    },
    {
      key: '1',
      description: 'Select option 1',
      action: () => emit('select-option', 0),
    },
    {
      key: '2',
      description: 'Select option 2',
      action: () => emit('select-option', 1),
    },
    {
      key: '3',
      description: 'Select option 3',
      action: () => emit('select-option', 2),
    },
    {
      key: '4',
      description: 'Select option 4',
      action: () => emit('select-option', 3),
    },
    {
      key: '5',
      description: 'Select option 5',
      action: () => emit('select-option', 4),
    },
  ]

  let emit = (event: string, data?: any) => {
    // This will be overridden by the component using this composable
    console.log(`Keyboard event: ${event}`, data)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isKeyboardNavigationEnabled.value) return

    // Don't handle shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return
    }

    const key = event.key
    const ctrl = event.ctrlKey
    const alt = event.altKey
    const shift = event.shiftKey

    // Check global shortcuts first (these work everywhere)
    for (const shortcut of globalShortcuts) {
      if (
        key === shortcut.key &&
        ctrl === (shortcut.ctrl || false) &&
        alt === (shortcut.alt || false) &&
        shift === (shortcut.shift || false)
      ) {
        event.preventDefault()
        shortcut.action()
        return
      }
    }

    // Check quiz shortcuts
    for (const shortcut of quizShortcuts) {
      if (
        key === shortcut.key &&
        ctrl === (shortcut.ctrl || false) &&
        alt === (shortcut.alt || false) &&
        shift === (shortcut.shift || false)
      ) {
        event.preventDefault()
        shortcut.action()
        return
      }
    }
  }

  const showKeyboardHelp = () => {
    if (isHelpShowing.value) return // Prevent duplicate popups

    isHelpShowing.value = true
    const allShortcuts = [...globalShortcuts, ...quizShortcuts]
    const helpText = allShortcuts
      .map((shortcut) => `${shortcut.key}: ${shortcut.description}`)
      .join('\n')

    // You can implement a modal or toast to show this
    console.log('Keyboard Shortcuts:\n' + helpText)
    alert('Keyboard Shortcuts:\n' + helpText)

    // Reset after a short delay
    setTimeout(() => {
      isHelpShowing.value = false
    }, 1000)
  }

  const enableKeyboardNavigation = () => {
    isKeyboardNavigationEnabled.value = true
  }

  const disableKeyboardNavigation = () => {
    isKeyboardNavigationEnabled.value = false
  }

  const setEmitFunction = (emitFn: (event: string, data?: any) => void) => {
    emit = emitFn
  }

  const setHelpShowing = (showing: boolean) => {
    isHelpShowing.value = showing
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    isKeyboardNavigationEnabled,
    enableKeyboardNavigation,
    disableKeyboardNavigation,
    setEmitFunction,
    setHelpShowing,
    showKeyboardHelp,
    globalShortcuts,
    quizShortcuts,
  }
}
