import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Col, Row, Spinner } from 'react-bootstrap'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { StatCard } from '../dashboard/analytics/components/Stats'
import { apiFetch } from '@/helpers/httpClient'

const Monitoring = () => {
  const [monitoring, setMonitoring] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadMonitoring = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiFetch('/api/admin/monitoring')
      setMonitoring(response.data.monitoring)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load monitoring data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMonitoring()
  }, [loadMonitoring])

  const cards = monitoring && [
    { amount: `${monitoring.payments.successRate}%`, icon: 'iconamoon:check-circle-1-duotone', variant: 'success', name: 'Payment Success Rate' },
    { amount: `${monitoring.payments.failureRate}%`, icon: 'iconamoon:close-circle-1-duotone', variant: 'danger', name: 'Payment Failure Rate' },
    { amount: monitoring.payments.pending.toString(), icon: 'bx:time-five', variant: 'warning', name: 'Pending Payments' },
    { amount: monitoring.payments.oldPendingPayments.toString(), icon: 'bx:error-circle', variant: 'danger', name: 'Payments Awaiting Review' },
    { amount: monitoring.cashfree.failures.toString(), icon: 'bx:credit-card', variant: 'danger', name: 'Cashfree Failures' },
    { amount: monitoring.webhooks.invalidSignatures.toString(), icon: 'bx:shield-quarter', variant: 'danger', name: 'Invalid Webhook Signatures' },
    { amount: monitoring.webhooks.failures.toString(), icon: 'bx:cloud-download', variant: 'danger', name: 'Webhook Failures' },
    { amount: monitoring.refunds.failures.toString(), icon: 'bx:undo', variant: 'danger', name: 'Refund Failures' },
    { amount: monitoring.emailFailures.toString(), icon: 'bx:envelope', variant: 'danger', name: 'Email Failures' },
    { amount: monitoring.inventoryReservationLeaks.toString(), icon: 'bx:package', variant: 'warning', name: 'Expired Reservations' },
  ]

  return (
    <>
      <PageBreadcrumb subName="Store" title="Monitoring" />
      <PageMetaData title="Monitoring" />

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">{monitoring ? `Updated ${new Date(monitoring.generatedAt).toLocaleString()}` : 'Payment and delivery health'}</p>
        <Button variant="primary" onClick={loadMonitoring} disabled={loading}>
          {loading && <Spinner size="sm" className="me-1" />}
          Refresh
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && !monitoring ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <Row className="g-3">
          {cards?.map((card) => <Col key={card.name} xs={12} sm={6} xl={4}><StatCard {...card} /></Col>)}
        </Row>
      )}
    </>
  )
}

export default Monitoring
