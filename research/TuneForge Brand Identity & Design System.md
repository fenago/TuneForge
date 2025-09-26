# TuneForge Brand Identity & Design System

## Brand Identity

### Brand Essence
- **Creativity**: Empowering users to unleash their musical imagination.
- **Simplicity**: Making music creation accessible to everyone, regardless of technical skill.
- **Innovation**: Leveraging cutting-edge AI to redefine the boundaries of music.
- **Quality**: Delivering studio-quality tracks in seconds.
- **Accessibility**: Priced for hobbyists and professionals alike.
- **Legality**: Providing commercially licensed, worry-free music.

### Brand Voice
- **Tone**: Inspiring, encouraging, and empowering. The brand should feel like a creative partner.
- **Language**: Clear, concise, and benefit-oriented. Avoid overly technical jargon.
- **Communication Style**: Solution-oriented, focusing on the user's creative goals and how TuneForge helps achieve them.

### Brand Narrative
TuneForge empowers creators to bring their musical ideas to life. Whether you're a seasoned producer, an indie game developer, or a content creator, our AI-powered platform provides the tools to generate unique, studio-quality music in seconds. We handle the technical complexities so you can focus on what matters most: your creative vision. With TuneForge, you can create commercially licensed music that's ready for any project, without the traditional barriers of time, cost, or technical expertise.

## Design System

### Color Palette

#### Primary Colors
- **Gradient Base**: `linear-gradient(to right, #8A2BE2, #4B0082, #483D8B, #6A5ACD, #7B68EE, #9370DB)`
- **Primary Colors (Extracted from gradient)**:
  - `#8A2BE2` (Blue Violet) - Creativity
  - `#4B0082` (Indigo) - Depth
  - `#483D8B` (Dark Slate Blue) - Professionalism
  - `#6A5ACD` (Slate Blue) - Trust
  - `#7B68EE` (Medium Slate Blue) - Innovation
  - `#9370DB` (Medium Purple) - Inspiration

#### Secondary Colors
- **Dark Blue**: `#1a202c` (Primary Text)
- **Medium Gray**: `#718096` (Secondary Text)
- **Light Gray**: `#f7fafc` (Backgrounds)
- **White**: `#ffffff`
- **Black**: `#000000`

#### Functional Colors
- **Success**: `#48bb78`
- **Warning**: `#f59e0b`
- **Error**: `#f56565`
- **Info**: `#4299e1`

### Typography

#### Font Family
- **Primary Font**: **Inter**. A clean, modern, and highly-readable sans-serif font that is perfect for UI elements and body text. Its neutrality ensures that the focus remains on the user's content.
- **Secondary Font**: **DM Serif Display**. An elegant and sophisticated serif font for major headlines. Its high contrast and distinctive letterforms add a touch of class and creativity.

#### Font Sizes
| Element       | rem    | px  | line-height |
|---------------|--------|-----|-------------|
| H1            | 3rem   | 48px| 1.2         |
| H2            | 2.25rem| 36px| 1.25        |
| H3            | 1.875rem| 30px| 1.3         |
| H4            | 1.5rem | 24px| 1.4         |
| H5            | 1.25rem| 20px| 1.5         |
| H6            | 1rem   | 16px| 1.6         |
| Body (Regular)| 1rem   | 16px| 1.6         |
| Body (Small)  | 0.875rem| 14px| 1.6         |
| Body (XSmall) | 0.75rem| 12px| 1.6         |
| Display       | 4.5rem | 72px| 1.1         |
| Caption       | 0.75rem| 12px| 1.6         |

#### Font Weights
- Light (300)
- Regular (400)
- Medium (500)
- Semibold (600)
- Bold (700)

### UI Components

#### 21st.dev Components
- **Navigation**: Navbar, Breadcrumbs, Pagination
- **Layout**: Container, Grid, Flex
- **Forms**: Input, Textarea, Select, Checkbox, Radio, Button
- **Feedback**: Alert, Modal, Toast, Spinner
- **Data Display**: Table, Card, List
- **Disclosure**: Accordion, Tabs

#### MagicUI Components
- **Animated Cards**: For showcasing features or testimonials.
- **Hover Effects**: To add subtle, engaging feedback on interactive elements.
- **Scroll Animations**: To reveal content as the user scrolls, creating a more dynamic experience.
- **Testimonial Carousels**: To display social proof in an interactive way.
- **Animated Icons**: To bring life to the UI and draw attention to key actions.

#### reactbits.dev Components
- **Navigation**: Mega Menu, Sidebar
- **Layout**: Masonry Grid
- **Forms**: File Upload, Date Picker
- **Feedback**: Progress Bar
- **Data Display**: Chart, Timeline
- **Disclosure**: Tooltip, Popover

#### Custom Components
- **Music Generation Interface**: A dedicated component for users to input prompts, select styles, and generate music.
- **Credit Management Dashboard**: A widget showing the user's remaining credits, with a clear CTA to purchase more.
- **Song Player and Library**: A component to play, manage, and download generated songs.
- **Admin Analytics Dashboard**: A set of widgets for the admin to monitor user activity, revenue, and other key metrics.

