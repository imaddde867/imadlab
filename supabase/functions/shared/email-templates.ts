// Shared styles and constants to keep the design consistent
const THEME = {
  colors: {
    background: '#000000',
    card: '#0b0b0b',
    text: '#ffffff',
    muted: '#b7b7b7',
    border: '#1b1b1b',
    accent: '#ffffff',
    accentSoft: 'rgba(255, 255, 255, 0.1)',
    button: '#ffffff',
    buttonText: '#000000',
  },
  socials: {
    github: 'https://github.com/yourusername',
    discord: 'https://discord.com/users/766969796579295232',
    linkedin: 'https://linkedin.com/in/yourusername'
  }
};

// Helper to add UTM tags for analytics
const withUTM = (url: string, campaign: string) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}`;
};

// ---------------------------------------------
// INTERFACES
// ---------------------------------------------

export interface BlogPostEmailData {
  subscriberEmail: string;
  unsubscribeToken: string;
  post: {
    title: string;
    excerpt?: string;
    slug: string;
    publishedDate: string;
    tags: string[];
    imageUrl?: string;
  };
  siteUrl: string;
}

export interface ProjectEmailData {
  subscriberEmail: string;
  unsubscribeToken: string;
  project: {
    title: string;
    description: string;
    techTags: string[];
    imageUrl?: string;
    repoUrl?: string;
    id: string;
  };
  siteUrl: string;
}

// ---------------------------------------------
// SHARED CSS (Injected into head)
// ---------------------------------------------
const getSharedCSS = () => `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    background-color: ${THEME.colors.background};
    color: ${THEME.colors.text};
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust: none;
    width: 100% !important;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    letter-spacing: -0.01em;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: ${THEME.colors.background};
  }
  .card {
    background-color: ${THEME.colors.card};
    border: 1px solid ${THEME.colors.border};
    border-radius: 12px;
    overflow: hidden;
    margin: 20px auto;
    box-shadow: none;
  }
  .header {
    padding: 30px 30px 20px;
    text-align: center;
    border-bottom: 1px solid ${THEME.colors.border};
    background: ${THEME.colors.card};
  }
  .logo {
    font-size: 24px;
    font-weight: 700;
    color: ${THEME.colors.text};
    letter-spacing: -0.03em;
    text-decoration: none;
  }
  .badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: ${THEME.colors.muted};
    background: transparent;
    padding: 0;
    border-radius: 0;
    margin-top: 12px;
  }
  .content {
    padding: 30px;
  }
  .hero-image {
    width: 100%;
    height: auto;
    max-height: 300px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 24px;
    border: 1px solid ${THEME.colors.border};
    display: block;
  }
  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 16px;
    line-height: 1.3;
    color: ${THEME.colors.text};
    letter-spacing: -0.02em;
  }
  p {
    font-size: 16px;
    line-height: 1.6;
    color: ${THEME.colors.muted};
    margin: 0 0 24px;
  }
  .meta {
    font-size: 13px;
    color: ${THEME.colors.muted};
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .tag {
    display: inline-block;
    background-color: transparent;
    border: 1px solid ${THEME.colors.border};
    color: ${THEME.colors.text};
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 100px;
    margin-right: 6px;
    margin-bottom: 6px;
  }
  .btn {
    display: inline-block;
    background-color: ${THEME.colors.button};
    color: ${THEME.colors.buttonText};
    padding: 14px 28px;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    text-align: center;
    font-size: 14px;
    transition: all 0.2s;
    box-shadow: none;
    border: 1px solid ${THEME.colors.button};
  }
  .btn:hover {
    opacity: 0.9;
  }
  .btn-outline {
    background-color: transparent;
    color: ${THEME.colors.text};
    border: 1px solid ${THEME.colors.border};
    margin-left: 10px;
  }
  .footer {
    padding: 20px;
    text-align: center;
  }
  .footer-text {
    font-size: 12px;
    color: ${THEME.colors.muted};
    margin-bottom: 12px;
  }
  .social-links {
    margin-bottom: 20px;
  }
  .social-link {
    color: ${THEME.colors.muted};
    text-decoration: none;
    margin: 0 8px;
    font-size: 12px;
  }
  .unsubscribe {
    color: ${THEME.colors.muted};
    font-size: 11px;
    text-decoration: underline;
  }
  /* Utilities */
  .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }
  
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .card { margin: 0 !important; border-radius: 0 !important; border: none !important; border-bottom: 1px solid ${THEME.colors.border} !important; }
    .btn { display: block; width: 100%; margin-bottom: 10px; margin-left: 0; }
  }
