# Keyboard Navigation and Accessibility Features

This document outlines the keyboard navigation and accessibility features implemented in the Vue Quiz App.

## Overview

The quiz app now includes comprehensive keyboard navigation and accessibility features to ensure it can be used effectively by users with disabilities and those who prefer keyboard navigation.

## Keyboard Shortcuts

### Global Shortcuts

- **H** - Go to Home page
- **Escape** - Go back or close modal
- **?** - Show keyboard shortcuts help

### Quiz Navigation Shortcuts

- **Arrow Left** - Previous question
- **Arrow Right** - Next question
- **Enter** - Submit answer or continue
- **Space** - Select/deselect answer option
- **1-5** - Select answer option 1-5 directly

### Navigation Controls

- **Tab** - Navigate between interactive elements
- **Shift + Tab** - Navigate backwards
- **Arrow Keys** - Navigate between answer options
- **Enter/Space** - Activate buttons and select options

## Accessibility Features

### Screen Reader Support

- ARIA labels and roles for all interactive elements
- Live regions for dynamic content updates
- Proper heading structure and landmarks
- Screen reader announcements for quiz progress

### Focus Management

- Skip to main content link
- Focus trapping for modals
- Automatic focus on first interactive element
- Visible focus indicators

### Visual Accessibility

- High contrast focus indicators
- Reduced motion support
- Dark mode compatibility
- Proper color contrast ratios

## Components with Keyboard Navigation

### QuizQuestion.vue

- Arrow key navigation between answer options
- Enter/Space to select options
- Proper ARIA attributes for radio buttons and checkboxes
- Focus management when questions load

### NavigationButtons.vue

- Keyboard activation for all navigation buttons
- Proper ARIA labels
- Focus indicators

### QuizCard.vue

- Keyboard activation for quiz selection
- Proper ARIA labels

### App.vue

- Main content landmark
- Skip link integration

## CSS Accessibility Features

### Focus Indicators

- Visible focus outlines for all interactive elements
- High contrast focus indicators
- Smooth transitions for focus states

### Reduced Motion

- Respects user's motion preferences
- Disables animations when `prefers-reduced-motion` is set

### High Contrast Mode

- Enhanced focus indicators for high contrast mode
- Proper color schemes for accessibility

## Usage

### For Developers

1. All interactive elements should have proper `tabindex` attributes
2. Use ARIA labels and roles appropriately
3. Test with keyboard navigation
4. Ensure focus indicators are visible

### For Users

1. Use Tab to navigate between elements
2. Use arrow keys to navigate answer options
3. Press Enter or Space to activate buttons
4. Press ? for keyboard shortcuts help
5. Use Escape to go back or close dialogs

## Testing

### Keyboard Navigation Testing

1. Navigate through the entire app using only keyboard
2. Test all interactive elements
3. Verify focus indicators are visible
4. Test with screen readers

### Accessibility Testing

1. Use screen reader software
2. Test with high contrast mode
3. Test with reduced motion preferences
4. Verify ARIA attributes are correct

## Browser Support

- Chrome/Edge (full support)
- Firefox (full support)
- Safari (full support)
- Mobile browsers (limited keyboard support)

## Future Enhancements

- Voice control integration
- Customizable keyboard shortcuts
- Advanced screen reader optimizations
- Haptic feedback for mobile devices