### Micro-Interactions
- **Button Hover**: Subtle lift or color change.
- **Form Focus**: Highlighted border and subtle shadow.
- **Loading States**: Pulsing animations or skeleton loaders.
- **Success Actions**: A quick, satisfying checkmark animation.
- **Navigation**: Smooth transitions between pages.
- **Scrolling**: A subtle progress bar at the top of the page.

### Responsive Design
- **Mobile-First Approach**: The design will be optimized for mobile devices first, then scaled up for larger screens.
- **Breakpoints**: Standard Tailwind CSS breakpoints will be used:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px
- **Mobile Adaptations**: Simplified navigation (hamburger menu), stacked layouts, and larger touch targets.

### Accessibility
- **Color Contrast**: WCAG AA compliance.
- **Keyboard Navigation**: All interactive elements will be focusable and operable via keyboard.
- **Screen Reader Support**: ARIA attributes will be used to ensure a seamless experience for screen reader users.
- **Visible Focus Indicators**: Clear and consistent focus styles.
- **Respect for Reduced Motion**: Animations will be disabled for users who have enabled this setting.

### Dark/Light Mode
Both dark and light modes will be supported using DaisyUI themes. The system will automatically detect the user's preference, and a toggle will be provided for manual selection.

## Implementation Guidelines

### CSS Framework
- **Tailwind CSS**: For utility-first styling.
- **DaisyUI**: For pre-built components and theming.
- **Custom Utilities**: A dedicated file for any custom CSS that may be required.

### Animation Library
- **Framer Motion**: For complex animations and transitions.
- **Tailwind Animations**: For simple, utility-based animations.

### Icon System
- **Heroicons**: As the primary icon set.
- **Custom SVGs**: For any unique icons that may be required.

### Asset Management
- **SVG**: For icons and logos.
- **WebP**: For images.
- **MP4/WebM**: For videos.

### Code Structure
- **Component-Based Architecture**: The UI will be built using reusable React components.
- **Utility-First CSS**: Tailwind's utility classes will be used to style components directly in the markup.
- **Responsive Variants**: Tailwind's responsive variants will be used to create a mobile-first design.

## Design Tokens

```json
{
  "colors": {
    "primary": {
      "blue-violet": "#8A2BE2",
      "indigo": "#4B0082",
      "dark-slate-blue": "#483D8B",
      "slate-blue": "#6A5ACD",
      "medium-slate-blue": "#7B68EE",
      "medium-purple": "#9370DB"
    },
    "neutral": {
      "dark-blue": "#1a202c",
      "medium-gray": "#718096",
      "light-gray": "#f7fafc",
      "white": "#ffffff",
      "black": "#000000"
    },
    "functional": {
      "success": "#48bb78",
      "warning": "#f59e0b",
      "error": "#f56565",
      "info": "#4299e1"
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "Inter, sans-serif",
      "secondary": "\"DM Serif Display\", serif"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "borderRadius": {
    "sm": "0.125rem",
    "md": "0.25rem",
    "lg": "0.5rem",
    "xl": "1rem",
    "full": "9999px"
  }
}
```




## Logo

The selected logo is the typographic logo with the stylized 'o' resembling a vinyl record. The tagline 'AUDIO EXPERIENCE' reinforces the brand's focus on high-quality sound and the overall user experience.

![TuneForge Audio Experience Logo](https://private-us-east-1.manuscdn.com/sessionFile/VHOq3FrkGdDiKSsr6AOnWz/sandbox/Z90KDvBTyo6YzfnOvOuZO3-images_1758853744932_na1fn_L2hvbWUvdWJ1bnR1L2xvZ29fdmFyaWF0aW9uXzM.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVkhPcTNGcmtHZERpS1NzcjZBT25Xei9zYW5kYm94L1o5MEtEdkJUeW82WXpmbk92T3VaTzMtaW1hZ2VzXzE3NTg4NTM3NDQ5MzJfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyeHZaMjlmZG1GeWFXRjBhVzl1WHpNLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=uh~mP8J5gWLrNz5rRJ3TX144hkfYOgo~ti7estzyVKhmJ2KhadKlkQ5ZRSk32qyWNBfPPfH5cTE7uTzGuS5nvH929gppzVhi9MzcudNT4M1w7Crjb0a~ttKa3NT1uCAzLctA0NIkj-nJCtx64O0NJoKgxTgFbQBKeDqqBgWWaHatTKqydkHHhysMblCgQRIq4SxS3O~fEh5mlkgnugpGEx~crXyLkWDuB88uJSGzcUMUvLuO0tJ2N~91Q2~GPROs7rZSufkSXJ0c7K8247qfJFKfRvq5cJ8uGmIKD3sUBCUCfRZHkKUMOIOeOzU9CnXJXtYADGPhiH2p3i85Qi2nhw__)

