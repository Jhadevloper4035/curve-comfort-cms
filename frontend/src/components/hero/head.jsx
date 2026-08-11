import { useState } from 'react'

const LeadHero = () => {
  const [hoveredBtn, setHoveredBtn] = useState(null)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#22282e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '960px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
          padding: '3.5rem 3rem',
          boxShadow: '0 4px 60px rgba(15, 52, 96, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
            {/* Avatar icon */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#1a1a2e',
                position: 'relative',
              }}>
              <div
                style={{ position: 'absolute', top: '10px', left: '8px', width: '6px', height: '6px', borderRadius: '50%', background: '#e2e8f0' }}
              />
              <div
                style={{ position: 'absolute', top: '10px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: '#e2e8f0' }}
              />
            </div>
            <div
              style={{
                width: '28px',
                height: '20px',
                borderRadius: '4px',
                background: '#3b82f6',
              }}
            />
          </div>
        </div>

        {/* Text content */}
        <h1
          style={{
            fontSize: '2.6rem',
            fontWeight: 700,
            color: '#e2e8f0',
            lineHeight: 1.2,
            margin: 0,
            maxWidth: '680px',
          }}>
          Discover, Collect, Track and Manage <span style={{ color: '#f59e0b' }}>your Leads.</span>
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '1.05rem',
            margin: '1rem 0 2rem',
            maxWidth: '500px',
          }}>
          The world's first and largest lead management platform.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onMouseEnter={() => setHoveredBtn('all')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '0.75rem 1.8rem',
              borderRadius: '8px',
              border: 'none',
              background: hoveredBtn === 'all' ? '#f8fafc' : '#e2e8f0',
              color: '#1a1a2e',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
            <span style={{ fontSize: '1.1rem' }}>↓</span> All Leads
          </button>

          <button
            onMouseEnter={() => setHoveredBtn('add')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '0.75rem 1.8rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: hoveredBtn === 'add' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              color: '#e2e8f0',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            Add New Lead
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeadHero
