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
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${unsubscribeToken}`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Blog Post: ${post.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            color: #e2e8f0;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .post-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        .post-title {
            font-size: 24px;
            font-weight: 700;
            color: #1a202c;
            margin: 0 0 16px 0;
            line-height: 1.3;
        }
        .post-meta {
            color: #718096;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .post-excerpt {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .tags {
            margin-bottom: 30px;
        }
        .tag {
            display: inline-block;
            background-color: #edf2f7;
            color: #4a5568;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-right: 8px;
            margin-bottom: 8px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            color: #718096;
            font-size: 14px;
            margin: 0 0 10px 0;
        }
        .unsubscribe {
            color: #a0aec0;
            text-decoration: none;
            font-size: 12px;
        }
        .unsubscribe:hover {
            color: #718096;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .post-title {
                font-size: 20px;
            }
            .cta-button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>imadlab</h1>
            <p>New Blog Post Published</p>
        </div>
        
        <div class="content">
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image">` : ''}
            
            <h2 class="post-title">${post.title}</h2>
            
            <div class="post-meta">
                Published on ${new Date(post.publishedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </div>
            
            <div class="post-excerpt">
                ${post.excerpt || 'Check out this new blog post with insights on data engineering, AI/ML, and modern web development.'}
            </div>
            
            ${post.tags && post.tags.length > 0 ? `
            <div class="tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ` : ''}
            
            <a href="${postUrl}" class="cta-button">Read Full Post</a>
        </div>
        
        <div class="footer">
            <p>Thanks for subscribing to imadlab newsletter!</p>
            <p>You're receiving this because you subscribed to updates about new blog posts and projects.</p>
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
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${unsubscribeToken}`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project: ${project.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            color: #c6f6d5;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .project-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        .project-title {
            font-size: 24px;
            font-weight: 700;
            color: #1a202c;
            margin: 0 0 20px 0;
            line-height: 1.3;
        }
        .project-description {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .tech-stack {
            margin-bottom: 30px;
        }
        .tech-stack h3 {
            color: #2d3748;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        .tech-tag {
            display: inline-block;
            background-color: #e6fffa;
            color: #234e52;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            margin-right: 8px;
            margin-bottom: 8px;
            border: 1px solid #b2f5ea;
        }
        .action-buttons {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        .cta-button {
            display: inline-block;
            color: #ffffff;
            text-decoration: none;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            text-align: center;
            transition: transform 0.2s;
            flex: 1;
            min-width: 140px;
        }
        .cta-primary {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        }
        .cta-secondary {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            color: #718096;
            font-size: 14px;
            margin: 0 0 10px 0;
        }
        .unsubscribe {
            color: #a0aec0;
            text-decoration: none;
            font-size: 12px;
        }
        .unsubscribe:hover {
            color: #718096;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .project-title {
                font-size: 20px;
            }
            .action-buttons {
                flex-direction: column;
            }
            .cta-button {
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>imadlab</h1>
            <p>New Project Showcase</p>
        </div>
        
        <div class="content">
            ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="project-image">` : ''}
            
            <h2 class="project-title">${project.title}</h2>
            
            <div class="project-description">
                ${project.description || 'Check out this new project showcasing modern development practices and innovative solutions.'}
            </div>
            
            ${project.techTags && project.techTags.length > 0 ? `
            <div class="tech-stack">
                <h3>Technologies Used</h3>
                ${project.techTags.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            ` : ''}
            
            <div class="action-buttons">
                <a href="${projectUrl}" class="cta-button cta-primary">View Project</a>
                ${project.repoUrl ? `<a href="${project.repoUrl}" class="cta-button cta-secondary">View Code</a>` : ''}
            </div>
        </div>
        
        <div class="footer">
            <p>Thanks for subscribing to imadlab newsletter!</p>
            <p>You're receiving this because you subscribed to updates about new blog posts and projects.</p>
            <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a>
        </div>
    </div>
</body>
</html>
  `.trim();
}