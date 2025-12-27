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

export function generateBlogPostEmail(data: BlogPostEmailData): string {
  const { post, siteUrl, unsubscribeToken } = data;
  const postUrl = `${siteUrl}/blogs/${post.slug}`;
  const unsubscribeUrl = `${siteUrl}/functions/v1/handle-unsubscribe?token=${unsubscribeToken}`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Blog Post: ${post.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            background-color: #000000;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #000000;
            border: 1px solid #1a1a1a;
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            padding: 48px 32px;
            text-align: center;
            border-bottom: 1px solid #1a1a1a;
        }
        .logo {
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        .header-subtitle {
            color: #888888;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .content {
            padding: 48px 32px;
        }
        .post-image {
            width: 100%;
            height: 240px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 32px;
            border: 1px solid #1a1a1a;
        }
        .post-title {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 16px;
            line-height: 1.2;
            letter-spacing: -0.02em;
        }
        .post-meta {
            color: #666666;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 24px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .post-excerpt {
            color: #cccccc;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 32px;
        }
        .tags {
            margin-bottom: 40px;
        }
        .tag {
            display: inline-block;
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            margin-right: 8px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 1px solid #333333;
        }
        .cta-button {
            display: inline-block;
            background-color: #ffffff;
            color: #000000;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.2s ease;
            border: 2px solid #ffffff;
        }
        .cta-button:hover {
            background-color: #000000;
            color: #ffffff;
            transform: translateY(-1px);
        }
        .footer {
            background-color: #0a0a0a;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #1a1a1a;
        }
        .footer-text {
            color: #666666;
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .unsubscribe {
            color: #888888;
            text-decoration: none;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 500;
        }
        .unsubscribe:hover {
            color: #ffffff;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #333333 50%, transparent 100%);
            margin: 24px 0;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-container {
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 24px 20px;
            }
            .post-title {
                font-size: 24px;
            }
            .cta-button {
                display: block;
                width: 100%;
                text-align: center;
            }
        }
        @media (prefers-color-scheme: light) {
            body {
                background-color: #000000;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">imadlab</div>
            <div class="header-subtitle">New Blog Post</div>
        </div>
        
        <div class="content">
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image">` : ''}
            
            <h1 class="post-title">${post.title}</h1>
            
            <div class="post-meta">
                ${new Date(post.publishedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </div>
            
            <div class="post-excerpt">
                ${post.excerpt || 'Dive into the latest insights on data engineering, AI/ML, and cutting-edge web development techniques.'}
            </div>
            
            ${post.tags && post.tags.length > 0 ? `
            <div class="tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <a href="${postUrl}" class="cta-button">Read Article</a>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                You're receiving this because you subscribed to imadlab updates.<br>
                Stay ahead with the latest in tech and development.
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
  const projectUrl = `${siteUrl}/projects/${project.id}`;
  const unsubscribeUrl = `${siteUrl}/functions/v1/handle-unsubscribe?token=${unsubscribeToken}`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project: ${project.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #0f172a;
            background-color: #f6f7f9;
            margin: 0;
            padding: 24px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
        }
        .preheader {
            display: none;
            font-size: 1px;
            color: #f6f7f9;
            line-height: 1px;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
        }
        .header {
            padding: 28px 32px 16px;
            text-align: left;
            border-bottom: 1px solid #eef2f6;
        }
        .logo {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            letter-spacing: 0.2em;
            text-transform: uppercase;
        }
        .header-subtitle {
            color: #6b7280;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-top: 8px;
        }
        .content {
            padding: 28px 32px 32px;
        }
        .project-image {
            width: 100%;
            height: 240px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
            display: block;
        }
        .project-title {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 10px;
            line-height: 1.3;
            letter-spacing: -0.01em;
        }
        .project-description {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 20px;
        }
        .tech-stack {
            margin-bottom: 24px;
        }
        .tech-stack-title {
            color: #6b7280;
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
        }
        .tech-tag {
            display: inline-block;
            background-color: #f3f4f6;
            color: #111827;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 8px;
            margin-bottom: 8px;
            border: 1px solid #e5e7eb;
        }
        .divider {
            height: 1px;
            background-color: #eef2f6;
            margin: 20px 0;
        }
        .action-buttons {
            margin-top: 12px;
        }
        .cta-button {
            display: inline-block;
            text-decoration: none;
            padding: 12px 18px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 13px;
            letter-spacing: 0.02em;
            text-align: center;
            margin-right: 12px;
            margin-bottom: 12px;
        }
        .cta-primary {
            background-color: #111827;
            color: #ffffff;
            border: 1px solid #111827;
        }
        .cta-secondary {
            background-color: #ffffff;
            color: #111827;
            border: 1px solid #d1d5db;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 32px;
            text-align: center;
            border-top: 1px solid #eef2f6;
        }
        .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.6;
            margin-bottom: 10px;
        }
        .unsubscribe {
            color: #9ca3af;
            text-decoration: none;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            font-weight: 600;
        }
        .unsubscribe:hover {
            color: #111827;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-container {
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .project-title {
                font-size: 22px;
            }
            .project-image {
                height: 200px;
            }
            .cta-button {
                display: block;
                width: 100%;
                margin-right: 0;
            }
        }
    </style>
</head>
<body>
    <div class="preheader">New project: ${project.title} is live on imadlab.</div>
    <div class="email-container">
        <div class="header">
            <div class="logo">imadlab</div>
            <div class="header-subtitle">New Project</div>
        </div>
        
        <div class="content">
            ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="project-image">` : ''}
            
            <h1 class="project-title">${project.title}</h1>
            
            <div class="project-description">
                ${project.description || 'Explore this new project showcasing innovative solutions and modern development practices.'}
            </div>
            
            ${project.techTags && project.techTags.length > 0 ? `
            <div class="tech-stack">
                <div class="tech-stack-title">Tech Stack</div>
                ${project.techTags.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="action-buttons">
                <a href="${projectUrl}" class="cta-button cta-primary">View Project</a>
                ${project.repoUrl ? `<a href="${project.repoUrl}" class="cta-button cta-secondary">View Code</a>` : ''}
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                You're receiving this because you subscribed to imadlab updates.<br>
                Discover cutting-edge projects and technical innovations.
            </div>
            <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a>
        </div>
    </div>
</body>
</html>
  `.trim();
}
