export interface EmergencyTemplateOptions {
  businessName: string;
  themeColor: string;
  category?: string;
  services?: string[];
}

export function generateEmergencyTemplate(options: EmergencyTemplateOptions): string {
  const { businessName, themeColor, category = "Business", services = [] } = options;

  const serviceItems =
    services.length > 0
      ? services
      : ["Professional Services", "Quality Work", "Customer Support"];

  const serviceCards = serviceItems
    .slice(0, 6)
    .map(
      (s) => `
        <div class="card">
          <div class="card-icon" aria-hidden="true">◆</div>
          <h3>${escapeHtml(s)}</h3>
          <p>We deliver exceptional ${escapeHtml(s).toLowerCase()} tailored to your specific needs and goals.</p>
        </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(businessName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --brand: ${themeColor};
      --brand-light: ${themeColor}18;
      --text: #111827;
      --muted: #6b7280;
      --border: #e5e7eb;
      --bg-alt: #fafafa;
      --radius: 12px;
      --max-w: 1100px;
    }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      color: var(--text);
      line-height: 1.7;
      background: #fff;
    }

    /* NAV */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #fff;
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
    }
    .nav-inner {
      max-width: var(--max-w);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .nav-logo {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 32px;
      list-style: none;
    }
    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--brand); }

    /* SECTIONS */
    section { padding: 80px 24px; }
    .container { max-width: var(--max-w); margin: 0 auto; }
    .alt-bg { background: var(--bg-alt); }

    /* HERO */
    .hero {
      background: linear-gradient(135deg, #fff 0%, var(--brand-light) 100%);
      padding: 100px 24px 80px;
      text-align: center;
    }
    .hero-badge {
      display: inline-block;
      background: var(--brand-light);
      color: var(--brand);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 24px;
    }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 20px;
      max-width: 700px;
      margin-inline: auto;
    }
    .hero p {
      font-size: 1.125rem;
      color: var(--muted);
      max-width: 540px;
      margin: 0 auto 36px;
    }
    .btn {
      display: inline-block;
      background: var(--brand);
      color: #fff;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: opacity 0.2s, transform 0.2s;
    }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-outline {
      background: transparent;
      color: var(--brand);
      border: 2px solid var(--brand);
      margin-left: 12px;
    }
    .btn-outline:hover { background: var(--brand-light); }

    /* ABOUT */
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }
    .about-image {
      aspect-ratio: 4/3;
      background: linear-gradient(135deg, var(--brand-light) 0%, var(--brand)30 100%);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      color: var(--brand);
    }
    .about-text .label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--brand);
      margin-bottom: 12px;
    }
    .about-text h2 { font-size: 2rem; font-weight: 700; margin-bottom: 16px; line-height: 1.3; }
    .about-text p { color: var(--muted); margin-bottom: 12px; }

    /* SERVICES */
    .section-header { text-align: center; margin-bottom: 56px; }
    .section-header .label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--brand);
      margin-bottom: 12px;
    }
    .section-header h2 { font-size: 2rem; font-weight: 700; }
    .section-header p { color: var(--muted); margin-top: 12px; max-width: 500px; margin-inline: auto; }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .card-icon {
      font-size: 1.5rem;
      color: var(--brand);
      margin-bottom: 16px;
    }
    .card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
    .card p { color: var(--muted); font-size: 0.9rem; }

    /* TESTIMONIALS */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .testimonial {
      background: #fff;
      border-radius: var(--radius);
      padding: 32px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .stars { color: #f59e0b; font-size: 1rem; margin-bottom: 16px; letter-spacing: 2px; }
    .testimonial blockquote { font-style: italic; color: var(--muted); margin-bottom: 20px; line-height: 1.7; }
    .reviewer { display: flex; align-items: center; gap: 12px; }
    .reviewer-avatar {
      width: 40px; height: 40px;
      background: var(--brand-light);
      color: var(--brand);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .reviewer-name { font-weight: 600; font-size: 0.9rem; }
    .reviewer-title { color: var(--muted); font-size: 0.8rem; }

    /* CONTACT */
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: start;
    }
    .contact-info h2 { font-size: 2rem; font-weight: 700; margin-bottom: 16px; }
    .contact-info p { color: var(--muted); margin-bottom: 32px; }
    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }
    .contact-item-icon {
      width: 40px; height: 40px;
      background: var(--brand-light);
      color: var(--brand);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      font-size: 1.1rem;
    }
    .contact-item-text strong { display: block; font-weight: 600; margin-bottom: 2px; }
    .contact-item-text span { color: var(--muted); font-size: 0.9rem; }
    .contact-form { background: var(--bg-alt); border-radius: var(--radius); padding: 36px; }
    .form-row { margin-bottom: 20px; }
    .form-row label { display: block; font-weight: 500; font-size: 0.9rem; margin-bottom: 6px; }
    .form-row input, .form-row textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.9rem;
      background: #fff;
      transition: border-color 0.2s;
    }
    .form-row input:focus, .form-row textarea:focus {
      outline: none;
      border-color: var(--brand);
    }
    .form-row textarea { resize: vertical; min-height: 100px; }

    /* FOOTER */
    footer {
      background: var(--text);
      color: #9ca3af;
      padding: 48px 24px;
      text-align: center;
    }
    footer .footer-brand {
      font-size: 1.125rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    footer p { font-size: 0.875rem; }
    footer .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin: 16px 0;
      list-style: none;
    }
    footer .footer-links a { color: #9ca3af; text-decoration: none; font-size: 0.875rem; }
    footer .footer-links a:hover { color: #fff; }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .about-grid, .contact-grid { grid-template-columns: 1fr; gap: 40px; }
      section { padding: 60px 16px; }
      .hero { padding: 80px 16px 60px; }
      .btn-outline { display: none; }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-inner">
    <a href="#" class="nav-logo">${escapeHtml(businessName)}</a>
    <ul class="nav-links">
      <li><a href="#about">About</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#testimonials">Testimonials</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </div>
</nav>

<header class="hero">
  <div class="hero-badge">${escapeHtml(category)}</div>
  <h1>Welcome to ${escapeHtml(businessName)}</h1>
  <p>We provide exceptional services with a commitment to quality, professionalism, and customer satisfaction.</p>
  <a href="#contact" class="btn">Get in Touch</a>
  <a href="#services" class="btn btn-outline">Our Services</a>
</header>

<section id="about">
  <div class="container">
    <div class="about-grid">
      <div class="about-image" aria-hidden="true">◆</div>
      <div class="about-text">
        <span class="label">About Us</span>
        <h2>Built on Trust, Driven by Excellence</h2>
        <p>${escapeHtml(businessName)} is dedicated to providing outstanding services to our community. Our team brings expertise, passion, and a deep commitment to every client we serve.</p>
        <p>We believe in building lasting relationships through transparency, quality work, and genuine care for our clients' success.</p>
        <a href="#contact" class="btn" style="margin-top:8px">Work With Us</a>
      </div>
    </div>
  </div>
</section>

<section id="services" class="alt-bg">
  <div class="container">
    <div class="section-header">
      <span class="label">What We Offer</span>
      <h2>Our Services</h2>
      <p>Comprehensive solutions designed to meet your needs and exceed your expectations.</p>
    </div>
    <div class="cards">
      ${serviceCards}
    </div>
  </div>
</section>

<section id="testimonials">
  <div class="container">
    <div class="section-header">
      <span class="label">Client Stories</span>
      <h2>What Our Clients Say</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial">
        <div class="stars">★★★★★</div>
        <blockquote>"Working with ${escapeHtml(businessName)} was an exceptional experience. They delivered exactly what we needed, on time and with great attention to detail."</blockquote>
        <div class="reviewer">
          <div class="reviewer-avatar">SR</div>
          <div><div class="reviewer-name">Sarah R.</div><div class="reviewer-title">Local Business Owner</div></div>
        </div>
      </div>
      <div class="testimonial">
        <div class="stars">★★★★★</div>
        <blockquote>"I've worked with many providers, but ${escapeHtml(businessName)} stands out for their professionalism and the quality of their work. Highly recommend!"</blockquote>
        <div class="reviewer">
          <div class="reviewer-avatar">MK</div>
          <div><div class="reviewer-name">Michael K.</div><div class="reviewer-title">Satisfied Customer</div></div>
        </div>
      </div>
      <div class="testimonial">
        <div class="stars">★★★★★</div>
        <blockquote>"From start to finish, the team at ${escapeHtml(businessName)} was responsive, skilled, and a pleasure to work with. The results speak for themselves."</blockquote>
        <div class="reviewer">
          <div class="reviewer-avatar">JP</div>
          <div><div class="reviewer-name">Jennifer P.</div><div class="reviewer-title">Returning Client</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="contact" class="alt-bg">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info">
        <h2>Get in Touch</h2>
        <p>Ready to work together? We'd love to hear from you. Reach out and we'll respond promptly.</p>
        <div class="contact-item">
          <div class="contact-item-icon" aria-hidden="true">✉</div>
          <div class="contact-item-text">
            <strong>Email</strong>
            <span>hello@${escapeHtml(businessName.toLowerCase().replace(/\s+/g, ""))}.com</span>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-item-icon" aria-hidden="true">☎</div>
          <div class="contact-item-text">
            <strong>Phone</strong>
            <span>Available during business hours</span>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-item-icon" aria-hidden="true">◷</div>
          <div class="contact-item-text">
            <strong>Hours</strong>
            <span>Mon – Fri, 9am – 6pm</span>
          </div>
        </div>
      </div>
      <div class="contact-form">
        <form>
          <div class="form-row">
            <label for="name">Your Name</label>
            <input type="text" id="name" name="name" placeholder="John Smith">
          </div>
          <div class="form-row">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="john@example.com">
          </div>
          <div class="form-row">
            <label for="message">Message</label>
            <textarea id="message" name="message" placeholder="Tell us about your project..."></textarea>
          </div>
          <a href="mailto:hello@${escapeHtml(businessName.toLowerCase().replace(/\s+/g, ""))}.com" class="btn" style="width:100%;text-align:center;display:block">Send Message</a>
        </form>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="footer-brand">${escapeHtml(businessName)}</div>
  <ul class="footer-links">
    <li><a href="#about">About</a></li>
    <li><a href="#services">Services</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <p>© ${new Date().getFullYear()} ${escapeHtml(businessName)}. All rights reserved.</p>
</footer>

</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
