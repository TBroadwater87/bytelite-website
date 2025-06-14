#!/bin/bash

echo "Setting up ByteLite website structure..."

# Create Layout.astro
cat > src/layouts/Layout.astro << 'EOF'
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

export interface Props {
  title: string;
  description?: string;
}

const { title, description = 'ByteLite - Revolutionary compression technology achieving 1TB to 18 bytes compression ratios.' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <BaseHead title={title} description={description} />
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
EOF

# Create BaseHead.astro
cat > src/components/BaseHead.astro << 'EOF'
---
export interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="generator" content={Astro.generator} />

<!-- Primary Meta Tags -->
<title>{title} | ByteLite</title>
<meta name="title" content={\`\${title} | ByteLite\`} />
<meta name="description" content={description} />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={\`\${title} | ByteLite\`} />
<meta property="og:description" content={description} />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={canonicalURL} />
<meta property="twitter:title" content={\`\${title} | ByteLite\`} />
<meta property="twitter:description" content={description} />

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
EOF

echo "✓ Layout files created"

# Create a simple index page to test
cat > src/pages/index.astro << 'EOF'
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Revolutionary Data Compression">
  <section class="hero">
    <div class="container">
      <h1>1TB → 18 Bytes. This is ByteLite.</h1>
      <p>Revolutionary compression technology that defies conventional limits.</p>
    </div>
  </section>
</Layout>

<style>
  .hero {
    padding: 6rem 0;
    text-align: center;
  }
</style>
EOF

echo "✓ Test index page created"
echo "Setup complete! Run 'npm run dev' to see your site."

