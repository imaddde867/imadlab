import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { generateBlogPostEmail, generateProjectEmail } from '../shared/email-templates.ts';

// Mock data for testing
const mockBlogPostData = {
  subscriberEmail: 'imadeddine200507@gmail.com',
  unsubscribeToken: 'test-token-123',
  post: {
    title: 'Test Blog Post',
    excerpt: 'This is a test blog post excerpt',
    slug: 'test-blog-post',
    publishedDate: '2024-01-15T10:00:00Z',
    tags: ['JavaScript', 'Testing'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png'
  },
  siteUrl: 'https://imadlab.com'
};

const mockProjectData = {
  subscriberEmail: 'imadeddine200507@gmail.com',
  unsubscribeToken: 'test-token-123',
  project: {
    title: 'Test Project',
    description: 'This is a test project description',
    techTags: ['React', 'TypeScript', 'Supabase'],
    imageUrl: 'https://example.com/project.jpg',
    repoUrl: 'https://github.com/test/project',
    id: 'project-123'
  },
  siteUrl: 'https://imadlab.com'
};

Deno.test("Blog post email template generation", () => {
  const emailHtml = generateBlogPostEmail(mockBlogPostData);
  
  // Test that email contains required elements
  assertExists(emailHtml);
  assertEquals(typeof emailHtml, 'string');
  
  // Test that email contains post title
  assertEquals(emailHtml.includes(mockBlogPostData.post.title), true);
  
  // Test that email contains post excerpt
  assertEquals(emailHtml.includes(mockBlogPostData.post.excerpt), true);
  
  // Test that email contains unsubscribe link
  assertEquals(emailHtml.includes(`token=${mockBlogPostData.unsubscribeToken}`), true);
  
  // Test that email contains post URL
  assertEquals(emailHtml.includes(`/blogs/${mockBlogPostData.post.slug}`), true);
  
  // Test that email contains tags
  mockBlogPostData.post.tags.forEach(tag => {
    assertEquals(emailHtml.includes(tag), true);
  });
  
  // Test that email contains image
  assertEquals(emailHtml.includes(mockBlogPostData.post.imageUrl!), true);
});

Deno.test("Project email template generation", () => {
  const emailHtml = generateProjectEmail(mockProjectData);
  
  // Test that email contains required elements
  assertExists(emailHtml);
  assertEquals(typeof emailHtml, 'string');
  
  // Test that email contains project title
  assertEquals(emailHtml.includes(mockProjectData.project.title), true);
  
  // Test that email contains project description
  assertEquals(emailHtml.includes(mockProjectData.project.description), true);
  
  // Test that email contains unsubscribe link
  assertEquals(emailHtml.includes(`token=${mockProjectData.unsubscribeToken}`), true);
  
  // Test that email contains project URL
  assertEquals(emailHtml.includes(`/projects/${mockProjectData.project.id}`), true);
  
  // Test that email contains tech tags
  mockProjectData.project.techTags.forEach(tech => {
    assertEquals(emailHtml.includes(tech), true);
  });
  
  // Test that email contains repo URL
  assertEquals(emailHtml.includes(mockProjectData.project.repoUrl), true);
  
  // Test that email contains image
  assertEquals(emailHtml.includes(mockProjectData.project.imageUrl!), true);
});

Deno.test("Blog post email template without optional fields", () => {
  const dataWithoutOptionals = {
    ...mockBlogPostData,
    post: {
      ...mockBlogPostData.post,
      excerpt: undefined,
      imageUrl: undefined,
      tags: []
    }
  };
  
  const emailHtml = generateBlogPostEmail(dataWithoutOptionals);
  
  // Should still generate valid HTML
  assertExists(emailHtml);
  assertEquals(typeof emailHtml, 'string');
  
  // Should contain title and basic structure
  assertEquals(emailHtml.includes(dataWithoutOptionals.post.title), true);
  assertEquals(emailHtml.includes('imadlab'), true);
  assertEquals(emailHtml.includes('Unsubscribe'), true);
});

Deno.test("Project email template without optional fields", () => {
  const dataWithoutOptionals = {
    ...mockProjectData,
    project: {
      ...mockProjectData.project,
      imageUrl: undefined,
      repoUrl: undefined,
      techTags: []
    }
  };
  
  const emailHtml = generateProjectEmail(dataWithoutOptionals);
  
  // Should still generate valid HTML
  assertExists(emailHtml);
  assertEquals(typeof emailHtml, 'string');
  
  // Should contain title and basic structure
  assertEquals(emailHtml.includes(dataWithoutOptionals.project.title), true);
  assertEquals(emailHtml.includes('imadlab'), true);
  assertEquals(emailHtml.includes('Unsubscribe'), true);
  
  // Should not contain repo button when no repo URL
  assertEquals(emailHtml.includes('View Code'), false);
});

Deno.test("Email templates contain proper HTML structure", () => {
  const blogEmail = generateBlogPostEmail(mockBlogPostData);
  const projectEmail = generateProjectEmail(mockProjectData);
  
  // Test HTML structure
  [blogEmail, projectEmail].forEach(email => {
    assertEquals(email.includes('<!DOCTYPE html>'), true);
    assertEquals(email.includes('<html lang="en">'), true);
    assertEquals(email.includes('<head>'), true);
    assertEquals(email.includes('<body>'), true);
    assertEquals(email.includes('</html>'), true);
    
    // Test responsive meta tag
    assertEquals(email.includes('viewport'), true);
    
    // Test CSS styles
    assertEquals(email.includes('<style>'), true);
    assertEquals(email.includes('@media'), true);
  });
});

Deno.test("Email templates are mobile responsive", () => {
  const blogEmail = generateBlogPostEmail(mockBlogPostData);
  const projectEmail = generateProjectEmail(mockProjectData);
  
  [blogEmail, projectEmail].forEach(email => {
    // Test mobile breakpoint
    assertEquals(email.includes('@media (max-width: 600px)'), true);
    
    // Test mobile-specific styles
    assertEquals(email.includes('width: 100%'), true);
  });
});

Deno.test("Unsubscribe token validation", () => {
  const testCases = [
    'valid-uuid-token',
    'another-test-token-123',
    'special-chars-!@#$%'
  ];
  
  testCases.forEach(token => {
    const data = {
      ...mockBlogPostData,
      unsubscribeToken: token
    };
    
    const email = generateBlogPostEmail(data);
    assertEquals(email.includes(`token=${token}`), true);
  });
});
