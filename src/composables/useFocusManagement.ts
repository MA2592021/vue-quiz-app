import { ref, onMounted, onUnmounted } from 'vue'

export function useFocusManagement() {
  const focusableElements = ref<HTMLElement[]>([])
  const currentFocusIndex = ref(0)
  const isFocusTrapped = ref(false)

  // Get all focusable elements within a container
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      'area[href]',
      'iframe',
      'object',
      'embed',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'v-btn',
      'v-radio',
      'v-checkbox',
      'v-card',
    ].join(', ')

    return Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]
  }

  // Focus trap for modals or specific sections
  const createFocusTrap = (container: HTMLElement) => {
    const elements = getFocusableElements(container)
    focusableElements.value = elements
    currentFocusIndex.value = 0

    if (elements.length > 0) {
      elements[0].focus()
      isFocusTrapped.value = true
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocusTrapped.value || elements.length === 0) return

      switch (event.key) {
        case 'Tab':
          event.preventDefault()
          if (event.shiftKey) {
            currentFocusIndex.value =
              currentFocusIndex.value > 0
                ? currentFocusIndex.value - 1
                : elements.length - 1
          } else {
            currentFocusIndex.value =
              currentFocusIndex.value < elements.length - 1
                ? currentFocusIndex.value + 1
                : 0
          }
          elements[currentFocusIndex.value].focus()
          break
        case 'Escape':
          isFocusTrapped.value = false
          break
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      isFocusTrapped.value = false
    }
  }

  // Skip to main content link
  const createSkipLink = () => {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'skip-link'
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    `

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px'
    })

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px'
    })

    document.body.appendChild(skipLink)
    return skipLink
  }

  // Focus first interactive element in a container
  const focusFirstInteractive = (container: HTMLElement) => {
    const elements = getFocusableElements(container)
    if (elements.length > 0) {
      elements[0].focus()
    }
  }

  // Focus last interactive element in a container
  const focusLastInteractive = (container: HTMLElement) => {
    const elements = getFocusableElements(container)
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
    }
  }

  // Move focus to next element
  const focusNext = (container: HTMLElement) => {
    const elements = getFocusableElements(container)
    const currentIndex = elements.findIndex(
      (el) => el === document.activeElement
    )

    if (currentIndex >= 0 && currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus()
    } else if (elements.length > 0) {
      elements[0].focus()
    }
  }

  // Move focus to previous element
  const focusPrevious = (container: HTMLElement) => {
    const elements = getFocusableElements(container)
    const currentIndex = elements.findIndex(
      (el) => el === document.activeElement
    )

    if (currentIndex > 0) {
      elements[currentIndex - 1].focus()
    } else if (elements.length > 0) {
      elements[elements.length - 1].focus()
    }
  }

  // Announce to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Add main content landmark
  const addMainContentLandmark = () => {
    const mainContent = document.querySelector('#main-content')
    if (mainContent) {
      mainContent.setAttribute('role', 'main')
      mainContent.setAttribute('tabindex', '-1')
    }
  }

  onMounted(() => {
    addMainContentLandmark()
    createSkipLink()
  })

  return {
    createFocusTrap,
    focusFirstInteractive,
    focusLastInteractive,
    focusNext,
    focusPrevious,
    announceToScreenReader,
    getFocusableElements,
    isFocusTrapped,
  }
}
