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
