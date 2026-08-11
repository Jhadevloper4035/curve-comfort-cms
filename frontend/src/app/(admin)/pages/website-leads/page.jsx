import { useEffect, useMemo, useState } from 'react'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { Col, Row, Button } from 'react-bootstrap'
import useWebsiteLeadsStore from '@/store/websiteLeadsStore'
import { downloadExcel } from '@/helpers/httpClient'
import WebsiteLeadsTable from './components/WebsiteLeadsTable'
import { StatCard } from '../../dashboard/analytics/components/Stats'

const WebsiteLeads = () => {
  const { leads, fetchLeads } = useWebsiteLeadsStore()

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const stats = useMemo(() => {
    const sourceCounts = leads.reduce((acc, lead) => {
      const key = lead.enquiryType || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const variants = ['primary', 'success', 'danger', 'warning', 'info']
    const sourceStats = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count], idx) => ({
        amount: count.toString(),
        icon: 'iconamoon:link-duotone',
        variant: variants[idx % variants.length],
        name: source,
      }))

    return [
      {
        amount: leads.length.toString(),
        icon: 'iconamoon:contact-duotone',
        variant: 'primary',
        name: 'Total Leads',
      },
      ...sourceStats,
    ]
  }, [leads])

  const [downloading, setDownloading] = useState(false)

  const handleDownloadExcel = async () => {
    setDownloading(true)
    try {
      await downloadExcel('/api/lead/website/download', 'Website-Enquiries.xlsx')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <PageBreadcrumb subName="Website Apps" title="Website Leads" />
      <PageMetaData title="Website Leads" />

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
            {downloading && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />}
            {downloading ? 'Preparing...' : 'Download Excel'}
          </Button>
        </Col>
      </Row>

      <WebsiteLeadsTable />
    </>
  )
}

export default WebsiteLeads
