import { DEFAULT_PAGE_TITLE } from '@/context/constants';
import { useEffect } from 'react';
const PageMetaData = ({
  title
}) => {
  const pageTitle = title ? `${title} | ${DEFAULT_PAGE_TITLE}` : DEFAULT_PAGE_TITLE;

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return null;
};
export default PageMetaData;