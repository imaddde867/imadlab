export interface BlogPostEmailData {
  subscriberEmail: string;
  unsubscribeToken: string;
  post: {
    title: string;
    excerpt: string;
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
        .project-image {
            width: 100%;
            height: 240px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 32px;
            border: 1px solid #1a1a1a;
        }
        .project-title {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 24px;
            line-height: 1.2;
            letter-spacing: -0.02em;
        }
        .project-description {
            color: #cccccc;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 32px;
        }
        .tech-stack {
            margin-bottom: 40px;
        }
        .tech-stack-title {
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .tech-tag {
            display: inline-block;
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            margin-right: 8px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 1px solid #333333;
        }
        .action-buttons {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin-top: 32px;
        }
        .cta-button {
            display: inline-block;
            text-decoration: none;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-align: center;
            transition: all 0.2s ease;
            flex: 1;
            min-width: 140px;
        }
        .cta-primary {
            background-color: #ffffff;
            color: #000000;
            border: 2px solid #ffffff;
        }
        .cta-primary:hover {
            background-color: #000000;
            color: #ffffff;
            transform: translateY(-1px);
        }
        .cta-secondary {
            background-color: transparent;
            color: #ffffff;
            border: 2px solid #333333;
        }
        .cta-secondary:hover {
            background-color: #333333;
            border-color: #666666;
            transform: translateY(-1px);
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #333333 50%, transparent 100%);
            margin: 32px 0;
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
            .project-title {
                font-size: 24px;
            }
            .action-buttons {
                flex-direction: column;
            }
            .cta-button {
                width: 100%;
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