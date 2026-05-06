# Count Me In

A cozy knitting row counter app with an animated character companion.

## Stack
- React + TypeScript
- CSS Modules
- SVG + CSS animations
- Vite

## MVP Plan

### Setup
- [ ] Scaffold the project with Vite + React + TypeScript
- [ ] Set up CSS Modules and global base styles

### Onboarding
- [ ] Build the onboarding form (project name, session number, garment type, size)
- [ ] Add skip button that redirects with default values

### Counter
- [ ] Build the counter page layout
- [ ] Implement the increment button (click and spacebar)
- [ ] Implement pause and reset buttons

### Timing
- [ ] Track time of each increment and display "last incremented x minutes ago"
- [ ] Calculate and display average time per row
- [ ] Detect anomalous row time and prompt: "Did you miss a row?" (yes / no / I took a break)

### Character
- [ ] Draw the base SVG character (girl, criss-cross, cozy sweater, knitting)
- [ ] Animate the base idle state (knitting motion)
- [ ] Add checkpoint animation: cat stealing yarn
- [ ] Add checkpoint animation: coffee break

## Stretch Goals
- More character animations (try-on, humming, sleeping, stretching)
- Garment growing as rows increment
- Garment-specific part suggestions on onboarding
- Finish session button with downloadable stats summary
