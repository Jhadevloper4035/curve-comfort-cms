import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Container } from 'react-bootstrap'

import logoLight from '@/assets/images/logo-light-full.png'

const ThankYou = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const message = location.state?.message || 'Your enquiry has been submitted successfully.'
  const backPath = location.state?.backPath || '/showroom-lead'
  const backLabel = location.state?.backLabel || 'Submit Another Enquiry'

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <nav className=" shadow-sm py-3" style={{ backgroundColor: '#282f36' }}>
        <Container className="d-flex justify-content-center">
          <img src={logoLight} alt="Curve Comfort" style={{ height: 55 }} />
        </Container>
      </nav>

      <div
        className="flex-grow-1 d-flex align-items-center justify-content-center py-5"
        style={{
          minHeight: '100vh',
          background:
            "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20xmlns:svgjs='http://svgjs.dev/svgjs'%20width='1920'%20height='1050'%20preserveAspectRatio='none'%20viewBox='0%200%201920%201050'%3e%3cg%20mask='url(%23SvgjsMask1032)'%20fill='none'%3e%3cpath%20d='M0%200L773.71%200L0%20429.38z'%20fill='rgba(255,%20255,%20255,%20.1)'%3e%3c/path%3e%3cpath%20d='M0%20429.38L773.71%200L890.1400000000001%200L0%20604.44z'%20fill='rgba(255,%20255,%20255,%20.075)'%3e%3c/path%3e%3cpath%20d='M0%20604.44L890.1400000000001%200L1014.45%200L0%20857.6300000000001z'%20fill='rgba(255,%20255,%20255,%20.05)'%3e%3c/path%3e%3cpath%20d='M0%20857.6300000000001L1014.45%200L1152.65%200L0%20977.1200000000001z'%20fill='rgba(255,%20255,%20255,%20.025)'%3e%3c/path%3e%3cpath%20d='M1920%201050L1453.1%201050L1920%20616.74z'%20fill='rgba(0,%200,%200,%20.1)'%3e%3c/path%3e%3cpath%20d='M1920%20616.74L1453.1%201050L908.2799999999999%201050L1920%20522.16z'%20fill='rgba(0,%200,%200,%20.075)'%3e%3c/path%3e%3cpath%20d='M1920%20522.16L908.28%201050L485.4%201050L1920%20198.98999999999995z'%20fill='rgba(0,%200,%200,%20.05)'%3e%3c/path%3e%3cpath%20d='M1920%20198.99L485.4000000000001%201050L420.55000000000007%201050L1920%2074.84z'%20fill='rgba(0,%200,%200,%20.025)'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask%20id='SvgjsMask1032'%3e%3crect%20width='1920'%20height='1050'%20fill='%23ffffff'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e\") #282f36",
          paddingBottom: 0,
        }}>
        <Container>
          <div className="text-center mx-auto" style={{ maxWidth: 480 }}>
            <div className=" rounded-4 shadow p-5" style={{ backgroundColor: '#282f36' }}>
              <div
                className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: 80, height: 80 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#198754" fillOpacity="0.15" />
                  <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#198754" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h2 className="fw-bold mb-4">Thank You!</h2>
              <p className="text-muted mb-1">{message}</p>
              <p className="text-muted small mb-4">Our team will review your enquiry and get back to you shortly.</p>

              <Button variant="primary" size="lg" className="w-100" onClick={() => navigate(backPath)}>
                {backLabel}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default ThankYou
