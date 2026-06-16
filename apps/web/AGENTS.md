# Codex Frontend Rules

These rules apply to the ecommerce frontend. Follow them whenever adding or changing UI code.

## Stack and structure

- Use Next.js App Router, TypeScript, React Server Components by default.
- Add `use client` only when a component uses state, browser APIs, event handlers, Zustand, or router navigation.
- Keep reusable UI in `src/components/` and route-specific UI near the route.
- Use the existing API helpers from `src/lib/api.ts`; do not duplicate fetch utilities.
- Use existing cart state from `src/store/cart.ts` for cart operations.

## Typography and Merchant Center readability

Google Merchant Center and Google UX reviews require a trustworthy, readable shopping experience. Do not make ecommerce content look too small.

### Global base

- Body text: `16px` minimum on desktop, `15px` minimum on mobile.
- Body line-height: `1.6` to `1.75`.
- Prefer `font-medium` and `font-semibold`; avoid `font-bold` unless the element is a badge, brand mark, or strong CTA.
- Do not use `text-gray-400` for important text on white backgrounds. Prefer `text-gray-600`, `text-gray-700`, or `text-gray-800`.

### Do not use tiny text for important ecommerce content

Never use `text-xs`, `text-[10px]`, `text-[11px]`, `text-[12px]`, or `text-[13px]` for:

- Product title
- Product price
- Checkout form fields
- Checkout totals
- Add-to-cart / buy-now buttons
- Navigation menu labels
- Policy content
- Product description
- Product specification
- Contact information

Tiny text is allowed only for badges, discount labels, helper metadata, or decorative text.

## Component typography targets

### Header

- Search input: `text-base`, height at least `44px`.
- Desktop menu: `text-[15px]` or `text-base`, `font-medium` or `font-semibold`.
- Cart button: at least `44px` height.

### Product card

- Brand/category label: `text-xs` minimum.
- Product title: `text-sm md:text-[15px]`, `font-semibold`, readable line-height.
- Price: `text-lg md:text-xl`, `font-semibold`.
- Old price: `text-sm` minimum.
- Add-to-cart button: height at least `40px`, `text-sm`, `font-semibold`.

### Product detail

- H1: `text-2xl md:text-3xl`, `font-semibold`.
- Main price: `text-3xl md:text-4xl`, `font-semibold`.
- Body/specification: `text-base`, `leading-8` on desktop.
- CTA buttons: height at least `52px`, `text-base`, `font-semibold`.

### Checkout

- Form labels: `text-sm`, `font-semibold`.
- Inputs and textarea: `text-base`, height at least `48px`.
- Order item title: `text-sm md:text-base`.
- Total amount: `text-2xl md:text-3xl`, `font-semibold`.
- Submit button: `text-base`, height at least `52px`.

### Footer

- Normal text: `text-base` for company/contact blocks when there is room.
- Links: `text-sm md:text-base`.
- Hotline: `text-lg`, `font-semibold`.

## Accessibility and trust

- All clickable controls must have at least `40px` height on desktop and `44px` on mobile when practical.
- Use semantic `button`, `a`, `nav`, `main`, `section`, `article`, `aside`, and headings.
- Every image must have useful `alt` text.
- Keep pricing, stock status, warranty, shipping, return, contact, and business information visible and readable.

## Tailwind conventions

- Prefer Tailwind utilities over custom CSS.
- Use custom arbitrary sizes only when matching the template exactly.
- Avoid dense one-line JSX for complex UI.
- Keep class names readable and grouped: layout → spacing → border/background → typography → states.
