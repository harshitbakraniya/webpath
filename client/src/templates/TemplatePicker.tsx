import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { STARTER_TEMPLATES } from '../templates/starterTemplates';
import { createPage, createSite } from '../api/pages.api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function TemplatePicker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (templateId: string, templateName: string) => {
    setLoading(templateId);
    try {
      const site = await createSite(`${templateName} Site`);
      const page = await createPage(site.id, {
        templateId,
        slug: 'home',
        title: 'Home',
      });
      toast.success('Template loaded!');
      navigate(`/editor/${site.id}/${page.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create site');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Choose a template</h1>
        <p className="text-slate-600">Pick a starter layout for your website or store.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {STARTER_TEMPLATES.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <div
              className="h-40"
              style={{
                background:
                  template.id === 'business'
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              }}
            />
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>Banner, About, and Contact sections included.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={loading === template.id}
                onClick={() => handleSelect(template.id, template.name)}
              >
                {loading === template.id ? 'Creating...' : 'Use this template'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
