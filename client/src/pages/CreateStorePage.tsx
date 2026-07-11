import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { TEMPLATES, type TemplateKey } from '../constants/templates';
import { createStore } from '../api/stores';
import { cn } from '../lib/utils';

const schema = z.object({
  name: z.string().min(2),
  templateKey: z.enum(['basic', 'modern', 'minimal']),
});

type FormValues = z.infer<typeof schema>;

export function CreateStorePage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('basic');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { templateKey: 'basic' },
  });

  useEffect(() => {
    setValue('templateKey', selectedTemplate);
  }, [selectedTemplate, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createStore(values);
      toast.success('Store created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create store');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-[var(--e-border)] webpath-surface-glass shadow-lg">
        <CardHeader>
          <CardTitle>Create your store</CardTitle>
          <CardDescription>Choose a template and set your store name to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Store name</Label>
              <Input id="name" placeholder="My Awesome Store" {...register('name')} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-3">
              <Label>Select template</Label>
              <div className="grid gap-3 md:grid-cols-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setSelectedTemplate(template.key)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-colors',
                      selectedTemplate === template.key
                        ? 'border-[var(--palette-reversed-grey)] bg-[var(--palette-reversed-grey)] text-[var(--palette-bright-grey)]'
                        : 'border-[var(--e-border)] bg-[var(--e-surface)] hover:border-[var(--palette-timber-wolf)]',
                    )}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div
                      className={cn(
                        'mt-1 text-sm',
                        selectedTemplate === template.key ? 'text-[var(--palette-shy-blunt)]' : 'text-[var(--e-text-muted)]',
                      )}
                    >
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating store...' : 'Create store'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
