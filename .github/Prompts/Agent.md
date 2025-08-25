# Prompt File: Dashboard Development

We are going to **develop the Dashboard Page**.  
The dashboard serves as the main hub for users after login.

---

## 🎯 Main Features

- Central Hub for managing user’s profile.
- Quick Actions:
  - Create Quiz
  - Join Game
  - View Analysis
  - Access Global Library
- Display user’s **Draft Quizzes**.
- Display user’s **Published Quizzes**.
- Show **basic analytics** (e.g., total quizzes, total plays, etc.).
- Responsive layout (desktop first, but mobile-friendly).

---

## 🛠 Procedures

1. **Create reusable UI components**:
   - `QuizCardPublished`
   - `QuizCardDraft`
   - `SearchBar`
   - `Modal` (for profile settings, quick actions, etc.)
   - `QuickActionButton` (reusable for different actions)

2. **Assemble Dashboard Layout**:
   - Sidebar (navigation, profile avatar, settings).
   - Top bar (search, quick actions).
   - Main content (draft & published quizzes).
   - Analytics section (small cards or charts).

---

## ⚡ Design & Styling Rules

- Background: same global background for consistency.
- Cards & Buttons:
  - Can have variations in style/colors, but **should not break global theme**.
  - Buttons may use accent colors for visual appeal.
- Use spacing and padding consistently (Tailwind recommended).
- Prioritize **visual clarity**: avoid clutter.
- Responsiveness: grid/flex layouts must adapt to mobile.

---

## ⚠️ Things to Take in Caution

- If a **reusable component exists**, reuse it instead of duplicating.
- If customization is needed, extend or modify the reusable component.
- Avoid too many different button styles – maintain visual balance.
- Keep accessibility in mind:
  - Sufficient contrast
  - Proper `alt` texts for images/icons
  - Keyboard navigation

---

## 📐 Additional Guidelines

- Naming conventions:
  - Components: `PascalCase`
  - CSS/Tailwind classes: consistent BEM-like or utility-first naming
- Keep logic separated from UI where possible (use hooks/services).
- Write small, composable components over large ones.
- Always test new UI components in isolation (storybook-style if possible).
- Add comments for non-trivial parts (why, not what).
- Ensure **error/loading/empty states** are covered for quiz lists and analytics.

---

## ✅ Following the above rules, **execute the next development step**.
