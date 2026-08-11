import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Col, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { downloadExcel } from '@/helpers/httpClient'
import useDubaiwoodLeadsStore from '@/store/dubaiwoodLeadsStore'
import { StatCard } from '../../dashboard/analytics/components/Stats'
import DubaiwoodLeadsTable from './components/DubaiwoodLeadsTable'

const DubaiwoodLeads = () => {
  const navigate = useNavigate()
  const { leads, fetchLeads } = useDubaiwoodLeadsStore()
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const stats = useMemo(() => {
    const userTypeCounts = leads.reduce((acc, lead) => {
      const key = lead.UserType || lead.userType || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const variants = ['primary', 'success', 'danger', 'warning', 'info']
    const userTypeStats = Object.entries(userTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count], index) => ({
        amount: count.toString(),
        icon: 'iconamoon:profile-circle-duotone',
        variant: variants[index % variants.length],
        name: type,
      }))

    return [
      {
        amount: leads.length.toString(),
        icon: 'iconamoon:contact-duotone',
        variant: 'primary',
        name: 'Total Leads',
      },
      ...userTypeStats,
    ]
  }, [leads])

  const handleDownloadExcel = async () => {
    setDownloading(true)
    try {
      await downloadExcel('/api/lead/dubaiwood/download', 'Dubaiwood-Show-Enquiry.xlsx')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <PageBreadcrumb subName="Pages" title="Dubaiwood Show Enquiry" />
      <PageMetaData title="Dubaiwood Show Enquiry" />

      <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col xxl={6} md={6} key={index}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      <Row className="mb-4 justify-content-end">
        <Col xs="auto" className="d-flex gap-2 flex-wrap">
          <Button variant="outline-info" onClick={() => navigate('/dubaiwood-lead')}>
            Add New Lead
          </Button>
          <Button variant="success" onClick={handleDownloadExcel} disabled={downloading}>
            {downloading && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />}
            {downloading ? 'Preparing...' : 'Download Excel'}
          </Button>
        </Col>
      </Row>

      <DubaiwoodLeadsTable />
    </>
  )
}

export default DubaiwoodLeads
