import { useEffect, useMemo, useState } from 'react'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { Col, Row, Button } from 'react-bootstrap'
import useProductEnquiriesStore from '@/store/productEnquiriesStore'
import ProductEnquiriesTable from './components/ProductEnquiriesTable'
import { StatCard } from '../../dashboard/analytics/components/Stats'
import { downloadExcel } from '@/helpers/httpClient'

const ProductEnquiries = () => {
  const { leads, fetchLeads } = useProductEnquiriesStore()

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const stats = useMemo(() => {
    const categoryCounts = leads.reduce((acc, lead) => {
      const key = lead.productInterest || 'General'
      if (key === 'SD-1525-SMT - SD 1525') return acc
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const variants = ['primary', 'success', 'danger', 'warning', 'info']
    const categoryStats = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, count], idx) => ({
        amount: count.toString(),
        icon: 'iconamoon:shopping-bag-duotone',
        variant: variants[idx % variants.length],
        name: category,
      }))

    return [
      {
        amount: leads.length.toString(),
        icon: 'iconamoon:contact-duotone',
        variant: 'primary',
        name: 'Total Enquiries',
      },
      ...categoryStats,
    ]
  }, [leads])

  const [downloading, setDownloading] = useState(false)

  const handleDownloadExcel = async () => {
    setDownloading(true)
    try {
      await downloadExcel('/api/lead/product-enquiry/download', 'Product-Enquiries.xlsx')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <PageBreadcrumb subName="Website Apps" title="Product Enquiries" />
      <PageMetaData title="Product Enquiries" />

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

      <ProductEnquiriesTable />
    </>
  )
}

export default ProductEnquiries
