import { PageElement } from '../types/page.types';

const uid = () => crypto.randomUUID();

function cloneWithNewIds(elements: PageElement[]): PageElement[] {
  return elements.map((el) => ({
    ...el,
    id: uid(),
    children: el.children ? cloneWithNewIds(el.children) : undefined,
  }));
}

const template1_Business: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Banner',
    styles: {
      desktop: { padding: '96px 64px', textAlign: 'center', backgroundColor: '#0f172a' },
      mobile: { padding: '48px 24px', textAlign: 'center', backgroundColor: '#0f172a' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Grow Your Business Online',
        styles: {
          desktop: { fontSize: '48px', fontWeight: '700', color: '#ffffff' },
          mobile: { fontSize: '28px', fontWeight: '700', color: '#ffffff' },
        },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Launch a professional website in minutes — no code required.',
        styles: {
          desktop: { fontSize: '18px', color: '#cbd5e1' },
          mobile: { fontSize: '15px', color: '#cbd5e1' },
        },
      },
      {
        id: uid(),
        type: 'button',
        content: 'Get Started',
        props: { href: '#contact' },
        styles: {
          desktop: {
            backgroundColor: '#22c55e',
            color: '#ffffff',
            padding: '14px 32px',
            borderRadius: '8px',
            display: 'inline-block',
          },
        },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'About',
    styles: { desktop: { padding: '80px 64px' }, mobile: { padding: '40px 24px' } },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'About Us',
        styles: { desktop: { fontSize: '32px', fontWeight: '600' } },
      },
      {
        id: uid(),
        type: 'text',
        content: 'We help small businesses build a strong online presence with beautiful, fast websites.',
        styles: { desktop: { fontSize: '16px', color: '#475569' } },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Contact',
    styles: {
      desktop: { padding: '80px 64px', backgroundColor: '#f8fafc' },
      mobile: { padding: '40px 24px' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Get In Touch',
        styles: { desktop: { fontSize: '32px', fontWeight: '600' } },
      },
      {
        id: uid(),
        type: 'form',
        name: 'Contact Form',
        styles: {
          desktop: { display: 'flex', flexDirection: 'column', gap: '16px', width: '480px' },
        },
        children: [
          {
            id: uid(),
            type: 'formField',
            props: { fieldType: 'text', label: 'Name', placeholder: 'Your name' },
            styles: {},
          },
          {
            id: uid(),
            type: 'formField',
            props: { fieldType: 'email', label: 'Email', placeholder: 'you@example.com' },
            styles: {},
          },
          {
            id: uid(),
            type: 'formField',
            props: { fieldType: 'textarea', label: 'Message', placeholder: 'How can we help?' },
            styles: {},
          },
          {
            id: uid(),
            type: 'button',
            content: 'Send Message',
            styles: {
              desktop: {
                backgroundColor: '#0f172a',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
              },
            },
          },
        ],
      },
    ],
  },
];

const template2_Store: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Banner',
    styles: {
      desktop: { padding: '96px 64px', textAlign: 'center', backgroundColor: '#fef3c7' },
      mobile: { padding: '48px 24px', textAlign: 'center', backgroundColor: '#fef3c7' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Shop the New Collection',
        styles: {
          desktop: { fontSize: '44px', fontWeight: '700' },
          mobile: { fontSize: '26px', fontWeight: '700' },
        },
      },
      {
        id: uid(),
        type: 'button',
        content: 'Shop Now',
        props: { href: '#products' },
        styles: {
          desktop: {
            backgroundColor: '#111827',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: '999px',
            display: 'inline-block',
          },
        },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'About',
    styles: { desktop: { padding: '80px 64px' }, mobile: { padding: '40px 24px' } },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Our Story',
        styles: { desktop: { fontSize: '32px', fontWeight: '600' } },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Handmade, sustainable, and shipped with care since day one.',
        styles: { desktop: { fontSize: '16px', color: '#475569' } },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Contact',
    styles: {
      desktop: { padding: '80px 64px', backgroundColor: '#f8fafc' },
      mobile: { padding: '40px 24px' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Questions? Reach Out',
        styles: { desktop: { fontSize: '32px', fontWeight: '600' } },
      },
      {
        id: uid(),
        type: 'form',
        name: 'Contact Form',
        styles: {
          desktop: { display: 'flex', flexDirection: 'column', gap: '16px', width: '480px' },
        },
        children: [
          {
            id: uid(),
            type: 'formField',
            props: { fieldType: 'text', label: 'Name', placeholder: 'Your name' },
            styles: {},
          },
          {
            id: uid(),
            type: 'formField',
            props: { fieldType: 'email', label: 'Email', placeholder: 'you@example.com' },
            styles: {},
          },
          {
            id: uid(),
            type: 'button',
            content: 'Send',
            styles: {
              desktop: {
                backgroundColor: '#111827',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
              },
            },
          },
        ],
      },
    ],
  },
];

