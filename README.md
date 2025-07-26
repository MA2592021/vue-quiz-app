# Vue Quiz App

A modern, accessible quiz application built with Vue 3, TypeScript, and Vuetify. Features include multi-language support (English/Arabic), keyboard navigation, theme switching, and PDF export functionality.

## 🚀 Features

- **Multi-language Support**: English and Arabic with RTL layout support
- **Accessibility**: Full keyboard navigation and screen reader support
- **Theme Switching**: Light and dark theme support
- **PDF Export**: Generate detailed quiz results reports
- **Responsive Design**: Works on desktop and mobile devices
- **Timer Support**: Configurable time limits for quizzes
- **Progress Tracking**: Real-time progress indicators
- **Results Analysis**: Detailed performance breakdown

## 📋 Setup Steps

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vue-quiz-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
vue-quiz-app/
├── src/
│   ├── components/          # Reusable Vue components
│   ├── modules/            # Main app modules (AppBar, Quiz, Results)
│   ├── views/              # Page components
│   ├── stores/             # Pinia stores
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── quizzes/            # Quiz data (JSON files)
│   ├── locales/            # i18n translation files
│   ├── plugins/            # Vue plugins (Vuetify, i18n)
│   └── assets/             # Static assets
├── public/                 # Public assets
└── dist/                   # Production build output
```

## 🎯 Implementation Details

### Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Automatic focus handling and visible focus indicators
- **High Contrast**: Support for high contrast themes

### Internationalization (i18n)

- **Multi-language Support**: English and Arabic
- **RTL Layout**: Proper right-to-left layout for Arabic
- **Dynamic Language Switching**: Real-time language changes
- **Localized Content**: All text content properly translated

## ⏱️ Time Spent

**Total Development Time**: ~5-6 hours

**Breakdown**:
- **Initial Setup & Architecture**: 1 hours
- **Core Quiz Functionality**: ~3.5 hours
- **Arabic Language Support**: ~0.5 hours
- **Accessibility & Polish**: 1 hour

## 🔮 Optional Improvements (If More Time Available)

### High Priority
1. **Custom Arabic Fonts**: Add proper Arabic font files (Noto Naskh Arabic) for better character rendering
2. **Advanced PDF Features**: Add charts, graphs, and more detailed analytics
3. **Quiz Analytics Dashboard**: Comprehensive performance tracking and insights

### Medium Priority
5. **More Quiz Types**: Multiple choice, fill-in-the-blank, coding challenges
6. **User Accounts**: User registration, progress tracking, and history
7. **Quiz Sharing**: Share quiz results via social media or email
8. **Advanced Timer**: Pause/resume functionality and time warnings

### Low Priority
9. **Quiz Creation Tool**: Allow users to create custom quizzes
10. **Leaderboards**: Compare scores with other users
11. **Gamification**: Badges, achievements, and progress rewards
12. **API Integration**: Connect to external quiz APIs

## 🧠 Thought Process & Implementation Steps

### Phase 1: Project Setup & Architecture
1. **Technology Stack Selection**: Chose Vue 3 + TypeScript + Vuetify for modern, type-safe development
2. **Project Structure**: Organized code into logical modules and components
3. **Build Configuration**: Set up Vite, ESLint, Prettier, and TypeScript

### Phase 2: Core Quiz Functionality
1. **Data Structure Design**: Created TypeScript interfaces for quizzes, questions, and results
2. **Quiz Engine**: Built core quiz logic with timer, scoring, and validation
3. **UI Components**: Created reusable components for questions, progress, and navigation

### Phase 3: Internationalization
1. **i18n Setup**: Configured Vue i18n with English and Arabic support
2. **RTL Layout**: Implemented proper right-to-left layout handling
3. **Translation Files**: Created comprehensive translation files for all UI text

### Phase 4: Accessibility & Polish
1. **Keyboard Navigation**: Implemented full keyboard support for all interactions
2. **Screen Reader Support**: Added proper ARIA labels and semantic HTML
3. **Focus Management**: Created focus handling utilities and visible indicators
4. **Theme Support**: Added light/dark theme switching

### Phase 5: PDF Export & Arabic Fix
1. **PDF Generation**: Implemented jsPDF-based PDF export functionality

### Key Technical Decisions

1. **Vue 3 Composition API**: Used for better TypeScript support and code organization
2. **Vuetify 3**: Chose for comprehensive UI components and accessibility features
3. **jsPDF**: Used for PDF generation with Unicode support
4. **TypeScript**: Implemented throughout for type safety and better developer experience

### Challenges & Solutions

1. **Accessibility**: Achieved through comprehensive ARIA implementation and keyboard navigation
2. **Type Safety**: Maintained through strict TypeScript configuration and proper interface definitions
3. **No Backend for PDF Export**: Faced challenges generating and downloading PDFs entirely on the client side without a backend, especially for large quizzes and right-to-left (RTL) content.
4. **Shuffling Answers & Correctness**: Ensured answer options are shuffled for each question while still accurately tracking and validating the correct answer.
5. **Saving Progress**: Implemented local progress saving so users can resume quizzes even after refreshing or closing the browser, despite not having a backend.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.