`;

// ---------------------------------------------
// TEMPLATE GENERATORS
// ---------------------------------------------

export function generateBlogPostEmail(data: BlogPostEmailData): string {
  const { post, siteUrl, unsubscribeToken } = data;
  const postUrl = withUTM(`${siteUrl}/blogs/${post.slug}`, 'blog_post');
  const unsubscribeUrl = `${siteUrl}/functions/v1/handle-unsubscribe?token=${unsubscribeToken}`;
  
  // Create a nice preview text if excerpt is missing
  const previewText = post.excerpt || `Read the latest article: ${post.title}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title}</title>
    <style>${getSharedCSS()}</style>
</head>
<body>
    <span class="preheader">${previewText}</span>
    <div class="container">
        <div class="card">
            <div class="header">
                <a href="${siteUrl}" class="logo">imadlab<span style="color:${THEME.colors.muted}">.me</span></a>
                <div><span class="badge">New Article</span></div>
            </div>
            
            <div class="content">
                ${post.imageUrl ? `
                <a href="${postUrl}">
                    <img src="${post.imageUrl}" alt="${post.title}" class="hero-image">
                </a>` : ''}
                
                <div class="meta">
                    <span>${new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h1>${post.title}</h1>
                
                <p>${post.excerpt || 'Check out my latest insights on software engineering and development.'}</p>
                
                ${post.tags && post.tags.length > 0 ? `
                <div style="margin-bottom: 24px;">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                ` : ''}
                
                <div style="margin-top: 32px;">
                    <a href="${postUrl}" class="btn">Read Article</a>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="social-links">
                <a href="${THEME.socials.github}" class="social-link">GitHub</a> • 
                <a href="${THEME.socials.discord}" class="social-link">Discord</a> • 
                <a href="${THEME.socials.linkedin}" class="social-link">LinkedIn</a>
            </div>
            <div class="footer-text">
                Crafted with care at imadlab.me
            </div>
            <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a>
        </div>
    </div>
</body>
</html>
  `.trim();
}

export function generateProjectEmail(data: ProjectEmailData): string {
  const { project, siteUrl, unsubscribeToken } = data;
  const projectUrl = withUTM(`${siteUrl}/projects/${project.id}`, 'new_project');
  const repoUrl = project.repoUrl ? withUTM(project.repoUrl, 'new_project_repo') : null;
  const unsubscribeUrl = `${siteUrl}/functions/v1/handle-unsubscribe?token=${unsubscribeToken}`;
  
  const previewText = project.description || `Check out my new project: ${project.title}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project: ${project.title}</title>
    <style>${getSharedCSS()}</style>
</head>
<body>
    <span class="preheader">${previewText}</span>
    <div class="container">
        <div class="card">
            <div class="header">
                <a href="${siteUrl}" class="logo">imadlab<span style="color:${THEME.colors.muted}">.me</span></a>
                <div><span class="badge">Project Launch</span></div>
            </div>
            
            <div class="content">
                ${project.imageUrl ? `
                <a href="${projectUrl}">
                    <img src="${project.imageUrl}" alt="${project.title}" class="hero-image">
                </a>` : ''}
                
                <h1>${project.title}</h1>
                
                <p>${project.description || 'I just shipped a new project. Click below to see the tech stack and details.'}</p>
                
                ${project.techTags && project.techTags.length > 0 ? `
                <div style="margin-bottom: 24px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: ${THEME.colors.muted}; margin-bottom: 8px; font-weight: 700;">Built With</div>
                    ${project.techTags.map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
                ` : ''}
                
                <div style="margin-top: 32px;">
                    <a href="${projectUrl}" class="btn">View Project</a>
                    ${repoUrl ? `<a href="${repoUrl}" class="btn btn-outline">Source Code</a>` : ''}
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="social-links">
                <a href="${THEME.socials.github}" class="social-link">GitHub</a> • 
                <a href="${THEME.socials.discord}" class="social-link">Discord</a> • 
                <a href="${THEME.socials.linkedin}" class="social-link">LinkedIn</a>
            </div>
            <div class="footer-text">
                Building cool things at imadlab.me
            </div>
            <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a>
        </div>
    </div>
</body>
</html>
  `.trim();
}
