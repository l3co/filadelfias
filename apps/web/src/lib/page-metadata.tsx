import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolvePageMetadata } from './page-metadata.config';

export function AppMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = resolvePageMetadata(pathname);
    document.title = metadata.title === 'Filadélfias'
      ? metadata.title
      : `${metadata.title} - Filadélfias`;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', metadata.description);
    }

    const titleTag = document.querySelector('meta[name="title"]');
    if (titleTag) {
      titleTag.setAttribute(
        'content',
        metadata.title === 'Filadélfias' ? metadata.title : `${metadata.title} - Filadélfias`,
      );
    }
  }, [pathname]);

  return null;
}