const templateProducts: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Shop Hero',
    styles: {
      desktop: {
        padding: '80px 64px',
        textAlign: 'center',
        backgroundColor: '#0f172a',
      },
      mobile: { padding: '48px 24px', textAlign: 'center', backgroundColor: '#0f172a' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Shop Our Collection',
        styles: {
          desktop: { fontSize: '48px', fontWeight: '700', color: '#ffffff' },
          mobile: { fontSize: '28px', fontWeight: '700', color: '#ffffff' },
        },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Discover quality products curated for you.',
        styles: {
          desktop: { fontSize: '18px', color: '#cbd5e1', marginTop: '16px' },
          mobile: { fontSize: '15px', color: '#cbd5e1' },
        },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Products',
    styles: {
      desktop: { padding: '64px', backgroundColor: '#f8fafc' },
      mobile: { padding: '32px 24px', backgroundColor: '#f8fafc' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'All Products',
        styles: {
          desktop: { fontSize: '32px', fontWeight: '600', marginBottom: '32px' },
          mobile: { fontSize: '24px', fontWeight: '600', marginBottom: '24px' },
        },
      },
      {
        id: uid(),
        type: 'productGrid',
        name: 'Product Grid',
        styles: {
          desktop: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%' },
          tablet: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', width: '100%' },
          mobile: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px', width: '100%' },
        },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Newsletter',
    styles: {
      desktop: { padding: '64px', textAlign: 'center', backgroundColor: '#ffffff' },
      mobile: { padding: '40px 24px', textAlign: 'center' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Stay in the loop',
        styles: { desktop: { fontSize: '28px', fontWeight: '600' } },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Get updates on new arrivals and exclusive offers.',
        styles: { desktop: { fontSize: '16px', color: '#64748b', marginTop: '12px' } },
      },
    ],
  },
];

const templateCart: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Cart Hero',
    styles: {
      desktop: {
        padding: '48px 64px 24px',
        backgroundColor: '#ffffff',
      },
      mobile: { padding: '32px 20px 16px', backgroundColor: '#ffffff' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Your Cart',
        styles: {
          desktop: { fontSize: '36px', fontWeight: '700', color: '#0f172a' },
          mobile: { fontSize: '28px', fontWeight: '700', color: '#0f172a' },
        },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Review your items and complete checkout when you are ready.',
        styles: {
          desktop: { fontSize: '16px', color: '#64748b', marginTop: '8px' },
          mobile: { fontSize: '14px', color: '#64748b', marginTop: '8px' },
        },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Cart Layout',
    styles: {
      desktop: {
        padding: '24px 64px 80px',
        backgroundColor: '#f8fafc',
        width: '100%',
      },
      mobile: { padding: '16px 20px 48px', backgroundColor: '#f8fafc' },
    },
    children: [
      {
        id: uid(),
        type: 'container',
        name: 'Cart Columns',
        styles: {
          desktop: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
          },
          mobile: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
          },
        },
        children: [
          {
            id: uid(),
            type: 'container',
            name: 'Cart Items Column',
            styles: {
              desktop: {
                flex: '1 1 0%',
                minWidth: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              },
              mobile: { width: '100%' },
            },
            children: [
              {
                id: uid(),
                type: 'heading',
                content: 'Items',
                styles: {
                  desktop: { fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
                },
              },
              {
                id: uid(),
                type: 'cartList',
                name: 'Cart List',
                locked: true,
                styles: {
                  desktop: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    width: '100%',
                  },
                },
              },
            ],
          },
          {
            id: uid(),
            type: 'container',
            name: 'Order Summary Column',
            styles: {
              desktop: {
                flex: '0 0 340px',
                width: '340px',
                position: 'sticky',
                top: '96px',
                alignSelf: 'flex-start',
              },
              mobile: {
                width: '100%',
                position: 'static',
              },
            },
            children: [
              {
                id: uid(),
                type: 'cartSummary',
                name: 'Order Summary',
                locked: true,
                styles: {
                  desktop: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    width: '100%',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

const templateAbout: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'About Hero',
    styles: {
      desktop: { padding: '80px 64px', textAlign: 'center', backgroundColor: '#0f172a' },
      mobile: { padding: '48px 24px', textAlign: 'center', backgroundColor: '#0f172a' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'About Us',
        styles: {
          desktop: { fontSize: '48px', fontWeight: '700', color: '#ffffff' },
          mobile: { fontSize: '28px', fontWeight: '700', color: '#ffffff' },
        },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Learn more about our story, values, and the people behind the brand.',
        styles: {
          desktop: { fontSize: '18px', color: '#cbd5e1', marginTop: '16px' },
          mobile: { fontSize: '15px', color: '#cbd5e1', marginTop: '12px' },
        },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Our Story',
    styles: {
      desktop: { padding: '72px 64px', backgroundColor: '#ffffff' },
      mobile: { padding: '40px 24px', backgroundColor: '#ffffff' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Our Story',
        styles: { desktop: { fontSize: '32px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' } },
      },
      {
        id: uid(),
        type: 'text',
        content:
          'We started with a simple idea: make it easy for anyone to build a beautiful online presence. Today we help teams and creators share their work with the world.',
        styles: { desktop: { fontSize: '16px', color: '#475569', lineHeight: '1.7', maxWidth: '720px' } },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Values',
    styles: {
      desktop: { padding: '64px', backgroundColor: '#f8fafc' },
      mobile: { padding: '40px 24px', backgroundColor: '#f8fafc' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'What We Believe',
        styles: { desktop: { fontSize: '28px', fontWeight: '600', marginBottom: '24px' } },
      },
      {
        id: uid(),
        type: 'container',
        name: 'Values Grid',
        styles: {
          desktop: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
          mobile: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
        },
        children: [
          {
            id: uid(),
            type: 'container',
            name: 'Quality',
            styles: {
              desktop: {
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
              },
            },
            children: [
              {
                id: uid(),
                type: 'heading',
                content: 'Quality',
                styles: { desktop: { fontSize: '20px', fontWeight: '600', marginBottom: '8px' } },
              },
              {
                id: uid(),
                type: 'text',
                content: 'We put quality at the center of every project we ship.',
                styles: { desktop: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } },
              },
            ],
          },
          {
            id: uid(),
            type: 'container',
            name: 'Clarity',
            styles: {
              desktop: {
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
              },
            },
            children: [
              {
                id: uid(),
                type: 'heading',
                content: 'Clarity',
                styles: { desktop: { fontSize: '20px', fontWeight: '600', marginBottom: '8px' } },
              },
              {
                id: uid(),
                type: 'text',
                content: 'We put clarity at the center of every project we ship.',
                styles: { desktop: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } },
              },
            ],
          },
          {
            id: uid(),
            type: 'container',
            name: 'Care',
            styles: {
              desktop: {
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
              },
            },
            children: [
              {
                id: uid(),
                type: 'heading',
                content: 'Care',
                styles: { desktop: { fontSize: '20px', fontWeight: '600', marginBottom: '8px' } },
              },
              {
                id: uid(),
                type: 'text',
                content: 'We put care at the center of every project we ship.',
                styles: { desktop: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } },
              },
            ],
          },
        ],
      },
    ],
  },
];

const templateServices: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Services Hero',
    styles: {
      desktop: { padding: '80px 64px', textAlign: 'center', backgroundColor: '#111827' },
      mobile: { padding: '48px 24px', textAlign: 'center', backgroundColor: '#111827' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Our Services',
        styles: {
          desktop: { fontSize: '48px', fontWeight: '700', color: '#ffffff' },
          mobile: { fontSize: '28px', fontWeight: '700', color: '#ffffff' },
        },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Practical solutions designed to help your business grow.',
        styles: {
          desktop: { fontSize: '18px', color: '#9ca3af', marginTop: '16px' },
          mobile: { fontSize: '15px', color: '#9ca3af', marginTop: '12px' },
        },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Service List',
    styles: {
      desktop: { padding: '72px 64px', backgroundColor: '#ffffff' },
      mobile: { padding: '40px 24px', backgroundColor: '#ffffff' },
    },
    children: [
      {
        id: uid(),
        type: 'container',
        name: 'Services Grid',
        styles: {
          desktop: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' },
          tablet: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
          mobile: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
        },
        children: [
          {
            id: uid(),
            type: 'container',
            name: 'Strategy',
            styles: {
              desktop: {
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '28px',
                backgroundColor: '#f9fafb',
              },
            },
            children: [
              {
                id: uid(),
                type: 'heading',
                content: 'Strategy',
                styles: { desktop: { fontSize: '22px', fontWeight: '600', marginBottom: '10px' } },
              },
              {
                id: uid(),
                type: 'text',
                content: 'Clear plans that align your brand, offer, and audience.',
                styles: { desktop: { fontSize: '15px', color: '#6b7280', lineHeight: '1.6' } },
              },
            ],
          },
          {
            id: uid(),
            type: 'container',
            name: 'Design',
            styles: {
              desktop: {
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '28px',
                backgroundColor: '#f9fafb',
              },
            },
            children: [
              {
                id: uid(),
                type: 'heading',
                content: 'Design',
                styles: { desktop: { fontSize: '22px', fontWeight: '600', marginBottom: '10px' } },
              },
              {
                id: uid(),
                type: 'text',
                content: 'Clean layouts and visuals that feel modern and trustworthy.',
                styles: { desktop: { fontSize: '15px', color: '#6b7280', lineHeight: '1.6' } },
              },
            ],
          },
          {
            id: uid(),
            type: 'container',
            name: 'Launch',
            styles: {
              desktop: {
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '28px',
                backgroundColor: '#f9fafb',
              },
            },
            children: [
              {
                id: uid(),
                type: 'heading',
                content: 'Launch',
                styles: { desktop: { fontSize: '22px', fontWeight: '600', marginBottom: '10px' } },
              },
              {
                id: uid(),
                type: 'text',
                content: 'Ship faster with pages ready for real customers.',
                styles: { desktop: { fontSize: '15px', color: '#6b7280', lineHeight: '1.6' } },
              },
            ],
          },
        ],
      },
    ],
  },
];

const templateContact: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Contact Hero',
    styles: {
      desktop: { padding: '72px 64px', textAlign: 'center', backgroundColor: '#0f172a' },
      mobile: { padding: '40px 24px', textAlign: 'center', backgroundColor: '#0f172a' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Contact Us',
        styles: {
          desktop: { fontSize: '44px', fontWeight: '700', color: '#ffffff' },
          mobile: { fontSize: '28px', fontWeight: '700', color: '#ffffff' },
        },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Have a question or project in mind? We would love to hear from you.',
        styles: {
          desktop: { fontSize: '17px', color: '#cbd5e1', marginTop: '14px' },
          mobile: { fontSize: '15px', color: '#cbd5e1', marginTop: '10px' },
        },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Contact Form',
    styles: {
      desktop: { padding: '64px', backgroundColor: '#f8fafc' },
      mobile: { padding: '32px 20px', backgroundColor: '#f8fafc' },
    },
    children: [
      {
        id: uid(),
        type: 'container',
        name: 'Form Card',
        styles: {
          desktop: {
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '32px',
          },
          mobile: { padding: '20px', borderRadius: '12px' },
        },
        children: [
          {
            id: uid(),
            type: 'form',
            name: 'Contact Form',
            styles: { desktop: { display: 'flex', flexDirection: 'column', gap: '16px' } },
            children: [
              {
                id: uid(),
                type: 'formField',
                name: 'Name',
                props: { fieldType: 'text', label: 'Name', placeholder: 'Your name' },
                styles: { desktop: { width: '100%' } },
              },
              {
                id: uid(),
                type: 'formField',
                name: 'Email',
                props: { fieldType: 'email', label: 'Email', placeholder: 'you@example.com' },
                styles: { desktop: { width: '100%' } },
              },
              {
                id: uid(),
                type: 'formField',
                name: 'Message',
                props: { fieldType: 'textarea', label: 'Message', placeholder: 'How can we help?' },
                styles: { desktop: { width: '100%' } },
              },
              {
                id: uid(),
                type: 'button',
                content: 'Send Message',
                styles: {
                  desktop: {
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

const templateBlank: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Blank Section',
    styles: {
      desktop: {
        padding: '80px 64px',
        minHeight: '320px',
        backgroundColor: '#ffffff',
      },
      mobile: { padding: '40px 24px', minHeight: '240px' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'New Page',
        styles: { desktop: { fontSize: '36px', fontWeight: '700', color: '#0f172a' } },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Start building this page. Add elements from the left panel.',
        styles: { desktop: { fontSize: '16px', color: '#64748b', marginTop: '12px' } },
      },
    ],
  },
];

function legalPage(title: string, intro: string): PageElement[] {
  return [
    {
      id: uid(),
      type: 'section',
      name: title,
      styles: {
        desktop: { padding: '72px 64px', backgroundColor: '#ffffff', maxWidth: '900px', margin: '0 auto' },
        mobile: { padding: '40px 24px' },
      },
      children: [
        {
          id: uid(),
          type: 'heading',
          content: title,
          styles: { desktop: { fontSize: '40px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' } },
        },
        {
          id: uid(),
          type: 'text',
          content: intro,
          styles: { desktop: { fontSize: '16px', color: '#334155', lineHeight: '1.7', marginBottom: '24px' } },
        },
        {
          id: uid(),
          type: 'heading',
          content: 'Personal information we collect:',
          styles: { desktop: { fontSize: '20px', fontWeight: '700', marginBottom: '10px' } },
        },
        {
          id: uid(),
          type: 'text',
          content:
            'We may collect details you provide directly, such as your name, email address, and messages sent through forms on this site.',
          styles: { desktop: { fontSize: '15px', color: '#475569', lineHeight: '1.7', marginBottom: '20px' } },
        },
        {
          id: uid(),
          type: 'heading',
          content: 'Why do we process your data?',
          styles: { desktop: { fontSize: '20px', fontWeight: '700', marginBottom: '10px' } },
        },
        {
          id: uid(),
          type: 'text',
          content:
            'We use this information to respond to inquiries, improve our services, and operate the website securely.',
          styles: { desktop: { fontSize: '15px', color: '#475569', lineHeight: '1.7', marginBottom: '20px' } },
        },
        {
          id: uid(),
          type: 'heading',
          content: 'Your rights:',
          styles: { desktop: { fontSize: '20px', fontWeight: '700', marginBottom: '10px' } },
        },
        {
          id: uid(),
          type: 'text',
          content:
            'You may request access to your data, ask us to correct or delete it, and contact us with related questions at any time.',
          styles: { desktop: { fontSize: '15px', color: '#475569', lineHeight: '1.7' } },
        },
      ],
    },
  ];
}

const templateBlog: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Blog Hero',
    styles: {
      desktop: { padding: '72px 64px', backgroundColor: '#ffffff' },
      mobile: { padding: '40px 24px' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Blog',
        styles: { desktop: { fontSize: '42px', fontWeight: '700', color: '#0f172a' } },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Stories, updates, and ideas from our team.',
        styles: { desktop: { fontSize: '17px', color: '#64748b', marginTop: '12px' } },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Posts',
    styles: {
      desktop: { padding: '24px 64px 80px', backgroundColor: '#f8fafc' },
      mobile: { padding: '16px 24px 48px' },
    },
    children: [
      {
        id: uid(),
        type: 'container',
        name: 'Post List',
        styles: { desktop: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' } },
        children: ['Launch notes', 'Design tips', 'Customer stories'].map((title) => ({
          id: uid(),
          type: 'container' as const,
          name: title,
          styles: {
            desktop: {
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
            },
          },
          children: [
            {
              id: uid(),
              type: 'heading' as const,
              content: title,
              styles: { desktop: { fontSize: '22px', fontWeight: '600', marginBottom: '8px' } },
            },
            {
              id: uid(),
              type: 'text' as const,
              content: 'A short preview of this post. Edit titles, images, and body copy anytime.',
              styles: { desktop: { fontSize: '15px', color: '#64748b', lineHeight: '1.6' } },
            },
          ],
        })),
      },
    ],
  },
];

const templateAppointments: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Appointments',
    styles: {
      desktop: { padding: '72px 64px', backgroundColor: '#ffffff' },
      mobile: { padding: '40px 24px' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Book an Appointment',
        styles: { desktop: { fontSize: '40px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' } },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Choose a time that works for you and we will confirm shortly.',
        styles: { desktop: { fontSize: '16px', color: '#64748b', marginBottom: '28px' } },
      },
      {
        id: uid(),
        type: 'container',
        name: 'Booking Card',
        styles: {
          desktop: {
            maxWidth: '480px',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            backgroundColor: '#f8fafc',
          },
        },
        children: [
          {
            id: uid(),
            type: 'heading',
            content: 'Available times',
            styles: { desktop: { fontSize: '18px', fontWeight: '600', marginBottom: '16px' } },
          },
          {
            id: uid(),
            type: 'text',
            content: '10:00 · 11:30 · 14:00 · 16:30',
            styles: { desktop: { fontSize: '15px', color: '#475569' } },
          },
          {
            id: uid(),
            type: 'button',
            content: 'Request booking',
            styles: {
              desktop: {
                marginTop: '20px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: '8px',
                fontWeight: '600',
              },
            },
          },
        ],
      },
    ],
  },
];

const templateProjects: PageElement[] = [
  {
    id: uid(),
    type: 'section',
    name: 'Projects Hero',
    styles: {
      desktop: { padding: '72px 64px', backgroundColor: '#ffffff' },
      mobile: { padding: '40px 24px' },
    },
    children: [
      {
        id: uid(),
        type: 'heading',
        content: 'Projects',
        styles: { desktop: { fontSize: '42px', fontWeight: '700', color: '#0f172a' } },
      },
      {
        id: uid(),
        type: 'text',
        content: 'Selected work and case studies.',
        styles: { desktop: { fontSize: '17px', color: '#64748b', marginTop: '12px' } },
      },
    ],
  },
  {
    id: uid(),
    type: 'section',
    name: 'Project Grid',
    styles: {
      desktop: { padding: '24px 64px 80px', backgroundColor: '#f8fafc' },
      mobile: { padding: '16px 24px 48px' },
    },
    children: [
      {
        id: uid(),
        type: 'container',
        name: 'Grid',
        styles: {
          desktop: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' },
          mobile: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
        },
        children: ['Brand refresh', 'Product launch', 'Website redesign', 'Campaign'].map((title) => ({
          id: uid(),
          type: 'container' as const,
          name: title,
          styles: {
            desktop: {
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
            },
          },
          children: [
            {
              id: uid(),
              type: 'image' as const,
              props: { src: 'https://placehold.co/800x480', alt: title },
              styles: { desktop: { width: '100%', height: '200px', objectFit: 'cover', display: 'block' } },
            },
            {
              id: uid(),
              type: 'heading' as const,
              content: title,
              styles: { desktop: { fontSize: '18px', fontWeight: '600', padding: '16px' } },
            },
          ],
        })),
      },
    ],
  },
];

const templatePrivacy = legalPage(
  'Privacy Policy',
  'This privacy policy describes how we handle information and your rights when you use our website and services.',
);
const templateRefund = legalPage(
  'Refund Policy',
  'This refund policy explains when refunds are available and how to request one.',
);
const templateTerms = legalPage(
  'Terms and Conditions',
  'These terms and conditions outline the rules and regulations for using our website.',
);

export const STARTER_TEMPLATES: Record<string, PageElement[]> = {
  business: template1_Business,
  store: template2_Store,
  products: templateProducts,
  cart: templateCart,
  about: templateAbout,
  services: templateServices,
  contact: templateContact,
  blank: templateBlank,
  blog: templateBlog,
  appointments: templateAppointments,
  projects: templateProjects,
  privacy: templatePrivacy,
  refund: templateRefund,
  terms: templateTerms,
};

export function getTemplateSections(templateId: string): PageElement[] {
  const template = STARTER_TEMPLATES[templateId];
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  return cloneWithNewIds(template);
}
