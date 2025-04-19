document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const analyzeBtn = document.getElementById('analyze-btn');
  const errorMessage = document.getElementById('error-message');
  const loadingSpinner = document.getElementById('loading-spinner');
  const previewSection = document.getElementById('preview-section');
  const previewContent = document.getElementById('preview-content');
  const downloadBtn = document.getElementById('download-btn');
  const feedbackSection = document.getElementById('feedback-section');
  const feedbackRating = document.getElementById('feedback-rating');
  const feedbackComment = document.getElementById('feedback-comment');
  const submitFeedback = document.getElementById('submit-feedback');
  const themeToggle = document.getElementById('theme-toggle');
  const { jsPDF } = window.jspdf;

  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('bg-dark');
    document.body.classList.toggle('bg-light');
    themeToggle.textContent = document.body.classList.contains('bg-dark') ? 'Switch to Light' : 'Switch to Dark';
  });

  // Tech Stack Patterns
  const TECH_PATTERNS = {
    'WordPress': [/wp-content/, /<meta name="generator" content="WordPress/i],
    'Drupal': [/drupal\.js/, /<meta name="generator" content="Drupal/i],
    'Joomla': [/<meta name="generator" content="Joomla/i],
    'jQuery': [/jquery.*\.min\.js/i],
    'React': [/react.*\.production\.min\.js/i],
    'Bootstrap': [/bootstrap.*\.min\.css/i, /class=".*btn.*"/i],
    'Tailwind': [/tw-[\w-]+/],
    'Google Analytics': [/gtag\.js/, /UA-\d+/i],
    'Hotjar': [/hotjar.*\.js/i]
  };

  // Analyze Keywords
  function analyzeKeywords(textContent) {
    const words = textContent.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    const totalWords = words.length;
    return Object.entries(wordCounts)
      .filter(([word]) => word.length > 3 && !['this', 'that', 'with', 'from'].includes(word))
      .map(([word, count]) => ({ word, count, density: (count / totalWords) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Detect Tech Stack
  function detectTech(html, scripts) {
    const detected = [];
    for (const [tech, patterns] of Object.entries(TECH_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(html) || scripts.some(script => pattern.test(script)))) {
        detected.push(tech);
      }
    }
    return detected.length ? detected : ['None detected'];
  }

  // Estimate Traffic
  function estimateTraffic(metaTags, links, scripts, socialLinks) {
    let seoScore = 0;
    if (metaTags.description && metaTags.description.length >= 120 && metaTags.description.length <= 160) {
      seoScore += 30;
    }
    if (metaTags.keywords) {
      seoScore += 20;
    }
    const socialScore = socialLinks.length * 5;
    const adScripts = scripts.filter(script => /adsbygoogle|doubleclick/.test(script)).length;
    return {
      seo: Math.max(40, seoScore),
      social: Math.min(30, socialScore + (socialLinks.length ? 10 : 0)),
      paid: adScripts > 0 ? 20 : 10,
      referral: 10
    };
  }

  // Measure Performance
  function measurePerformance(html, loadTime) {
    const mobileFriendly = /viewport.*width=device-width/.test(html);
    return { loadTime, mobileFriendly };
  }

  // Detect Backlinks (Simplified)
  function detectBacklinks(links) {
    const externalLinks = links.filter(link => link.startsWith('http') && !link.includes(urlInput.value));
    return externalLinks.slice(0, 5).length ? externalLinks.slice(0, 5) : ['None detected'];
  }

  // Generate PDF
  function generatePDF(data) {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(13, 110, 253);
    doc.text('Competitor Website Analysis Report', 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`URL: ${data.url}`, 20, 30);

    // SEO Analysis
    doc.setFontSize(14);
    doc.text('SEO Analysis', 20, 40);
    doc.setFontSize(10);
    doc.text(`Title: ${data.metaTags.title || 'N/A'}`, 20, 50);
    doc.text(`Description: ${data.metaTags.description || 'N/A'}`, 20, 60);
    doc.text(`Keywords: ${data.metaTags.keywords || 'N/A'}`, 20, 70);
    doc.text(`H1 Tags: ${data.h1s.join(', ') || 'None'}`, 20, 80);

    // Keywords
    doc.setFontSize(14);
    doc.text('Top Keywords', 20, 90);
    data.keywords.forEach((kw, i) => {
      doc.setFontSize(10);
      doc.text(`${kw.word}: ${kw.count} (${kw.density.toFixed(2)}%)`, 20, 100 + i * 10);
    });

    // Tech Stack
    doc.setFontSize(14);
    doc.text('Technology Stack', 20, 150);
    data.techStack.forEach((tech, i) => {
      doc.setFontSize(10);
      doc.text(tech, 20, 160 + i * 10);
    });

    // Backlinks
    doc.setFontSize(14);
    doc.text('Top Backlinks', 20, 190);
    data.backlinks.forEach((link, i) => {
      doc.setFontSize(10);
      doc.text(link, 20, 200 + i * 10);
    });

    // Social Media
    doc.setFontSize(14);
    doc.text('Social Media Presence', 20, 230);
    data.socialLinks.forEach((link, i) => {
      doc.setFontSize(10);
      doc.text(link, 20, 240 + i * 10);
    });

    // Performance
    doc.setFontSize(14);
    doc.text('Performance Metrics', 20, 270);
    doc.setFontSize(10);
    doc.text(`Load Time: ${data.performance.loadTime.toFixed(2)}s`, 20, 280);
    doc.text(`Mobile Friendly: ${data.performance.mobileFriendly ? 'Yes' : 'No'}`, 20, 290);

    // Traffic
    doc.setFontSize(14);
    doc.text('Estimated Traffic Sources', 20, 300);
    doc.setFontSize(10);
    doc.text(`SEO: ${data.traffic.seo}%`, 20, 310);
    doc.text(`Social: ${data.traffic.social}%`, 20, 320);
    doc.text(`Paid: ${data.traffic.paid}%`, 20, 330);
    doc.text(`Referral: ${data.traffic.referral}%`, 20, 340);
    doc.text('Note: Estimates are heuristic-based.', 20, 350);

    doc.save('competitor_report.pdf');
  }

  // Analyze Button
  analyzeBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    errorMessage.classList.add('d-none');
    loadingSpinner.classList.add('d-none');
    previewSection.classList.add('d-none');
    feedbackSection.classList.add('d-none');

    // Validate URL
    if (!url.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/)) {
      errorMessage.textContent = 'Please enter a valid URL (e.g., https://example.com)';
      errorMessage.classList.remove('d-none');
      return;
    }

    // Show Loading Spinner
    loadingSpinner.classList.remove('d-none');

    try {
      // Fetch Website via CORS Proxy
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const startTime = performance.now();
      const response = await fetch(proxyUrl + url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch website');
      }
      const loadTime = (performance.now() - startTime) / 1000;
      const html = await response.text();

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const metaTags = {
        title: doc.querySelector('title')?.textContent || '',
        description: doc.querySelector('meta[name="description"]')?.content || '',
        keywords: doc.querySelector('meta[name="keywords"]')?.content || ''
      };
      const h1s = Array.from(doc.querySelectorAll('h1')).map(h1 => h1.textContent.trim());
      const textContent = Array.from(doc.querySelectorAll('p,h1,h2')).map(el => el.textContent.trim()).join(' ');
      const scripts = Array.from(doc.querySelectorAll('script[src]')).map(script => script.src);
      const links = Array.from(doc.querySelectorAll('a[href]')).map(a => a.href);
      const socialLinks = links.filter(link => /twitter\.com|linkedin\.com|facebook\.com|instagram\.com/.test(link)).slice(0, 5);

      // Analyze Data
      const keywords = analyzeKeywords(textContent);
      const techStack = detectTech(html, scripts);
      const traffic = estimateTraffic(metaTags, links, scripts, socialLinks);
      const performance = measurePerformance(html, loadTime);
      const backlinks = detectBacklinks(links);

      // Prepare Report Data
      const reportData = { url, metaTags, h1s, keywords, techStack, traffic, performance, backlinks, socialLinks };

      // Populate Preview
      previewContent.innerHTML = `
        <h4>SEO Summary</h4>
        <p><strong>Title:</strong> ${metaTags.title || 'N/A'}</p>
        <p><strong>Description:</strong> ${metaTags.description || 'N/A'}</p>
        <h4>Top Keywords</h4>
        <ul>${keywords.slice(0, 3).map(kw => `<li>${kw.word}: ${kw.count} (${kw.density.toFixed(2)}%)</li>`).join('')}</ul>
        <h4>Tech Stack</h4>
        <p>${techStack.join(', ') || 'None detected'}</p>
        <h4>Performance</h4>
        <p><strong>Load Time:</strong> ${performance.loadTime.toFixed(2)}s</p>
        <p><strong>Mobile Friendly:</strong> ${performance.mobileFriendly ? 'Yes' : 'No'}</p>
        <h4>Social Media</h4>
        <p>${socialLinks.join(', ') || 'None detected'}</p>
      `;
      loadingSpinner.classList.add('d-none');
      previewSection.classList.remove('d-none');
      feedbackSection.classList.remove('d-none');

      // Attach PDF Download
      downloadBtn.onclick = () => generatePDF(reportData);
    } catch (error) {
      loadingSpinner.classList.add('d-none');
      errorMessage.textContent = error.message || 'An error occurred. Please try again or use a CORS-friendly URL.';
      errorMessage.classList.remove('d-none');
    }
  });

  // Feedback Submission
  submitFeedback.addEventListener('click', () => {
    const rating = feedbackRating.value;
    const comment = feedbackComment.value;
    if (rating < 1 || rating > 5) {
      errorMessage.textContent = 'Please provide a rating between 1 and 5.';
      errorMessage.classList.remove('d-none');
      return;
    }
    const feedback = { rating, comment, timestamp: new Date().toISOString() };
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    feedbackSection.innerHTML = '<p class="text-success">Thank you for your feedback!</p>';
  });
});