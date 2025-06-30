Fix all mobile responsiveness issues identified:

1. Navigation menu fixes:
   - Add proper spacing between mobile menu items
   - Ensure touch targets are minimum 44x44px
   - Fix hamburger menu visibility below 360px
   - Add backdrop blur on mobile menu open

2. Demo page upload zone:
   - Set min-height: 160px for drop zone
   - Use flex-col on mobile, flex-row on desktop
   - Ensure drop zone is fully tappable on all devices
   - Add visual feedback for drag states

3. SHA-256 display improvements:
   - Wrap in <code> blocks with monospace font
   - Add copy-to-clipboard button with icon
   - Ensure horizontal scroll on mobile if needed
   - Increase font size to minimum 14px

4. Form input accessibility:
   - Add proper aria-labels to all inputs
   - Ensure visible focus states (ring-2 ring-cyan-400)
   - Add error states with aria-live regions
   - Test with screen readers

5. Footer contrast fix:
   - Change to: bg-gray-900 text-gray-300
   - Ensure all links meet WCAG AA contrast
   - Add hover states: hover:text-cyan-400
