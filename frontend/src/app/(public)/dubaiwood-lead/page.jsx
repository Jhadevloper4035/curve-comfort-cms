import { useState } from 'react'
import { Col, Container, Row, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import ReactSelect from 'react-select'
import { apiFetch } from '@/helpers/httpClient'
import logoLight from '@/assets/images/logo-light-full.png'
import dubaiwoodLogo from '@/assets/images/dubaiwoodshow/logo.png'

const PRODUCT_OPTIONS = [
  { value: 'PVC HPL', label: 'PVC HPL' },
  { value: 'Decorative HPL', label: 'Decorative HPL' },
  { value: 'Acrylic HPL', label: 'Acrylic HPL' },
  { value: 'Edgeband', label: 'Edgeband' },
  { value: 'MDF Boards', label: 'MDF Boards' },
  { value: 'Acoustic Panels', label: 'Acoustic Panels' },
  { value: 'Matteva', label: 'Matteva' },
]

const USER_TYPE_OPTIONS = ['Architect', 'End Customer', 'Retailer'].map((type) => ({
  value: type,
  label: type,
}))

const INITIAL = {
  fullName: '',
  email: '',
  mobileNumber: '',
  userType: '',
  productType: [],
  companyName: '',
  country: '',
  representative: '',
}

const darkSelect = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#2b2b2b',
    borderColor: state.isFocused ? '#6c757d' : '#444',
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(108,117,125,.25)' : 'none',
    '&:hover': { borderColor: '#6c757d' },
  }),
  menu: (base) => ({ ...base, backgroundColor: '#2b2b2b', zIndex: 9999 }),
  menuList: (base) => ({ ...base, backgroundColor: '#2b2b2b' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#3d3d3d' : state.isSelected ? '#495057' : 'transparent',
    color: '#dee2e6',
    '&:active': { backgroundColor: '#495057' },
  }),
  singleValue: (base) => ({ ...base, color: '#dee2e6' }),
  multiValue: (base) => ({ ...base, backgroundColor: '#495057' }),
  multiValueLabel: (base) => ({ ...base, color: '#dee2e6' }),
  multiValueRemove: (base) => ({ ...base, color: '#adb5bd', '&:hover': { backgroundColor: '#dc3545', color: '#fff' } }),
  placeholder: (base) => ({ ...base, color: '#6c757d' }),
  input: (base) => ({ ...base, color: '#dee2e6' }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: '#444' }),
  dropdownIndicator: (base) => ({ ...base, color: '#6c757d' }),
  clearIndicator: (base) => ({ ...base, color: '#6c757d' }),
  noOptionsMessage: (base) => ({ ...base, color: '#6c757d', backgroundColor: '#2b2b2b' }),
}

const inputStyle = {
  backgroundColor: '#2b2b2b',
  border: '1px solid #444',
  color: '#dee2e6',
  borderRadius: 4,
  padding: '8px 12px',
  width: '100%',
  outline: 'none',
  fontSize: 14,
}

const labelStyle = { color: '#dee2e6', fontSize: 14, marginBottom: 6, display: 'block' }

const DubaiwoodLeadForm = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    setSubmitting(true)
    try {
      await apiFetch('/api/lead/dubaiwood/contact-form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      navigate('/thank-you', {
        state: {
          message: 'Your Dubaiwood Show enquiry has been submitted successfully. Our team will get in touch with you shortly. ',
          backPath: '/dubaiwood-lead',
          backLabel: 'Submit Another Enquiry',
        },
      })
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#282f36',
        paddingBottom: 0,
      }}>
      <nav style={{ backgroundColor: '#282f36', borderBottom: '1px solid #444', padding: '12px 0' }}>
        <Container className="d-flex justify-content-center">
          <img src={logoLight} alt="Curve Comfort" style={{ height: 55 }} />
        </Container>
      </nav>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={6} xl={6}>
            <div style={{ backgroundColor: '#282f36', borderRadius: 12, padding: '36px 40px', border: '1px solid #3d4650' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 40,
                }}>
                <img
                  src={dubaiwoodLogo}
                  alt="Dubaiwood Show"
                  style={{ width: 'min(100%, 280px)', height: 'auto', maxHeight: 120, objectFit: 'contain', display: 'block' }}
                />
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: '#4a1a1a',
                    border: '1px solid #dc3545',
                    color: '#f8d7da',
                    borderRadius: 6,
                    padding: '10px 14px',
                    marginBottom: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    style={{ background: 'none', border: 'none', color: '#f8d7da', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                    x
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Full Name</label>
                      <input style={inputStyle} name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" minLength={2} maxLength={100} />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Mobile Number</label>
                      <input style={inputStyle} type="tel" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="+971501234567" />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Email</label>
                      <input style={inputStyle} type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address (optional)" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>User Type</label>
                      <ReactSelect
                        options={USER_TYPE_OPTIONS}
                        styles={darkSelect}
                        placeholder="Select user type..."
                        classNamePrefix="react-select"
                        onChange={(opt) => setForm((prev) => ({ ...prev, userType: opt?.value ?? '' }))}
                        value={USER_TYPE_OPTIONS.find((option) => option.value === form.userType) ?? null}
                      />
                    </div>
                  </Col>
                </Row>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Product Enquiry</label>
                  <ReactSelect
                    isMulti
                    options={PRODUCT_OPTIONS}
                    styles={darkSelect}
                    placeholder="Select products..."
                    classNamePrefix="react-select"
                    onChange={(opts) => setForm((prev) => ({ ...prev, productType: opts ? opts.map((option) => option.value) : [] }))}
                    value={PRODUCT_OPTIONS.filter((option) => form.productType.includes(option.value))}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Firm Name &amp; Address</label>
                  <input style={inputStyle} name="companyName" value={form.companyName} onChange={handleChange} placeholder="Enter your firm name and address" />
                </div>

                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Country</label>
                      <input style={inputStyle} name="country" value={form.country} onChange={handleChange} placeholder="Enter your country" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: 24 }}>
                      <label style={labelStyle}>Representative</label>
                      <input style={inputStyle} name="representative" value={form.representative} onChange={handleChange} placeholder="Representative name" />
                    </div>
                  </Col>
                </Row>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0d6efd',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}>
                  {submitting ? (
                    <>
                      <Spinner size="sm" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Enquiry'
                  )}
                </button>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default DubaiwoodLeadForm
