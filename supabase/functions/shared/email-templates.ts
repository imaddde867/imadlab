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
    readingTime?: number; // in minutes
  };
  siteUrl: string;
  subscriberName?: string;
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
    liveUrl?: string;
    id: string;
  };
  siteUrl: string;
  subscriberName?: string;
}

export function generateBlogPostEmail(data: BlogPostEmailData): string {
  const { post, siteUrl, unsubscribeToken, subscriberName } = data;
  const postUrl = `${siteUrl}/blogs/${post.slug}`;
  const unsubscribeUrl = `${siteUrl}/functions/v1/handle-unsubscribe?token=${unsubscribeToken}`;
  
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>New Blog Post: ${post.title}</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse:collapse;border-spacing:0;margin:0;}
        div, td {padding:0;}
        div {margin:0 !important;}
    </style>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        :root {
            color-scheme: dark;
            supported-color-schemes: dark;
        }
        
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
            padding: 0;
            width: 100%;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-wrapper {
            background-color: #000000;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, #0a0a0a 0%, #000000 100%);
            border: 1px solid #1a1a1a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #0a0a0a 100%);
            padding: 48px 40px;
            text-align: center;
            border-bottom: 1px solid #222222;
            position: relative;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #666666 50%, transparent 100%);
        }
        
        .logo {
            font-size: 36px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 12px;
            letter-spacing: -0.03em;
            text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
        }
        
        .header-subtitle {
            color: #999999;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.15em;
        }
        
        .greeting {
            padding: 32px 40px 0;
            color: #cccccc;
            font-size: 15px;
        }
        
        .content {
            padding: 32px 40px 48px;
        }
        
        .post-image-wrapper {
            position: relative;
            width: 100%;
            margin-bottom: 32px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #222222;
        }
        
        .post-image {
            width: 100%;
            height: 280px;
            object-fit: cover;
            display: block;
        }
        
        .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
        }
        
        .post-title {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 20px;
            line-height: 1.2;
            letter-spacing: -0.02em;
        }
        
        .post-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 28px;
            flex-wrap: wrap;
        }
        
        .meta-item {
            color: #888888;
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .meta-divider {
            width: 4px;
            height: 4px;
            background-color: #444444;
            border-radius: 50%;
        }
        
        .post-excerpt {
            color: #d4d4d4;
            font-size: 17px;
            line-height: 1.7;
            margin-bottom: 32px;
        }
        
        .tags {
            margin-bottom: 40px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .tag {
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border: 1px solid #333333;
            display: inline-block;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #333333 30%, #333333 70%, transparent 100%);
            margin: 32px 0;
        }
        
        .cta-wrapper {
            text-align: center;
            margin: 36px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%);
            color: #000000 !important;
            text-decoration: none;
            padding: 18px 42px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            background: linear-gradient(135deg, #e5e5e5 0%, #cccccc 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(255, 255, 255, 0.2);
        }
        
        .footer {
            background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%);
            padding: 40px;
            text-align: center;
            border-top: 1px solid #1a1a1a;
        }
        
        .footer-text {
            color: #888888;
            font-size: 13px;
            line-height: 1.7;
            margin-bottom: 24px;
        }
        
        .footer-links {
            margin-bottom: 24px;
        }
        
        .footer-link {
            color: #999999;
            text-decoration: none;
            font-size: 12px;
            margin: 0 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .footer-link:hover {
            color: #ffffff;
        }
        
        .unsubscribe {
            color: #666666;
            text-decoration: none;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 500;
        }
        
        .unsubscribe:hover {
            color: #ffffff;
        }
        
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            
            .email-container {
                border-radius: 12px;
            }
            
            .header, .content, .footer {
                padding: 32px 24px !important;
            }
            
            .greeting {
                padding: 24px 24px 0 !important;
            }
            
            .logo {
                font-size: 28px;
            }
            
            .post-title {
                font-size: 26px;
            }
            
            .post-image {
                height: 220px;
            }
            
            .post-excerpt {
                font-size: 16px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
                padding: 16px 32px;
            }
            
            .post-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .meta-divider {
                display: none;
            }
            
            .footer-link {
                display: block;
                margin: 8px 0;
            }
        }
        
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #000000 !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <div class="logo">imadlab</div>
                <div class="header-subtitle">New Blog Post</div>
            </div>
            
            ${subscriberName ? `<div class="greeting">Hey ${subscriberName} 👋</div>` : ''}
            
            <div class="content">
                ${post.imageUrl ? `
                <div class="post-image-wrapper">
                    <img src="${post.imageUrl}" alt="${post.title}" class="post-image">
                    <div class="image-overlay"></div>
                </div>
                ` : ''}
                
                <h1 class="post-title">${post.title}</h1>
                
                <div class="post-meta">
                    <span class="meta-item">
                        ${new Date(post.publishedDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        })}
                    </span>
                    ${post.readingTime ? `
                    <span class="meta-divider"></span>
                    <span class="meta-item">${post.readingTime} min read</span>
                    ` : ''}
                </div>
                
                <div class="post-excerpt">
                    ${post.excerpt || 'Dive into the latest insights on data engineering, AI/ML, and cutting-edge web development techniques. Explore new ideas and practical approaches to modern software development.'}
                </div>
                
                ${post.tags && post.tags.length > 0 ? `
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                ` : ''}
                
                <div class="divider"></div>
                
                <div class="cta-wrapper">
                    <a href="${postUrl}" class="cta-button">Read Full Article</a>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    You're receiving this because you subscribed to imadlab updates.<br>
                    Stay ahead with the latest in tech, data engineering, and development.
                </div>
                
                <div class="footer-links">
                    <a href="${siteUrl}" class="footer-link">Visit imadlab</a>
                    <a href="${siteUrl}/blogs" class="footer-link">All Posts</a>
                    <a href="${siteUrl}/about" class="footer-link">About</a>
                </div>
                
                <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}

