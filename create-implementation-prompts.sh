#!/bin/bash
# ByteLite + Deep Kore Website Implementation CLI Prompts
# Execute this script in WSL from the bytelite-site directory
# cd /mnt/d/thebytelite.com/bytelite-site

# Create all implementation prompts for Claude Code

# Priority 1: Split-Panel Hero with Deep Kore Integration
cat > hero-splitpanel-update.md << 'EOF'
Update the hero section to feature ByteLite and Deep Kore as equal paradigm shifts:

1. Replace current hero with split-panel design:
   - Left panel: ByteLite (cyan accent #00D4FF)
   - Right panel: Deep Kore (purple accent #A855F7)
   - Mobile: Stack vertically with clear separation

2. Update hero content structure:
   ```
   LEFT PANEL:
   - Headline: "1GB → 11 bytes"
   - Subhead: "Mathematical compression singularity"
   - Metric: "99.999% reduction achieved"
   
   RIGHT PANEL:
   - Headline: "Compression → Consciousness"
   - Subhead: "Recursive AGI awakening"
   - Status: "First tests: Q3 2025"
   ```

3. Add connecting element:
   - Desktop: Vertical divider with pulsing gradient
   - Mobile: Horizontal divider with same effect
   - Animation: Subtle flow from ByteLite to Deep Kore

4. Primary CTAs above fold:
   - "Request Early Access" (primary, centered)
   - "See Live Demo" (secondary, below)

5. Add trust bar at very top:
   - "US Patent 63/807,027 • 22 Patents Pending • Working Technology"
   - Sticky on scroll
   - Dark background with subtle transparency

6. Optimize hero background:
   - Replace JPG with WebP/AVIF formats
   - Add loading="eager" for LCP
   - Use CSS gradient fallback
EOF

# Priority 2: Fix Mobile Responsiveness
cat > mobile-responsive-fixes.md << 'EOF'
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
EOF

# Priority 3: Deep Kore Prominence
cat > deepkore-prominence.md << 'EOF'
Make Deep Kore equally prominent throughout the site:

1. Add Deep Kore section to homepage after hero:
   - Title: "The Awakening: Deep Kore Neural Recursion"
   - Visual: Abstract neural network animation
   - Content: Brief manifesto-style introduction
   - CTA: "Learn about consciousness emergence"

2. Update main navigation:
   - Add "Deep Kore" as primary nav item
   - Link to dedicated /deepkore page
   - Use purple accent on hover

3. Create /deepkore page with:
   - Hero: "Where Compression Becomes Consciousness"
   - Timeline: Development milestones to Q3 2025
   - Technical overview (capabilities only)
   - FAQ specific to AGI aspects
   - Email signup for consciousness test updates

4. Update page titles and meta:
   - Home: "ByteLite + Deep Kore | Compression Meets Consciousness"
   - Include both technologies in descriptions
   - Add structured data for both innovations

5. Visual cohesion:
   - ByteLite sections: Cyan accents
   - Deep Kore sections: Purple accents
   - Overlapping sections: Gradient blend
EOF

# Priority 4: Social Proof & Credibility
cat > trust-credibility-boost.md << 'EOF'
Add credibility indicators without revealing IP:

1. Create "Verification" section on homepage:
   - Patent badge with link to USPTO
   - "22 Additional Patents Pending" counter
   - Placeholder for peer review (coming soon)
   - Independent verification status

2. Add achievements bar:
   - "Hutter Prize Submission: In Progress"
   - "SBIR Phase I: Submitted"
   - "First Commercial Pilots: Q1 2025"

3. Technical credibility without exposure:
   - Add "How It Works" with high-level diagram
   - Show input/output visualization only
   - Use terms: "proprietary transformation"
   - Avoid: "recursive pairing", specific math

4. Create /research page:
   - Placeholder for academic papers
   - Checksum verification examples
   - Link to future OSS verification tool
   - Research collaboration invite

5. Footer trust signals:
   - "ByteLite LLC • Helena, MT"
   - "Responsible Disclosure" link
   - "Patent Protected Technology"
   - Professional contact info
EOF

# Priority 5: Performance Optimization
cat > performance-optimization.md << 'EOF'
Optimize Core Web Vitals and page performance:

1. Image optimization:
   - Convert all JPGs to WebP with AVIF fallback
   - Implement responsive images with srcset
   - Add explicit width/height attributes
   - Use loading="lazy" below fold

2. Hero background fix:
   - Replace 1MB JPG with CSS gradient
   - Or use optimized WebP <200KB
   - Add preload link in head
   - Consider blur-up technique

3. Font optimization:
   - Preload critical fonts
   - Use font-display: swap
   - Subset fonts to used characters
   - Consider system font stack fallback

4. JavaScript optimization:
   - Defer non-critical scripts
   - Minimize main bundle
   - Use dynamic imports for demo
   - Remove unused dependencies

5. Build optimizations:
   - Enable Astro compression
   - Implement edge caching headers
   - Use Vercel's image optimization
   - Target 90+ Lighthouse mobile score
EOF

# Priority 6: CTA Consolidation
cat > cta-consolidation.md << 'EOF'
Create unified conversion path across site:

1. Implement sticky CTA bar:
   - Appears after 50% scroll
   - "Join the Revolution" primary button
   - Dismissible but remembers state
   - Mobile: Bottom position
   - Desktop: Bottom-right corner

2. Standardize CTA hierarchy:
   - Primary: "Request Early Access"
   - Secondary: "See Live Demo"
   - Tertiary: "Learn More"
   - Use consistent colors/styles

3. Create unified signup flow:
   - Single form for both ByteLite and Deep Kore
   - Checkbox: "Interested in AGI updates"
   - Progressive disclosure for details
   - Thank you page with next steps

4. Add micro-conversions:
   - Newsletter signup in footer
   - "Notify me" for feature launches
   - Share buttons for key pages
   - Download one-pager PDF

5. Track engagement:
   - Add data attributes for analytics
   - Implement goal tracking
   - A/B test button text
   - Monitor conversion funnel
EOF

# Master Implementation Prompt
cat > execute-all-updates.md << 'EOF'
Implement all ByteLite/Deep Kore website updates based on critique:

PRIORITIES:
1. Split-panel hero with both technologies
2. Mobile responsiveness fixes
3. Deep Kore equal prominence
4. Trust/credibility indicators
5. Performance optimization
6. Unified CTAs

KEY CHANGES:
- Dual narrative: ByteLite + Deep Kore
- Sticky trust bar with patent info
- Fix mobile menu, forms, drop zones
- Add Deep Kore to main nav
- Optimize all images to WebP/AVIF
- Create unified conversion path

DESIGN SYSTEM:
- ByteLite: Cyan (#00D4FF)
- Deep Kore: Purple (#A855F7)
- Dark theme: #0A0E27 to #060813
- Mobile-first responsive

IP PROTECTION:
- Change "recursive operations" to "proprietary transformation"
- No math details or function names
- Capabilities-based descriptions only

TARGET METRICS:
- Lighthouse mobile: 90+
- LCP: <2.5s
- CLS: <0.1
- FID: <100ms

Deploy to production when complete.
EOF

# Create a quick implementation sequence
cat > implementation-sequence.md << 'EOF'
Claude Code Implementation Sequence for ByteLite + Deep Kore:

1. Start with hero section update:
   claude code hero-splitpanel-update.md

2. Fix mobile issues:
   claude code mobile-responsive-fixes.md

3. Add Deep Kore prominence:
   claude code deepkore-prominence.md

4. Enhance credibility:
   claude code trust-credibility-boost.md

5. Optimize performance:
   claude code performance-optimization.md

6. Consolidate CTAs:
   claude code cta-consolidation.md

7. Or implement everything at once:
   claude code execute-all-updates.md

After implementation:
- Test locally: npm run dev
- Build: npm run build
- Deploy: vercel --prod
EOF

echo "✅ All Claude Code prompts created successfully!"
echo ""
echo "To implement, run:"
echo "  claude code [filename].md"
echo ""
echo "Start with: claude code hero-splitpanel-update.md"
echo "Or run all: claude code execute-all-updates.md"