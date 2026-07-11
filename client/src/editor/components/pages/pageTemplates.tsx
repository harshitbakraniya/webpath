import type { CSSProperties, ReactNode } from 'react';

export type PageTemplateId =
  | 'blank'
  | 'blog'
  | 'products'
  | 'appointments'
  | 'about'
  | 'contact'
  | 'services'
  | 'projects'
  | 'privacy'
  | 'refund'
  | 'terms';

export interface PageTemplateOption {
  id: PageTemplateId;
  title: string;
  defaultSlug: string;
  defaultTitle: string;
  group: 'empty' | 'business' | 'standard';
  addToNavDefault: boolean;
}

export const PAGE_TEMPLATES: PageTemplateOption[] = [
  {
    id: 'blank',
    title: 'New empty page',
    defaultSlug: 'page',
    defaultTitle: 'New Page',
    group: 'empty',
    addToNavDefault: true,
  },
  {
    id: 'blog',
    title: 'Blog',
    defaultSlug: 'blog',
    defaultTitle: 'Blog',
    group: 'business',
    addToNavDefault: true,
  },
  {
    id: 'products',
    title: 'Online store',
    defaultSlug: 'shop',
    defaultTitle: 'Shop',
    group: 'business',
    addToNavDefault: true,
  },
  {
    id: 'appointments',
    title: 'Appointments',
    defaultSlug: 'appointments',
    defaultTitle: 'Appointments',
    group: 'business',
    addToNavDefault: true,
  },
  {
    id: 'about',
    title: 'About',
    defaultSlug: 'about',
    defaultTitle: 'About',
    group: 'standard',
    addToNavDefault: true,
  },
  {
    id: 'contact',
    title: 'Contact',
    defaultSlug: 'contact',
    defaultTitle: 'Contact',
    group: 'standard',
    addToNavDefault: true,
  },
  {
    id: 'services',
    title: 'Services',
    defaultSlug: 'services',
    defaultTitle: 'Services',
    group: 'standard',
    addToNavDefault: true,
  },
  {
    id: 'projects',
    title: 'Projects',
    defaultSlug: 'projects',
    defaultTitle: 'Projects',
    group: 'standard',
    addToNavDefault: true,
  },
  {
    id: 'privacy',
    title: 'Privacy policy',
    defaultSlug: 'privacy-policy',
    defaultTitle: 'Privacy Policy',
    group: 'standard',
    addToNavDefault: false,
  },
  {
    id: 'refund',
    title: 'Refund policy',
    defaultSlug: 'refund-policy',
    defaultTitle: 'Refund Policy',
    group: 'standard',
    addToNavDefault: false,
  },
  {
    id: 'terms',
    title: 'Terms and conditions',
    defaultSlug: 'terms',
    defaultTitle: 'Terms and Conditions',
    group: 'standard',
    addToNavDefault: false,
  },
];

const pageShell: CSSProperties = {
  background: '#fff',
  color: '#0f172a',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '48px 56px',
  minHeight: 520,
};

const h1: CSSProperties = { margin: '0 0 20px', fontSize: 34, fontWeight: 700, lineHeight: 1.2 };
const h2: CSSProperties = { margin: '28px 0 10px', fontSize: 18, fontWeight: 700 };
const p: CSSProperties = { margin: '0 0 12px', fontSize: 14, lineHeight: 1.7, color: '#334155' };
const muted: CSSProperties = { ...p, color: '#64748b' };
const card: CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 16,
  background: '#f8fafc',
};

function Doc({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={pageShell}>
      <h1 style={h1}>{title}</h1>
      {children}
    </div>
  );
}

function LegalPreview({ title }: { title: string }) {
  return (
    <Doc title={title}>
      <p style={p}>
        This {title.toLowerCase()} describes how we handle information and your rights when you use
        our website and services. Please read it carefully.
      </p>
      <h2 style={h2}>Personal information we collect:</h2>
      <p style={p}>
        We may collect details you provide directly, such as your name, email address, and messages
        sent through forms on this site.
      </p>
      <h2 style={h2}>Why do we process your data?</h2>
      <p style={p}>
        We use this information to respond to inquiries, improve our services, and operate the
        website securely.
      </p>
      <h2 style={h2}>Your rights:</h2>
      <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
        <li>Request access to the personal data we hold about you</li>
        <li>Ask us to correct or delete your information</li>
        <li>Contact us with privacy-related questions at any time</li>
      </ul>
      <p style={{ ...muted, marginTop: 20 }}>
        You can customize every section of this page after adding it to your site.
      </p>
    </Doc>
  );
}

