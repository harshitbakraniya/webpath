import { PageElement } from '../types/page';

const uid = () => crypto.randomUUID();

export const template1_Business: PageElement[] = [
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

export const template2_Store: PageElement[] = [
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

export const STARTER_TEMPLATES = [
  {
    id: 'business',
    name: 'Business Starter',
    thumbnail: '/templates/business.png',
    sections: template1_Business,
  },
  {
    id: 'store',
    name: 'Store Starter',
    thumbnail: '/templates/store.png',
    sections: template2_Store,
  },
] as const;

export type StarterTemplateId = (typeof STARTER_TEMPLATES)[number]['id'];

export function cloneTemplateSections(sections: PageElement[]): PageElement[] {
  return JSON.parse(JSON.stringify(sections)) as PageElement[];
}
