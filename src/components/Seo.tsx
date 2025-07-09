
import { Helmet } from 'react-helmet-async';

type SeoProps = {
  title: string;
  description: string;
};

const Seo = ({ title, description }: SeoProps) => {
  const defaultTitle = 'Imadlab | Imad - Data Engineer, AI/ML Professional & Student Portfolio';
  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default Seo;
