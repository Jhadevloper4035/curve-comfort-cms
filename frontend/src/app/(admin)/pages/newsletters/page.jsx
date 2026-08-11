import { useEffect, useMemo, useState } from 'react'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { Button, Col, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { downloadExcel } from '@/helpers/httpClient'
import useNewsletterSubscribersStore from '@/store/newsletterSubscribersStore'
import NewsletterSubscribersTable from './components/NewsletterSubscribersTable'
import { StatCard } from '../../dashboard/analytics/components/Stats'

const Newsletters = () => {
  const { subscribers, fetchSubscribers } = useNewsletterSubscribersStore()
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const stats = useMemo(() => {
    const activeCount = subscribers.filter((subscriber) => subscriber.status === 'active').length
    const unsubscribedCount = subscribers.filter((subscriber) => subscriber.status === 'unsubscribed').length
    const sourceCounts = subscribers.reduce((acc, subscriber) => {
      const key = subscriber.source || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]

    return [
      {
        amount: subscribers.length.toString(),
        icon: 'iconamoon:email-thin',
        variant: 'primary',
        name: 'Total Subscribers',
      },
      {
        amount: activeCount.toString(),
        icon: 'iconamoon:check-circle-1-duotone',
        variant: 'success',
        name: 'Active',
      },
      {
        amount: unsubscribedCount.toString(),
        icon: 'iconamoon:close-circle-1-duotone',
        variant: 'danger',
        name: 'Unsubscribed',
      },
      {
        amount: topSource ? topSource[1].toString() : '0',
        icon: 'iconamoon:link-duotone',
        variant: 'info',
        name: topSource ? `Top Source: ${topSource[0]}` : 'Top Source',
      },
    ]
  }, [subscribers])

  const handleDownloadExcel = async () => {
    setDownloading(true)
    try {
      await downloadExcel('/api/newsletter/download', 'Newsletter-Subscribers.xlsx')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <PageBreadcrumb subName="Website Apps" title="Newsletters" />
      <PageMetaData title="Newsletters" />

      <Row className="mb-4">
        {stats.map((stat, idx) => (
          <Col xxl={6} md={6} key={idx}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      <Row className="mb-4 justify-content-end">
        <Col xs="auto">
          <Button variant="success" onClick={handleDownloadExcel} disabled={downloading}>
            {downloading ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
            ) : (
              <IconifyIcon icon="iconamoon:download-duotone" className="me-1" />
            )}
            {downloading ? 'Preparing...' : 'Download Excel'}
          </Button>
        </Col>
      </Row>

      <NewsletterSubscribersTable />
    </>
  )
}

export default Newsletters