export function PageTemplatePreview({ templateId }: { templateId: PageTemplateId }) {
  switch (templateId) {
    case 'blank':
      return (
        <div
          style={{
            ...pageShell,
            minHeight: 520,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            color: '#94a3b8',
            fontSize: 15,
          }}
        >
          Empty page — start from scratch
        </div>
      );
    case 'blog':
      return (
        <Doc title="Blog">
          <p style={muted}>Stories, updates, and ideas from our team.</p>
          <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
            {['Launch notes', 'Design tips', 'Customer stories'].map((item) => (
              <div key={item} style={card}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{item}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  A short preview of this post. Edit titles, images, and body copy after you add the page.
                </div>
              </div>
            ))}
          </div>
        </Doc>
      );
    case 'products':
      return (
        <Doc title="Shop">
          <p style={muted}>Browse our latest products.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 24 }}>
            {['Product A', 'Product B', 'Product C'].map((item) => (
              <div key={item} style={{ ...card, padding: 0, overflow: 'hidden', background: '#fff' }}>
                <div style={{ height: 90, background: '#e2e8f0' }} />
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>$29.00</div>
                </div>
              </div>
            ))}
          </div>
        </Doc>
      );
    case 'appointments':
      return (
        <Doc title="Book an Appointment">
          <p style={p}>Choose a time that works for you and we will confirm shortly.</p>
          <div style={{ ...card, marginTop: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Available times</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['10:00', '11:30', '14:00', '16:30'].map((t) => (
                <span
                  key={t}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    background: '#fff',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Doc>
      );
    case 'about':
      return (
        <Doc title="About Us">
          <p style={p}>
            We help people build a strong online presence with clear design and practical tools.
          </p>
          <h2 style={h2}>Our story</h2>
          <p style={p}>
            What started as a small idea grew into a team focused on making websites simple to create
            and easy to love.
          </p>
          <h2 style={h2}>What we believe</h2>
          <p style={p}>Quality, clarity, and care in every project we ship.</p>
        </Doc>
      );
    case 'contact':
      return (
        <Doc title="Contact Us">
          <p style={muted}>Have a question? Send us a message.</p>
          <div style={{ ...card, marginTop: 20, background: '#fff' }}>
            {['Name', 'Email', 'Message'].map((label) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                <div
                  style={{
                    height: label === 'Message' ? 72 : 36,
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: '#f8fafc',
                  }}
                />
              </div>
            ))}
            <div
              style={{
                marginTop: 8,
                display: 'inline-block',
                background: '#0f172a',
                color: '#fff',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Send Message
            </div>
          </div>
        </Doc>
      );
    case 'services':
      return (
        <Doc title="Our Services">
          <p style={muted}>Practical solutions designed to help your business grow.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
            {['Strategy', 'Design', 'Launch'].map((item) => (
              <div key={item} style={card}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{item}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  Short description you can edit after adding this page.
                </div>
              </div>
            ))}
          </div>
        </Doc>
      );
    case 'projects':
      return (
        <Doc title="Projects">
          <p style={muted}>Selected work and case studies.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 24 }}>
            {['Brand refresh', 'Product launch', 'Website redesign', 'Campaign'].map((item) => (
              <div key={item} style={{ ...card, padding: 0, overflow: 'hidden', background: '#fff' }}>
                <div style={{ height: 100, background: '#e2e8f0' }} />
                <div style={{ padding: 14, fontWeight: 600, fontSize: 14 }}>{item}</div>
              </div>
            ))}
          </div>
        </Doc>
      );
    case 'privacy':
      return <LegalPreview title="Privacy Policy" />;
    case 'refund':
      return <LegalPreview title="Refund Policy" />;
    case 'terms':
      return <LegalPreview title="Terms and Conditions" />;
    default:
      return null;
  }
}
