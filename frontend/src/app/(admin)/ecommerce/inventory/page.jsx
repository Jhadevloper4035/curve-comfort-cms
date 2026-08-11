import { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import FilterProducts from './components/FilterProducts'
import InventoryProducts from './components/InventoryProducts'

const Inventory = () => {
  const [filters, setFilters] = useState(null)

  return (
    <>
      <PageBreadcrumb subName="Ecommerce" title="Inventory" />
      <PageMetaData title="Inventory" />
      <Row>
        <Col xs={12}>
          <FilterProducts onFilter={setFilters} />
        </Col>
        <Col xs={12}>
          <InventoryProducts filters={filters} />
        </Col>
      </Row>
    </>
  )
}

export default Inventory
