import { lazy } from 'react';
import { Suspense, useState } from 'react';
import FallbackLoading from '@/components/FallbackLoading';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useAuthContext } from '@/context/useAuthContext';
import { useLayoutContext } from '@/context/useLayoutContext';
const ActivityStream = lazy(() => import('@/components/ActivityStream'));
const ActivityStreamToggle = () => {
  const { user } = useAuthContext();
  const {
    activityStream: {
      open,
      toggle
    }
  } = useLayoutContext();
  const isAdmin = ['admin', 'superadmin'].includes(user?.accessType || user?.role);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(open);
  const toggleActivityStreamOffcanvas = () => {
    if (!hasOpenedOnce) setHasOpenedOnce(true);
    toggle();
  };

  if (!isAdmin) return null;

  return <>
      <div className="topbar-item d-none d-md-flex">
        <button onClick={toggleActivityStreamOffcanvas} className="topbar-button">
          <IconifyIcon icon="iconamoon:history-duotone" className="fs-24 align-middle" />
        </button>
      </div>

      <Suspense fallback={<FallbackLoading />}>{hasOpenedOnce && <ActivityStream open={open} toggle={toggleActivityStreamOffcanvas} />}</Suspense>
    </>;
};
export default ActivityStreamToggle;
