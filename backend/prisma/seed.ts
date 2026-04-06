import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create demo user (clerkId will be linked when they first sign in)
  const user = await prisma.user.upsert({
    where: { email: "demo@vocalweb.ai" },
    update: {},
    create: {
      email: "demo@vocalweb.ai",
      name: "Demo User",
      plan: "PRO",
    },
  });

  console.log(`✓ Demo user created: ${user.email}`);

  // Create sample website
  const website = await prisma.website.upsert({
    where: { slug: "bloom-salon-demo" },
    update: {},
    create: {
      userId: user.id,
      businessName: "Bloom Salon",
      transcript:
        "I run a hair salon called Bloom. We have 5 experienced stylists, we do hair coloring, cuts, bridal makeup, and nail services. We're open Monday to Saturday from 9am to 8pm. We're located at 42 Main Street downtown.",
      themeColor: "#1a1a2e",
      sections: ["hero", "about", "services", "gallery", "testimonials", "contact", "footer"],
      status: "READY",
      slug: "bloom-salon-demo",
      liveUrl: "https://sites.vocalweb.ai/bloom-salon-demo",
      validationPassed: true,
      publishedAt: new Date(),
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bloom Salon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #18181b; background: white; }
    nav { background: #1a1a2e; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    nav .logo { color: white; font-size: 1.5rem; font-weight: bold; }
    nav a { color: rgba(255,255,255,0.7); text-decoration: none; margin-left: 2rem; font-size: 0.875rem; }
    .hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 6rem 2rem; text-align: center; }
    .hero h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 1rem; }
    .hero p { font-size: 1.2rem; opacity: 0.8; max-width: 500px; margin: 0 auto 2rem; }
    .btn { background: white; color: #1a1a2e; padding: 0.875rem 2rem; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
    section { padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }
    h2 { font-size: 2.2rem; font-weight: 700; margin-bottom: 1.5rem; color: #1a1a2e; }
    footer { background: #18181b; color: white; padding: 3rem 2rem; text-align: center; }
  </style>
</head>
<body>
  <nav>
    <div class="logo">Bloom Salon</div>
    <div><a href="#services">Services</a><a href="#contact">Book Now</a></div>
  </nav>
  <div class="hero">
    <h1>Bloom Salon</h1>
    <p>Premium hair, nails & bridal services by 5 expert stylists</p>
    <a href="#contact" class="btn">Book Appointment</a>
  </div>
  <section id="services">
    <h2>Our Services</h2>
    <p>Hair coloring, cuts, bridal makeup, nail care. Open Mon–Sat, 9am–8pm.</p>
  </section>
  <footer><p>© 2025 Bloom Salon · 42 Main Street · (555) 123-4567</p></footer>
</body>
</html>`,
    },
  });

  console.log(`✓ Demo website created: ${website.businessName}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
