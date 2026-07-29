# Codirity Design System

> Design style guide for building consistent UI components with Shadcn and Tailwind CSS.

---

## Brand Colors

### Primary Palette

```css
/* Green - Primary Brand Color */
--green-dark: #163F31      /* Dark green for text, dark backgrounds */
--green-main: #1E5C46      /* Primary actions, CTAs, accents */
--green-light: #4E8D74     /* Highlights, gradients, hover states */
```

### Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#163F31',
          DEFAULT: '#1E5C46',
          light: '#4E8D74',
        },
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#9aa0a6',
          500: '#80868b',
          600: '#5f6368',
          700: '#3c4043',
          800: '#202124',
          900: '#171717',
        },
      },
    },
  },
}
```

### Usage Guidelines

| Use Case | Color | Tailwind Class |
|----------|-------|----------------|
| Primary buttons | `#1E5C46` | `bg-brand` |
| Button hover | `#163F31` | `hover:bg-brand-dark` |
| Links | `#1E5C46` | `text-brand` |
| Success states | `#1E5C46` | `text-brand` |
| Accent borders | `#1E5C46` | `border-brand` |
| Subtle backgrounds | `rgba(50,205,50,0.08)` | `bg-brand/[0.08]` |
| Focus rings | `#1E5C46` | `ring-brand` |

---

## Typography

### Font Family

```js
// tailwind.config.js
fontFamily: {
  sans: ['Outfit', 'system-ui', 'sans-serif'],
  mono: ['Space Mono', 'monospace'],
}
```

**Primary Font:** Outfit (headings, body text)
**Monospace Font:** Space Mono (code, metrics, labels)

### Type Scale

| Element | Size | Weight | Tracking | Class |
|---------|------|--------|----------|-------|
| H1 | 3.5rem - 4.5rem | 800 | -2.5px | `text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter` |
| H2 | 2.25rem - 3rem | 700 | -1.5px | `text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight` |
| H3 | 1.25rem - 1.5rem | 700 | -0.5px | `text-xl md:text-2xl font-bold` |
| Body | 1rem - 1.1rem | 400 | normal | `text-base md:text-lg` |
| Small | 0.875rem | 500 | normal | `text-sm font-medium` |
| Label | 0.75rem | 700 | 3px | `text-xs font-bold uppercase tracking-widest` |
| Mono/Metrics | varies | 700 | normal | `font-mono font-bold` |

### Text Colors

```jsx
// Primary text
<p className="text-gray-900 dark:text-white">

// Secondary text
<p className="text-gray-600 dark:text-gray-400">

// Muted text
<p className="text-gray-500 dark:text-gray-500">

// Brand accent text
<p className="text-brand">
```

---

## Spacing & Layout

### Container

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Section Padding

```jsx
// Standard section
<section className="py-16 md:py-24 lg:py-28 px-4 md:px-8">

// Compact section
<section className="py-12 md:py-16 px-4 md:px-8">
```

### Common Spacing

| Purpose | Value | Class |
|---------|-------|-------|
| Card padding | 24-40px | `p-6 md:p-10` |
| Element gap | 16-24px | `gap-4 md:gap-6` |
| Section gap | 64-80px | `space-y-16 md:space-y-20` |
| Grid gap | 24px | `gap-6` |

---

## Components

### Buttons

#### Primary Button

```jsx
<Button className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20">
  Contact Us
  <ArrowRight className="ml-2 h-5 w-5" />
</Button>
```

#### Secondary Button

```jsx
<Button variant="outline" className="border-gray-200 hover:border-brand hover:text-brand hover:bg-brand/[0.08] font-medium px-6 py-3 rounded-full transition-all duration-300">
  Learn More
</Button>
```

#### Ghost Button

```jsx
<Button variant="ghost" className="text-brand hover:bg-brand/[0.08] font-semibold">
  View Details
  <ArrowRight className="ml-1 h-4 w-4" />
</Button>
```

### Cards

#### Standard Card

```jsx
<Card className="bg-white border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-brand/30 hover:-translate-y-2 transition-all duration-400">
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Featured Card (Dark)

```jsx
<Card className="bg-gradient-to-br from-brand-dark to-[#1a5a1d] text-white border-0 rounded-3xl p-8 md:p-10">
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Card with Top Accent

```jsx
<Card className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden">
  <div className="h-1 bg-gradient-to-r from-brand-dark via-brand to-brand-light" />
  <CardContent className="p-6 md:p-8">
    {/* Content */}
  </CardContent>
</Card>
```

### Inputs

```jsx
<Input
  className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all duration-300"
  placeholder="Enter your email"
/>
```

### Select

```jsx
<Select>
  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 focus:border-brand focus:ring-2 focus:ring-brand/20">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Badges

```jsx
// Brand badge
<Badge className="bg-brand/[0.08] text-brand-dark border border-brand/20 rounded-full px-4 py-1.5 font-semibold text-sm">
  <span className="w-2 h-2 bg-brand rounded-full mr-2 animate-pulse" />
  New Feature
