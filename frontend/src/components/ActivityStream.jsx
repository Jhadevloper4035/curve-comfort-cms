import { useCallback, useEffect, useState } from 'react';
import { Button, ButtonGroup, Offcanvas, OffcanvasBody, OffcanvasHeader, Spinner } from 'react-bootstrap';
import { getActivityStream, getLeadActivityStream } from '@/helpers/activityStreamApi';
import { useAuthContext } from '@/context/useAuthContext';
import IconifyIcon from './wrappers/IconifyIcon';
import SimplebarReactClient from './wrappers/SimplebarReactClient';

const iconVariant = {
  success: 'success',
  info: 'primary',
  warning: 'warning',
  danger: 'danger',
}

const iconByType = {
  success: 'iconamoon:check-circle-1-duotone',
  info: 'iconamoon:information-circle-duotone',
  warning: 'bx:error-circle',
  danger: 'iconamoon:close-circle-1-duotone',
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

const ActivityItem = ({ activity }) => {
  const variant = iconVariant[activity.iconType] || 'primary'
  const icon = iconByType[activity.iconType] || iconByType.info

  return (
    <div className="position-relative ps-4">
      <div className="mb-4">
        <span className={`position-absolute start-0 translate-middle-x d-inline-flex align-items-center justify-content-center rounded-circle text-${variant} bg-${variant}-subtle avatar-sm fs-20`}>
          <IconifyIcon icon={icon} />
        </span>
        <div className="ms-2">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            <h5 className="mb-0 text-dark fw-semibold fs-15 lh-base">{activity.title}</h5>
            {activity.badge && (
              <span className={`badge px-2 py-1 bg-${variant}-subtle text-${variant}`}>
                {activity.badge}
              </span>
            )}
          </div>
          {activity.description && <p className="mb-1 text-muted">{activity.description}</p>}
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="avatar-xs rounded-circle bg-light text-dark d-inline-flex align-items-center justify-content-center fw-semibold">
              {activity.userAvatarLetter || activity.userName?.charAt(0) || 'A'}
            </span>
            <span className="fs-13 text-muted">
              {activity.userName || 'Unknown User'} · {formatDate(activity.createdAt)}
            </span>
          </div>
          <div className="fs-12 text-muted">
            IP: {activity.realIpAddress || activity.ipAddress || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  )
}

const ActivityStream = ({
  open,
  toggle
}) => {
  const { user } = useAuthContext()
  const isAdmin = ['admin', 'superadmin'].includes(user?.accessType || user?.role)
  const [filter, setFilter] = useState('all')
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchActivities = useCallback(async () => {
    if (!open || !isAdmin) return

    setLoading(true)
    setError('')
    try {
      const params = { limit: 30 }
      const res = filter === 'leads' ? await getLeadActivityStream(params) : await getActivityStream(params)
      setActivities(res.activities || [])
    } catch (err) {
      setActivities([])
      setError(err.message || 'Unable to load activity stream')
    } finally {
      setLoading(false)
    }
  }, [filter, isAdmin, open])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  if (!isAdmin) {
    return (
      <Offcanvas show={open} onHide={toggle} placement="end" className="border-0" tabIndex={-1}>
        <OffcanvasHeader closeVariant="white" closeButton className="d-flex align-items-center bg-primary p-3">
          <h5 className="text-white m-0 fw-semibold">Activity Stream</h5>
        </OffcanvasHeader>
        <OffcanvasBody>
          <div className="text-center text-danger py-5">Access denied.</div>
        </OffcanvasBody>
      </Offcanvas>
    )
  }

  return <div>
      <Offcanvas show={open} onHide={toggle} placement="end" className="border-0" tabIndex={-1} id="theme-activity-offcanvas" style={{
      maxWidth: 450,
      width: '100%'
    }}>
        <OffcanvasHeader closeVariant="white" closeButton className="d-flex align-items-center bg-primary p-3">
          <h5 className="text-white m-0 fw-semibold">Activity Stream</h5>
        </OffcanvasHeader>
        <OffcanvasBody className="p-0">
          <SimplebarReactClient className="h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <ButtonGroup size="sm">
                <Button variant={filter === 'all' ? 'primary' : 'outline-primary'} onClick={() => setFilter('all')}>
                  All
                </Button>
                <Button variant={filter === 'leads' ? 'primary' : 'outline-primary'} onClick={() => setFilter('leads')}>
                  Leads
                </Button>
              </ButtonGroup>
              <Button variant="soft-secondary" size="sm" onClick={fetchActivities} disabled={loading}>
                <IconifyIcon icon="iconamoon:synchronize-duotone" className="me-1" />
                Refresh
              </Button>
            </div>

            {loading && (
              <div className="text-center py-5">
                <Spinner size="sm" className="me-2" />
                Loading activity...
              </div>
            )}

            {!loading && error && (
              <div className="text-center text-danger py-5">
                {error.includes('403') ? 'Access denied.' : error}
              </div>
            )}

            {!loading && !error && activities.length === 0 && (
              <div className="text-center text-muted py-5">No recent activity.</div>
            )}

            <div className="position-relative ms-2">
              {activities.length > 0 && <span className="position-absolute start-0 top-0 border border-dashed h-100" />}
              {!loading && !error && activities.map((activity) => <ActivityItem activity={activity} key={activity._id} />)}
            </div>
          </SimplebarReactClient>
        </OffcanvasBody>
      </Offcanvas>
    </div>;
};
export default ActivityStream;
