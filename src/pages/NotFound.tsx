import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Page, PageTitle } from '@/components/layout/Page';

const NotFound = () => (
  <Page>
    <SEO
      title="404"
      description="This page does not exist. Try the projects or the writing instead."
      noindex
      nofollow
      schemaType="WebPage"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: '404', path: '/404' },
      ]}
    />
    <PageTitle title="Page not found" description="This page doesn't exist or has moved.">
      <p className="mt-6 flex gap-5">
        <Link to="/" className="nd-link">
          Home
        </Link>
        <Link to="/projects" className="nd-link">
          Projects
        </Link>
        <Link to="/blogs" className="nd-link">
          Writing
        </Link>
      </p>
    </PageTitle>
  </Page>
);

export default NotFound;
