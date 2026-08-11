import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import useShowroomLeadsStore from '@/store/showroomLeadsStore'
import ShowroomLeadsTable from './components/ShowroomLeadsTable'
import { Col, Row, Button } from 'react-bootstrap'
import { StatCard } from '../dashboard/analytics/components/Stats'
import { downloadExcel } from '@/helpers/httpClient'


const ShowroomLeads = () => {
  const navigate = useNavigate()
  const { leads, fetchLeads } = useShowroomLeadsStore()

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
      .map(([type, count], idx) => ({
        amount: count.toString(),
        icon: 'iconamoon:profile-circle-duotone',
        variant: variants[idx % variants.length],
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

  const [downloading, setDownloading] = useState(false)

  const handleDownloadExcel = async () => {
    setDownloading(true)
    try {
      await downloadExcel('/api/lead/showroom/download', 'Showroom-Enquiry.xlsx')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <PageBreadcrumb subName="Pages" title="Showroom Enquiry" />
      <PageMetaData title="Showroom Enquiry" />

        {/* <LeadHero /> */}

      <Row className="mb-4">
        {stats.map((stat, idx) => (
          <Col xxl={6} md={6} key={idx}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>



      <Row className="mb-4 justify-content-end">
        <Col xs="auto" className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-info"
            onClick={() => navigate('/showroom-lead')}
          >
            Add New Lead
          </Button>
         
          <Button variant="success" onClick={handleDownloadExcel} disabled={downloading}>
            {downloading && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />}
            {downloading ? 'Preparing...' : 'Download Excel'}
          </Button>
        </Col>
      </Row>


    

      <ShowroomLeadsTable />
    </>
  )
}

export default ShowroomLeads
