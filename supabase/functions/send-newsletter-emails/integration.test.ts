import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Integration tests for email system
// Note: These tests require a test Supabase instance with proper setup

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'test-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to clean up test data
async function cleanupTestData() {
  // Clean up in reverse order due to foreign key constraints
  await supabase.from('email_analytics').delete().like('subscriber_email', 'test%');
  await supabase.from('email_queue').delete().like('content_id', 'test%');
  await supabase.from('newsletter_subscribers').delete().like('email', 'test%');
  await supabase.from('posts').delete().like('slug', 'test%');
  await supabase.from('projects').delete().like('title', 'Test%');
}

// Helper function to create test subscriber
async function createTestSubscriber(email = 'test@example.com') {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email,
      status: 'active'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

Deno.test({
  name: "Database trigger creates email queue item for new blog post",
  async fn() {
    await cleanupTestData();
    
    // Create a test blog post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: 'Test Blog Post Integration',
        slug: 'test-blog-post-integration',
        published_date: new Date().toISOString(),
        excerpt: 'Test excerpt for integration test'
      })
      .select()
      .single();
    
    assertEquals(postError, null);
    assertExists(post);
    
    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email queue item was created
    const { data: queueItem, error: queueError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('content_id', post.id)
      .eq('content_type', 'blog_post')
      .single();
    
    assertEquals(queueError, null);
    assertExists(queueItem);
    assertEquals(queueItem.content_type, 'blog_post');
    assertEquals(queueItem.status, 'pending');
    
    await cleanupTestData();
  },
  sanitizeResources: false,
  sanitizeOps: false
});

Deno.test({
  name: "Database trigger creates email queue item for new project",
  async fn() {
    await cleanupTestData();
    
    // Create a test project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title: 'Test Project Integration',
        description: 'Test project for integration testing'
      })
      .select()
      .single();
    
    assertEquals(projectError, null);
    assertExists(project);
    
    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email queue item was created
    const { data: queueItem, error: queueError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('content_id', project.id)
      .eq('content_type', 'project')
      .single();
    
    assertEquals(queueError, null);
    assertExists(queueItem);
    assertEquals(queueItem.content_type, 'project');
    assertEquals(queueItem.status, 'pending');
    
    await cleanupTestData();
  },
  sanitizeResources: false,
  sanitizeOps: false
});

Deno.test({
  name: "Email queue processing with subscribers",
  async fn() {
    await cleanupTestData();
    
    // Create test subscriber
    const subscriber = await createTestSubscriber('test-integration@example.com');
    
    // Create test blog post (which should trigger queue creation)
    const { data: post } = await supabase
      .from('posts')
      .insert({
        title: 'Test Queue Processing',
        slug: 'test-queue-processing',
        published_date: new Date().toISOString(),
        excerpt: 'Test excerpt for queue processing'
      })
      .select()
      .single();
    
    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify queue item exists
    const { data: queueItem } = await supabase
      .from('email_queue')
      .select('*')
      .eq('content_id', post.id)
      .single();
    
    assertExists(queueItem);
    assertEquals(queueItem.status, 'pending');
    
    // Note: In a real integration test, you would call the email function here
    // For this test, we'll simulate the processing by updating the queue status
    const { error: updateError } = await supabase
      .from('email_queue')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', queueItem.id);
    
    assertEquals(updateError, null);
    
    // Verify the queue item was updated
    const { data: updatedItem } = await supabase
      .from('email_queue')
      .select('*')
      .eq('id', queueItem.id)
      .single();
    
    assertEquals(updatedItem.status, 'sent');
    assertExists(updatedItem.sent_at);
    
    await cleanupTestData();
  },
  sanitizeResources: false,
  sanitizeOps: false
});

Deno.test({
  name: "Unsubscribe token functionality",
  async fn() {
    await cleanupTestData();
    
    // Create test subscriber
    const subscriber = await createTestSubscriber('test-unsubscribe@example.com');
    
    assertExists(subscriber.unsubscribe_token);
    assertEquals(subscriber.status, 'active');
    
    // Simulate unsubscribe by updating status
    const { error: unsubscribeError } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        status: 'unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('unsubscribe_token', subscriber.unsubscribe_token);
    
    assertEquals(unsubscribeError, null);
    
    // Verify subscriber was unsubscribed
    const { data: unsubscribedUser } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('id', subscriber.id)
      .single();
    
    assertEquals(unsubscribedUser.status, 'unsubscribed');
    
    await cleanupTestData();
  },
  sanitizeResources: false,
  sanitizeOps: false
});

Deno.test({
  name: "Email analytics tracking",
  async fn() {
    await cleanupTestData();
    
    // Create test data
    const subscriber = await createTestSubscriber('test-analytics@example.com');
    
    const { data: post } = await supabase
      .from('posts')
      .insert({
        title: 'Test Analytics Post',
        slug: 'test-analytics-post',
        published_date: new Date().toISOString()
      })
      .select()
      .single();
    
    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: queueItem } = await supabase
      .from('email_queue')
      .select('*')
      .eq('content_id', post.id)
      .single();
    
    // Create analytics record
    const { data: analytics, error: analyticsError } = await supabase
      .from('email_analytics')
      .insert({
        email_queue_id: queueItem.id,
        subscriber_email: subscriber.email,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();
    
    assertEquals(analyticsError, null);
    assertExists(analytics);
    assertEquals(analytics.subscriber_email, subscriber.email);
    assertExists(analytics.sent_at);
    
    // Simulate email events
    const { error: deliveredError } = await supabase
      .from('email_analytics')
      .update({ delivered_at: new Date().toISOString() })
      .eq('id', analytics.id);
    
    assertEquals(deliveredError, null);
    
    const { error: openedError } = await supabase
      .from('email_analytics')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', analytics.id);
    
    assertEquals(openedError, null);
    
    // Verify analytics were updated
    const { data: updatedAnalytics } = await supabase
      .from('email_analytics')
      .select('*')
      .eq('id', analytics.id)
      .single();
    
    assertExists(updatedAnalytics.delivered_at);
    assertExists(updatedAnalytics.opened_at);
    
    await cleanupTestData();
  },
  sanitizeResources: false,
  sanitizeOps: false
});

Deno.test({
  name: "Email queue retry logic simulation",
  async fn() {
    await cleanupTestData();
    
    // Create test post
    const { data: post } = await supabase
      .from('posts')
      .insert({
        title: 'Test Retry Logic',
        slug: 'test-retry-logic',
        published_date: new Date().toISOString()
      })
      .select()
      .single();
    
    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: queueItem } = await supabase
      .from('email_queue')
      .select('*')
      .eq('content_id', post.id)
      .single();
    
    // Simulate failed send
    const { error: failError } = await supabase
      .from('email_queue')
      .update({ 
        status: 'failed',
        retry_count: 1,
        error_message: 'Simulated failure for testing'
      })
      .eq('id', queueItem.id);
    
    assertEquals(failError, null);
    
    // Verify retry count was incremented
    const { data: failedItem } = await supabase
      .from('email_queue')
      .select('*')
      .eq('id', queueItem.id)
      .single();
    
    assertEquals(failedItem.status, 'failed');
    assertEquals(failedItem.retry_count, 1);
    assertExists(failedItem.error_message);
    
    await cleanupTestData();
  },
  sanitizeResources: false,
  sanitizeOps: false
});