</Badge>

// Neutral badge
<Badge variant="secondary" className="bg-gray-100 text-gray-600 rounded-full">
  Coming Soon
</Badge>
```

### Icons

Use **Lucide React** icons with these standard sizes:

```jsx
// Small (inline with text)
<Icon className="h-4 w-4" />

// Medium (buttons, list items)
<Icon className="h-5 w-5" />

// Large (feature icons)
<Icon className="h-6 w-6" />

// Feature card icons
<div className="w-14 h-14 bg-gradient-to-br from-brand/[0.08] to-brand/[0.12] rounded-2xl flex items-center justify-center">
  <Icon className="h-7 w-7 text-brand" />
</div>
```

---

## Effects & Animations

### Shadows

```js
// tailwind.config.js
boxShadow: {
  'sm': '0 2px 8px rgba(0,0,0,0.06)',
  'md': '0 4px 16px rgba(0,0,0,0.08)',
  'lg': '0 12px 32px rgba(0,0,0,0.1)',
  'xl': '0 24px 48px rgba(0,0,0,0.12)',
  'brand': '0 12px 32px rgba(50, 205, 50, 0.2)',
}
```

### Transitions

```jsx
// Standard transition
className="transition-all duration-300"

// Smooth easing
className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"

// Hover lift effect
className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
```

### Focus States

```jsx
// Input focus
className="focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"

// Button focus
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
```

### Animations

```css
/* Pulse dot */
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Slide up (for reveals) */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Layout Patterns

### Bento Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Featured card spans 2 columns and 2 rows */}
  <Card className="md:col-span-2 md:row-span-2">
    {/* Content */}
  </Card>
  <Card>{/* Content */}</Card>
  <Card>{/* Content */}</Card>
</div>
```

### Two Column with Sticky Sidebar

```jsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 items-start">
  <div className="lg:sticky lg:top-32">
    {/* Sidebar content */}
  </div>
  <div>
    {/* Main content */}
  </div>
</div>
```

### Process/Timeline Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
  {/* Connecting line */}
  <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-gray-200 via-brand to-gray-200" />

  {steps.map((step, i) => (
    <div key={i} className="text-center relative z-10">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center font-mono text-xl font-bold text-gray-400 hover:bg-brand hover:border-brand hover:text-white transition-all duration-300">
        {String(i + 1).padStart(2, '0')}
      </div>
      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
      <p className="text-gray-500">{step.description}</p>
    </div>
  ))}
</div>
```

---

## Dark Mode

### Color Mapping

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `white` | `gray-900` |
| Surface | `gray-50` | `gray-800` |
| Border | `gray-200` | `gray-700` |
| Text primary | `gray-900` | `white` |
| Text secondary | `gray-600` | `gray-400` |
| Brand | `#1E5C46` | `#4E8D74` |

### Implementation

```jsx
// Background
className="bg-white dark:bg-gray-900"

// Card
className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"

// Text
className="text-gray-900 dark:text-white"
className="text-gray-600 dark:text-gray-400"
```

---

## Responsive Breakpoints

```js
// Tailwind defaults
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large
```

### Mobile-First Approach

```jsx
// Example: Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// Example: Padding
<section className="px-4 md:px-8 lg:px-16 py-12 md:py-20 lg:py-28">

// Example: Typography
<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
```

---

## Accessibility

### Focus Indicators

Always use visible focus states:

```jsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
```

### Color Contrast

- Body text on white: `gray-600` minimum (4.5:1 ratio)
- Headings on white: `gray-900` (15:1 ratio)
- Brand green on white: Use `brand-dark` for text (7:1 ratio)

### Interactive Elements

- Minimum touch target: 44x44px
- Always include hover AND focus states
- Use `aria-label` for icon-only buttons

---

## File Structure

```
src/
├── components/
│   ├── ui/           # Shadcn components
│   ├── layout/       # Header, Footer, Section
│   ├── forms/        # ContactForm, NewsletterForm
│   └── sections/     # Hero, Services, Process, etc.
├── styles/
│   └── globals.css   # Custom CSS, animations
├── lib/
│   └── utils.ts      # cn() helper, etc.
└── app/
    └── globals.css   # Tailwind imports
```

---

## Quick Reference

### Common Class Combinations

```jsx
// Primary CTA button
"bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand"

// Card with hover effect
"bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-brand/30 hover:-translate-y-2 transition-all duration-400"

// Section label
"text-xs font-bold uppercase tracking-widest text-brand font-mono"

// Icon container
"w-14 h-14 bg-gradient-to-br from-brand/[0.08] to-brand/[0.12] rounded-2xl flex items-center justify-center"

// Input field
"bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"

// Gradient text
"bg-gradient-to-r from-brand-dark via-brand to-brand-light bg-clip-text text-transparent"
```

---

*Last updated: December 2024*
