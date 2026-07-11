import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSites } from '../api/pages.api';
import type { SiteDocument } from '../types/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function DashboardPage() {
  const [sites, setSites] = useState<SiteDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listSites();
        setSites(data);
      } catch {
        setSites([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-slate-600">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Overview of your websites and activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sites</CardTitle>
            <CardDescription>Your websites</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{sites.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Published</CardTitle>
            <CardDescription>Live on the web</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{sites.filter((s) => s.status === 'published').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Drafts</CardTitle>
            <CardDescription>Work in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{sites.filter((s) => s.status === 'draft').length}</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild variant="outline">
        <Link to="/dashboard/websites">View all websites</Link>
      </Button>
    </div>
  );
}