export function generateProjectEmail(data: ProjectEmailData): string {
  const { project, siteUrl, unsubscribeToken, subscriberName } = data;
  const projectUrl = `${siteUrl}/projects/${project.id}`;
  const unsubscribeUrl = `${siteUrl}/functions/v1/handle-unsubscribe?token=${unsubscribeToken}`;
  
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>New Project: ${project.title}</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse:collapse;border-spacing:0;margin:0;}
        div, td {padding:0;}
        div {margin:0 !important;}
    </style>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #0f172a;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            width: 100%;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-wrapper {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }
        
        .preheader {
            display: none;
            font-size: 1px;
            color: #f8fafc;
            line-height: 1px;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 40px 40px 24px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
            position: relative;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 40px;
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, #0f172a 0%, transparent 100%);
        }
        
        .logo {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        
        .header-subtitle {
            color: #64748b;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
        }
        
        .greeting {
            padding: 32px 40px 0;
            color: #475569;
            font-size: 15px;
            font-weight: 500;
        }
        
        .content {
            padding: 32px 40px 48px;
        }
        
        .project-image-wrapper {
            position: relative;
            width: 100%;
            margin-bottom: 32px;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
        }
        
        .project-image {
            width: 100%;
            height: 280px;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
        }
        
        .project-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            color: #0f172a;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .project-title {
            font-size: 32px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 20px;
            line-height: 1.25;
            letter-spacing: -0.02em;
        }
        
        .project-description {
            color: #475569;
            font-size: 16px;
            line-height: 1.75;
            margin-bottom: 32px;
        }
        
        .tech-stack {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 32px;
            border: 1px solid #e2e8f0;
        }
        
        .tech-stack-title {
            color: #64748b;
            font-size: 11px;
            font-weight: 800;
            margin-bottom: 14px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
        }
        
        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .tech-tag {
            background-color: #ffffff;
            color: #0f172a;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #cbd5e1 30%, #cbd5e1 70%, transparent 100%);
            margin: 32px 0;
        }
        
        .action-buttons {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .cta-button {
            flex: 1;
            min-width: 180px;
            text-decoration: none;
            padding: 16px 28px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.03em;
            text-align: center;
            transition: all 0.3s ease;
            display: inline-block;
        }
        
        .cta-primary {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff !important;
            border: 2px solid #0f172a;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.2);
        }
        
        .cta-primary:hover {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(15, 23, 42, 0.3);
        }
        
        .cta-secondary {
            background-color: #ffffff;
            color: #0f172a !important;
            border: 2px solid #cbd5e1;
        }
        
        .cta-secondary:hover {
            background-color: #f8fafc;
            border-color: #0f172a;
            transform: translateY(-2px);
        }
        
        .footer {
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 40px;
            text-align: center;
            border-top: 2px solid #e2e8f0;
        }
        
        .footer-text {
            color: #64748b;
            font-size: 13px;
            line-height: 1.7;
            margin-bottom: 24px;
        }
        
        .footer-links {
            margin-bottom: 24px;
        }
        
        .footer-link {
            color: #475569;
            text-decoration: none;
            font-size: 12px;
            margin: 0 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .footer-link:hover {
            color: #0f172a;
        }
        
        .unsubscribe {
            color: #94a3b8;
            text-decoration: none;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 600;
        }
        
        .unsubscribe:hover {
            color: #0f172a;
        }
        
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            
            .email-container {
                border-radius: 16px;
            }
            
            .header, .content, .footer {
                padding: 32px 24px !important;
            }
            
            .greeting {
                padding: 24px 24px 0 !important;
            }
            
            .header::after {
                left: 24px;
            }
            
            .logo {
                font-size: 16px;
            }
            
            .project-title {
                font-size: 26px;
            }
            
            .project-image {
                height: 220px;
            }
            
            .action-buttons {
                flex-direction: column;
            }
            
            .cta-button {
                min-width: 100%;
                width: 100%;
            }
            
            .footer-link {
                display: block;
                margin: 8px 0;
            }
        }
    </style>
</head>
<body>
    <div class="preheader">New project: ${project.title} is live on imadlab.</div>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <div class="logo">imadlab</div>
                <div class="header-subtitle">New Project Launch</div>
            </div>
            
            ${subscriberName ? `<div class="greeting">Hey ${subscriberName} 👋</div>` : ''}
            
            <div class="content">
                ${project.imageUrl ? `
                <div class="project-image-wrapper">
                    <img src="${project.imageUrl}" alt="${project.title}" class="project-image">
                    <div class="project-badge">Just Launched</div>
                </div>
                ` : ''}
                
                <h1 class="project-title">${project.title}</h1>
                
                <div class="project-description">
                    ${project.description || 'Explore this new project showcasing innovative solutions, modern development practices, and cutting-edge technology implementations.'}
                </div>
                
                ${project.techTags && project.techTags.length > 0 ? `
                <div class="tech-stack">
                    <div class="tech-stack-title">Tech Stack</div>
                    <div class="tech-tags">
                        ${project.techTags.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="divider"></div>
                
                <div class="action-buttons">
                    <a href="${projectUrl}" class="cta-button cta-primary">View Project Details</a>
                    ${project.repoUrl ? `<a href="${project.repoUrl}" class="cta-button cta-secondary">View Source Code</a>` : ''}
                    ${project.liveUrl ? `<a href="${project.liveUrl}" class="cta-button cta-secondary">Live Demo</a>` : ''}
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    You're receiving this because you subscribed to imadlab updates.<br>
                    Discover cutting-edge projects and technical innovations.
                </div>
                
                <div class="footer-links">
                    <a href="${siteUrl}" class="footer-link">Visit imadlab</a>
                    <a href="${siteUrl}/projects" class="footer-link">All Projects</a>
                    <a href="${siteUrl}/about" class="footer-link">About</a>
                </div>
                
                <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}