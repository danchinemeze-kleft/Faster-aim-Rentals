'use client'

import { useEffect } from 'react'

const BASE_URL = 'https://rent.fasteraim.com'

export default function Breadcrumb({ items, theme = 'light' }) {
  const isDark = theme === 'dark'

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: BASE_URL + item.href,
      })),
    }
    document.head.querySelector('#breadcrumb-jsonld')?.remove()
    const script = document.createElement('script')
    script.id = 'breadcrumb-jsonld'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => { document.head.querySelector('#breadcrumb-jsonld')?.remove() }
  }, [items])

  return (
    <>
      <nav aria-label="Breadcrumb" style={{ padding: '8px 0', marginBottom: '4px' }}>
        <ol style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '2px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          fontSize: '0.8rem',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {!isLast ? (
                  <>
                    <a
                      href={item.href}
                      style={{
                        color: isDark ? '#0ef6cc' : '#e67e22',
                        textDecoration: 'none',
                        fontWeight: 600,
                        padding: '2px 4px',
                        borderRadius: '4px',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {item.label}
                    </a>
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.25)' : '#bbb', fontSize: '0.7rem', userSelect: 'none' }}>›</span>
                  </>
                ) : (
                  <span style={{
                    color: isDark ? 'rgba(255,255,255,0.5)' : '#999',
                    fontWeight: 500,
                    padding: '2px 4px',
                  }}>
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
