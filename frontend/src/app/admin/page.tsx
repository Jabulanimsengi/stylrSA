// frontend/src/app/admin/page.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminPage.module.css';
import { Salon, Service, ApprovalStatus, Review, Product } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// FIX: Update PendingSalon to include the new fields from the backend response.
type PendingSalon = Pick<Salon, 'id'|'name'|'approvalStatus'|'createdAt'> & { 
  owner: { id: string; email: string; firstName: string; lastName: string; }
  visibilityWeight?: number;
  maxListings?: number;
  featuredUntil?: string | null;
  planCode?: string | null;
};
type PendingService = Service & { salon: { name: string } };
type PendingReview = Review & { author: { firstName: string }, salon: { name: string } };
type PendingProduct = Product & { seller: { firstName: string, lastName: string } };

export default function AdminPage() {
  const { data: session } = useSession();
  const { authStatus, user } = useAuth();
  const [pendingSalons, setPendingSalons] = useState<PendingSalon[]>([]);
  const [allSalons, setAllSalons] = useState<PendingSalon[]>([]);
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [deletedSalons, setDeletedSalons] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [view, setView] = useState<'salons' | 'services' | 'reviews' | 'all-salons' | 'products' | 'deleted-salons' | 'audit'>('salons');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // Inline edit state for salon visibility features
  const [editingSalonId, setEditingSalonId] = useState<string | null>(null);
  const [draftPlan, setDraftPlan] = useState<string>('STARTER');
  const [draftWeight, setDraftWeight] = useState<string>('');
  const [draftMax, setDraftMax] = useState<string>('');
  const [draftFeatured, setDraftFeatured] = useState<string>('');
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingSalon, setDeletingSalon] = useState<PendingSalon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Simple filters/saved views for All Salons
  const [search, setSearch] = useState('');
  const [savedViews, setSavedViews] = useState<{name:string; query:string}[]>([]);
  const filteredAllSalons = useMemo(()=> allSalons.filter(s => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.owner.email.toLowerCase().includes(q) ||
      (s.planCode??'').toLowerCase().includes(q)
    );
  }), [allSalons, search]);
  // Bulk selection state
  const [selSalons, setSelSalons] = useState<Set<string>>(new Set());
  const [selServices, setSelServices] = useState<Set<string>>(new Set());
  const [selReviews, setSelReviews] = useState<Set<string>>(new Set());
  const [selProducts, setSelProducts] = useState<Set<string>>(new Set());

  const clearSelections = () => { setSelSalons(new Set()); setSelServices(new Set()); setSelReviews(new Set()); setSelProducts(new Set()); };

  const bulkUpdate = async (type: 'salon'|'service'|'review'|'product', ids: string[], status: ApprovalStatus) => {
    if (ids.length === 0) return;
    await Promise.all(ids.map(id => fetch(
      type === 'salon' ? `/api/admin/salons/${id}/status` :
      type === 'service' ? `/api/admin/services/${id}/status` :
      type === 'review' ? `/api/admin/reviews/${id}/status` : `/api/admin/products/${id}/status`,
      { method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ approvalStatus: status }) }
    )));
    if (type === 'salon') setPendingSalons(prev => prev.filter(x=> !ids.includes(x.id)));
    if (type === 'service') setPendingServices(prev => prev.filter(x=> !ids.includes(x.id)));
    if (type === 'review') setPendingReviews(prev => prev.filter(x=> !ids.includes(x.id)));
    if (type === 'product') setPendingProducts(prev => prev.filter(x=> !ids.includes(x.id)));
    clearSelections();
    toast.success(`Updated ${ids.length} ${type}${ids.length>1?'s':''}`);
  };

  useEffect(() => {
    if (authStatus === 'loading') {
      return; 
    }
    if (authStatus !== 'authenticated' || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      // FIX: Use relative URLs instead of hardcoding localhost.
      const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
      const requestOptions = { credentials: 'include' as const, headers: authHeaders } as const;
      
      try {
        const ts = Date.now();
        const noStore: RequestInit = { ...requestOptions, cache: 'no-store' } as any;
        const [pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, productsRes, deletedSalonsRes, metricsRes] = await Promise.all([
          fetch(`/api/admin/salons/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/salons/all?ts=${ts}`, noStore),
          fetch(`/api/admin/services/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/reviews/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/products/pending?ts=${ts}`, noStore),
          fetch(`/api/admin/salons/deleted?ts=${ts}`, noStore),
          fetch(`/api/admin/metrics?ts=${ts}`, noStore),
        ]);

        if ([pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, productsRes, deletedSalonsRes, metricsRes].some(res => res.status === 401)) {
            router.push('/login');
            return;
        }
        
        // This is where the original error happened. With the backend fix, it should now work.
        setPendingSalons(await pendingSalonsRes.json());
        setAllSalons(await allSalonsRes.json());
        setPendingServices(await servicesRes.json());
        setPendingReviews(await reviewsRes.json());
        setPendingProducts(await productsRes.json());
        setDeletedSalons(await deletedSalonsRes.json());
        setMetrics(await metricsRes.json());

      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    // load saved views
    try { const raw = localStorage.getItem('admin-saved-views'); if (raw) setSavedViews(JSON.parse(raw)); } catch {}

    // Realtime updates
    let socket: Socket | null = null;
    try {
      socket = io('/', { transports: ['websocket'], withCredentials: true });
      socket.on('salon:deleted', async () => {
        try {
          const [allRes, delRes] = await Promise.all([
            fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
            fetch(`/api/admin/salons/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
          ]);
          if (allRes.ok) setAllSalons(await allRes.json());
          if (delRes.ok) setDeletedSalons(await delRes.json());
        } catch {}
      });
      socket.on('visibility:updated', async () => {
        try {
          const allRes = await fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders });
          if (allRes.ok) setAllSalons(await allRes.json());
        } catch {}
      });
    } catch {}

    return () => { try { socket?.disconnect(); } catch {} };
  }, [authStatus, user, router, session?.backendJwt]);

  const handleUpdateStatus = async (type: 'salon' | 'service' | 'review' | 'product', id: string, status: ApprovalStatus) => {
    if (authStatus !== 'authenticated') {
        router.push('/login');
        return;
    }

    let url = '';
    switch (type) {
      case 'salon': url = `/api/admin/salons/${id}/status`; break;
      case 'service': url = `/api/admin/services/${id}/status`; break;
      case 'review': url = `/api/admin/reviews/${id}/status`; break;
      case 'product': url = `/api/admin/products/${id}/status`; break;
    }

    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      credentials: 'include',
      body: JSON.stringify({ approvalStatus: status }),
    });

    if (type === 'salon') setPendingSalons(pendingSalons.filter(s => s.id !== id));
    if (type === 'service') setPendingServices(pendingServices.filter(s => s.id !== id));
    if (type === 'review') setPendingReviews(pendingReviews.filter(r => r.id !== id));
    if (type === 'product') setPendingProducts(pendingProducts.filter(p => p.id !== id));
  };

  const openDeleteModal = (salon: PendingSalon) => {
    setDeletingSalon(salon);
    setDeleteReason('');
    setShowDeleteModal(true);
    setIsDeleting(false);
  };

  const confirmDeleteSalon = async () => {
    if (!deletingSalon) return;
    if (!deleteReason.trim()) {
      toast.error('Please provide a reason for deletion.');
      return;
    }
    if (isDeleting) return;
    setIsDeleting(true);
    const id = deletingSalon.id;
    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
    const res = await fetch(`/api/admin/salons/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      credentials: 'include',
      body: JSON.stringify({ reason: deleteReason.trim() }),
    });
    if (res.ok || res.status === 404) {
      setAllSalons(prev => prev.filter(s => s.id !== id));
      setShowDeleteModal(false);
      setDeletingSalon(null);
      toast.success(res.status === 404 ? 'Profile was already removed' : 'Profile deleted');
      try {
        const r = await fetch(`/api/admin/salons/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders });
        if (r.ok) setDeletedSalons(await r.json());
      } catch {}
    } else {
      const msg = await res.text().catch(()=> '');
      toast.error(`Failed to delete (${res.status}). ${msg}`);
    }
    setIsDeleting(false);
  };

  const restoreDeletedSalon = async (archiveId: string) => {
    const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
    const res = await fetch(`/api/admin/salons/deleted/${archiveId}/restore`, {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders,
    });
    if (res.ok) {
      toast.success('Profile restored');
      try {
        const [allRes, delRes] = await Promise.all([
          fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
          fetch(`/api/admin/salons/deleted?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders }),
        ]);
        if (allRes.ok) setAllSalons(await allRes.json());
        if (delRes.ok) setDeletedSalons(await delRes.json());
      } catch {}
    } else {
      const msg = await res.text().catch(()=> '');
      toast.error(`Failed to restore (${res.status}). ${msg}`);
    }
  };

  if (isLoading || authStatus === 'loading') return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      {metrics && (
        <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.75rem'}}>
          <span>Pending: Salons {metrics.salonsPending}, Services {metrics.servicesPending}, Reviews {metrics.reviewsPending}, Products {metrics.productsPending}</span>
          <span style={{opacity:0.8}}>Oldest: {['salon','service','review','product'].map(k=> metrics.oldest?.[k] ? `${k}: ${new Date(metrics.oldest[k]).toLocaleDateString()}` : null).filter(Boolean).join(' | ')}</span>
        </div>
      )}
      <div className={styles.tabs}>
        <button
          onClick={() => setView('salons')}
          className={`${styles.tabButton} ${view === 'salons' ? styles.activeTab : ''}`}
        >
          Pending Salons ({pendingSalons.length})
        </button>
        <button
          onClick={() => setView('all-salons')}
          className={`${styles.tabButton} ${view === 'all-salons' ? styles.activeTab : ''}`}
        >
          All Salons ({allSalons.length})
        </button>
        <button
          onClick={() => setView('services')}
          className={`${styles.tabButton} ${view === 'services' ? styles.activeTab : ''}`}
        >
          Pending Services ({pendingServices.length})
        </button>
        <button
          onClick={() => setView('reviews')}
          className={`${styles.tabButton} ${view === 'reviews' ? styles.activeTab : ''}`}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
        <button
          onClick={() => setView('products')}
          className={`${styles.tabButton} ${view === 'products' ? styles.activeTab : ''}`}
        >
          Pending Products ({pendingProducts.length})
        </button>
        <button
          onClick={() => setView('deleted-salons')}
          className={`${styles.tabButton} ${view === 'deleted-salons' ? styles.activeTab : ''}`}
        >
          Deleted Profiles ({deletedSalons.length})
        </button>
        <button
          onClick={async ()=>{
            setView('audit');
            try { const r = await fetch(`/api/admin/audit?ts=${Date.now()}`, { credentials:'include', cache:'no-store' as any }); if (r.ok) setAuditLogs(await r.json()); } catch {}
          }}
          className={`${styles.tabButton} ${view === 'audit' ? styles.activeTab : ''}`}
        >
          Activity Log
        </button>
      </div>

      <div className={styles.list}>
        {view === 'salons' && (
          <>
          {pendingSalons.length > 0 && (
            <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem'}}>
              <input type="checkbox" checked={selSalons.size===pendingSalons.length} onChange={e=> setSelSalons(e.target.checked? new Set(pendingSalons.map(s=>s.id)) : new Set())} />
              <span>Select all</span>
              <button className={styles.approveButton} disabled={selSalons.size===0} onClick={()=> bulkUpdate('salon', Array.from(selSalons), 'APPROVED')}>Approve selected</button>
              <button className={styles.rejectButton} disabled={selSalons.size===0} onClick={()=> bulkUpdate('salon', Array.from(selSalons), 'REJECTED')}>Reject selected</button>
            </div>
          )}
          {pendingSalons.length > 0 ? pendingSalons.map(salon => (
            <div key={salon.id} className={styles.listItem}>
              <div className={styles.info}>
                <input type="checkbox" checked={selSalons.has(salon.id)} onChange={e=> { const ns = new Set(selSalons); if(e.target.checked) ns.add(salon.id); else ns.delete(salon.id); setSelSalons(ns); }} />
                <h4>{salon.name}</h4>
                {/* FIX: Display the full name and email of the owner. */}
                <p>Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email})</p>
              </div>
              <div className={styles.actions}>
                <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
                <button onClick={() => handleUpdateStatus('salon', salon.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                <button onClick={() => handleUpdateStatus('salon', salon.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
              </div>
            </div>
          )) : <p>No pending salons.</p>}
          </>
        )}
        
        {view === 'all-salons' && (
          <>
          <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem', flexWrap:'wrap'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name/email/plan" style={{padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8, minWidth:260}} />
            <button className={styles.approveButton} onClick={()=>{
              const name = window.prompt('Save current search as view name:');
              if (!name) return;
              const next = [...savedViews, { name, query: search }];
              setSavedViews(next);
              try { localStorage.setItem('admin-saved-views', JSON.stringify(next)); } catch {}
            }}>Save view</button>
            {savedViews.length>0 && (
              <select onChange={e=> setSearch(savedViews.find(v=>v.name===e.target.value)?.query ?? '')} defaultValue="">
                <option value="" disabled>Load view…</option>
                {savedViews.map(v=> <option key={v.name} value={v.name}>{v.name}</option>)}
              </select>
            )}
          </div>
          {filteredAllSalons.length > 0 ? filteredAllSalons.map(salon => (
            <div key={salon.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{salon.name}</h4>
                <p>Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email}) | Status: {salon.approvalStatus}</p>
                <div style={{display:'grid', gap: '0.5rem', marginTop: '0.5rem'}}>
                  {editingSalonId !== salon.id ? (
                    <div style={{display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap'}}>
                      <span><strong>Package:</strong> {salon.planCode ?? '—'}</span>
                      <span><strong>Visibility:</strong> {salon.visibilityWeight ?? '—'}</span>
                      <span><strong>Max listings:</strong> {salon.maxListings ?? '—'}</span>
                      <span><strong>Featured until:</strong> {salon.featuredUntil ? new Date(salon.featuredUntil).toLocaleString() : '—'}</span>
                      <button
                        className={styles.approveButton}
                        onClick={() => {
                          setEditingSalonId(salon.id);
                          setDraftPlan(salon.planCode ?? 'STARTER');
                          setDraftWeight(String(salon.visibilityWeight ?? ''));
                          setDraftMax(String(salon.maxListings ?? ''));
                          setDraftFeatured(salon.featuredUntil ? new Date(salon.featuredUntil).toISOString().slice(0,16) : '');
                        }}
                      >Edit</button>
                    </div>
                  ) : (
                    <div style={{display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap'}}>
                      <label>Package</label>
                      <select value={draftPlan} onChange={e=>setDraftPlan(e.target.value)} style={{padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8}}>
                        <option value="STARTER">Starter</option>
                        <option value="ESSENTIAL">Essential</option>
                        <option value="GROWTH">Growth</option>
                        <option value="PRO">Pro</option>
                        <option value="ELITE">Elite</option>
                      </select>
                      <label>Weight</label>
                      <input value={draftWeight} onChange={e=>setDraftWeight(e.target.value)} type="number" min={1} placeholder="visibility" style={{width:90, padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8}} />
                      <label>Max listings</label>
                      <input value={draftMax} onChange={e=>setDraftMax(e.target.value)} type="number" min={1} placeholder="max" style={{width:90, padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8}} />
                      <label>Featured until</label>
                      <input value={draftFeatured} onChange={e=>setDraftFeatured(e.target.value)} type="datetime-local" style={{padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8}} />
                      <button
                        className={styles.approveButton}
                        onClick={async ()=>{
                          const visibilityWeight = Number(draftWeight);
                          const maxListings = Number(draftMax);
                          const featuredUntil = draftFeatured;
                          const body: any = {};
                          const allowedPlans = ['STARTER','ESSENTIAL','GROWTH','PRO','ELITE'];
                          if (allowedPlans.includes(draftPlan)) body.planCode = draftPlan;
                          if (!Number.isNaN(visibilityWeight) && draftWeight !== '') body.visibilityWeight = visibilityWeight;
                          if (!Number.isNaN(maxListings) && draftMax !== '') body.maxListings = maxListings;
                          // Always send featuredUntil to allow clearing on server (null when empty)
                          body.featuredUntil = featuredUntil ? featuredUntil : null;
                          const authHeaders: Record<string, string> = session?.backendJwt ? { Authorization: `Bearer ${session.backendJwt}` } : {};
                          const r = await fetch(`/api/admin/salons/${salon.id}/plan`, { method:'PATCH', headers:{'Content-Type':'application/json', ...authHeaders}, credentials:'include', body: JSON.stringify(body)});
                          if (r.ok) {
                            const updated = await r.json();
                            toast.success('Visibility updated');
                            // Trust server response to avoid client drift
                            setAllSalons(prev => prev.map(s => s.id === salon.id ? {
                              ...s,
                              planCode: updated.planCode ?? s.planCode,
                              visibilityWeight: updated.visibilityWeight ?? s.visibilityWeight,
                              maxListings: updated.maxListings ?? s.maxListings,
                              featuredUntil: updated.featuredUntil ?? null,
                            } : s));
                            setEditingSalonId(null);
                            // Re-fetch from server to ensure persistence and avoid stale UI
                            try {
                              const allRes = await fetch(`/api/admin/salons/all?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' as any, headers: authHeaders });
                              if (allRes.ok) {
                                const fresh = await allRes.json();
                                setAllSalons(fresh);
                              }
                            } catch {}
                          } else {
                            const errText = await r.text().catch(()=> '');
                            toast.error(`Failed to update (${r.status}). ${errText}`);
                          }
                        }}
                      >Save</button>
                      <button className={styles.rejectButton} onClick={()=> setEditingSalonId(null)}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
                <button
                  className={styles.rejectButton}
                  onClick={() => openDeleteModal(salon)}
                  title="Delete provider profile"
                >Delete Profile</button>
              </div>
            </div>
          )) : <p>No salons found.</p>}
          </>
        )}

        {view === 'deleted-salons' && (
          deletedSalons.length > 0 ? deletedSalons.map((row:any) => (
            <div key={row.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{row.salon?.name ?? 'Unknown name'}</h4>
                <p>Deleted at: {row.deletedAt ? new Date(row.deletedAt).toLocaleString() : ''} {row.reason ? `| Reason: ${row.reason}` : ''}</p>
              </div>
              <div className={styles.actions}>
                <button className={styles.approveButton} onClick={() => restoreDeletedSalon(row.id)}>Restore</button>
              </div>
            </div>
          )) : <p>No deleted profiles.</p>
        )}

        {view === 'services' && (
          <>
          {pendingServices.length>0 && (
            <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem'}}>
              <input type="checkbox" checked={selServices.size===pendingServices.length} onChange={e=> setSelServices(e.target.checked? new Set(pendingServices.map(s=>s.id)) : new Set())} />
              <span>Select all</span>
              <button className={styles.approveButton} disabled={selServices.size===0} onClick={()=> bulkUpdate('service', Array.from(selServices), 'APPROVED')}>Approve selected</button>
              <button className={styles.rejectButton} disabled={selServices.size===0} onClick={()=> bulkUpdate('service', Array.from(selServices), 'REJECTED')}>Reject selected</button>
            </div>
          )}
          {pendingServices.length > 0 ? pendingServices.map(service => (
            <div key={service.id} className={styles.listItem}>
              <div className={styles.info}>
                <input type="checkbox" checked={selServices.has(service.id)} onChange={e=> { const ns = new Set(selServices); if(e.target.checked) ns.add(service.id); else ns.delete(service.id); setSelServices(ns); }} />
                <h4>{service.title}</h4>
                <p>Salon: {service.salon.name}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleUpdateStatus('service', service.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                <button onClick={() => handleUpdateStatus('service', service.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
              </div>
            </div>
          )) : <p>No pending services.</p>}
          </>
        )}

        {view === 'reviews' && (
          <>
          {pendingReviews.length>0 && (
            <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem'}}>
              <input type="checkbox" checked={selReviews.size===pendingReviews.length} onChange={e=> setSelReviews(e.target.checked? new Set(pendingReviews.map(s=>s.id)) : new Set())} />
              <span>Select all</span>
              <button className={styles.approveButton} disabled={selReviews.size===0} onClick={()=> bulkUpdate('review', Array.from(selReviews), 'APPROVED')}>Approve selected</button>
              <button className={styles.rejectButton} disabled={selReviews.size===0} onClick={()=> bulkUpdate('review', Array.from(selReviews), 'REJECTED')}>Reject selected</button>
            </div>
          )}
          {pendingReviews.length > 0 ? pendingReviews.map(review => (
            <div key={review.id} className={styles.listItem}>
              <div className={styles.info}>
                <input type="checkbox" checked={selReviews.has(review.id)} onChange={e=> { const ns = new Set(selReviews); if(e.target.checked) ns.add(review.id); else ns.delete(review.id); setSelReviews(ns); }} />
                <h4>"{review.comment}" ({review.rating} ★)</h4>
                <p>By: {review.author.firstName} | For Salon: {review.salon.name}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleUpdateStatus('review', review.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                <button onClick={() => handleUpdateStatus('review', review.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
              </div>
            </div>
          )) : <p>No pending reviews.</p>}
          </>
        )}
        
        {view === 'products' && (
          <>
          {pendingProducts.length>0 && (
            <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem'}}>
              <input type="checkbox" checked={selProducts.size===pendingProducts.length} onChange={e=> setSelProducts(e.target.checked? new Set(pendingProducts.map(s=>s.id)) : new Set())} />
              <span>Select all</span>
              <button className={styles.approveButton} disabled={selProducts.size===0} onClick={()=> bulkUpdate('product', Array.from(selProducts), 'APPROVED')}>Approve selected</button>
              <button className={styles.rejectButton} disabled={selProducts.size===0} onClick={()=> bulkUpdate('product', Array.from(selProducts), 'REJECTED')}>Reject selected</button>
            </div>
          )}
          {pendingProducts.length > 0 ? pendingProducts.map(product => (
            <div key={product.id} className={styles.listItem}>
              <div className={styles.info}>
                <input type="checkbox" checked={selProducts.has(product.id)} onChange={e=> { const ns = new Set(selProducts); if(e.target.checked) ns.add(product.id); else ns.delete(product.id); setSelProducts(ns); }} />
                <h4>{product.name}</h4>
                <p>Seller: {product.seller.firstName} {product.seller.lastName}</p>
                <div style={{display:'flex', gap: '0.5rem', alignItems:'center', flexWrap:'wrap', marginTop:'0.5rem'}}>
                  <label>Seller Plan</label>
                  <select id={`splan-${product.id}`} defaultValue="STARTER" style={{padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8}}>
                    <option value="STARTER">Starter</option>
                    <option value="ESSENTIAL">Essential</option>
                    <option value="GROWTH">Growth</option>
                    <option value="PRO">Pro</option>
                    <option value="ELITE">Elite</option>
                  </select>
                  <label>Weight</label>
                  <input id={`sweight-${product.id}`} type="number" min={1} placeholder="visibility" style={{width:90, padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8}} />
                  <label>Max listings</label>
                  <input id={`smax-${product.id}`} type="number" min={1} placeholder="max" style={{width:90, padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8}} />
                  <label>Featured until</label>
                  <input id={`sfeat-${product.id}`} type="datetime-local" style={{padding:'0.35rem', border:'1px solid var(--color-border)', borderRadius:8}} />
                  <button
                    onClick={async ()=>{
                      const planCode = (document.getElementById(`splan-${product.id}`) as HTMLSelectElement)?.value;
                      const visibilityWeight = Number((document.getElementById(`sweight-${product.id}`) as HTMLInputElement)?.value || NaN);
                      const maxListings = Number((document.getElementById(`smax-${product.id}`) as HTMLInputElement)?.value || NaN);
                      const featuredUntil = (document.getElementById(`sfeat-${product.id}`) as HTMLInputElement)?.value;
                      const body: any = { planCode };
                      if (!Number.isNaN(visibilityWeight)) body.visibilityWeight = visibilityWeight;
                      if (!Number.isNaN(maxListings)) body.maxListings = maxListings;
                      if (featuredUntil) body.featuredUntil = featuredUntil;
                      const r = await fetch(`/api/admin/sellers/${product.seller.id}/plan`, { method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify(body)});
                      if (r.ok) toast.success('Seller plan updated'); else toast.error('Failed to update plan');
                    }}
                    className={styles.approveButton}
                  >Save</button>
                </div>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleUpdateStatus('product', product.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                <button onClick={() => handleUpdateStatus('product', product.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
              </div>
            </div>
          )) : <p>No pending products.</p>}
          </>
        )}

        {view === 'audit' && (
          auditLogs.length > 0 ? auditLogs.map((log:any)=> (
            <div key={log.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{log.action}</h4>
                <p>Target: {log.targetType} {log.targetId}</p>
                <p>{log.reason ? `Reason: ${log.reason}` : ''}</p>
              </div>
              <div className={styles.actions}>
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )) : <p>No recent admin activity.</p>
        )}
      </div>
      {showDeleteModal && deletingSalon && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'grid', placeItems:'center', zIndex:1000}}>
          <div style={{background:'#fff', color:'#000', padding:'1rem', borderRadius:8, maxWidth:560, width:'96%', boxShadow:'0 10px 30px rgba(0,0,0,0.25)'}}>
            <h3 style={{marginTop:0}}>Delete Provider Profile</h3>
            <p style={{color:'#a00', fontWeight:600}}>Caution: This will remove the provider profile and all their listings from the platform. You can later restore it from Deleted Profiles.</p>
            <p><strong>Provider:</strong> {deletingSalon.name}</p>
            <label style={{display:'block', margin:'0.5rem 0'}}>Reason (required)</label>
            <textarea value={deleteReason} onChange={e=>setDeleteReason(e.target.value)} rows={4} style={{width:'100%', padding:'0.5rem', border:'1px solid var(--color-border)', borderRadius:6}} placeholder="Enter reason for deletion" />
            <div style={{display:'flex', gap:'0.5rem', justifyContent:'flex-end', marginTop:'0.75rem'}}>
              <button className={styles.approveButton} onClick={confirmDeleteSalon} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</button>
              <button className={styles.rejectButton} onClick={()=>{setShowDeleteModal(false); setDeletingSalon(null);}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}