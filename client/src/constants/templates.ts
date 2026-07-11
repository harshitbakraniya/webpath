export type TemplateKey = 'basic' | 'modern' | 'minimal';

export const TEMPLATES: Array<{
  key: TemplateKey;
  name: string;
  description: string;
}> = [
  { key: 'basic', name: 'Basic', description: 'Clean and simple starter template.' },
  { key: 'modern', name: 'Modern', description: 'Bold layout with modern typography.' },
  { key: 'minimal', name: 'Minimal', description: 'A lightweight, minimal design.' },
];

