import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { PurchaseCancelled, PurchasePending, type ProOffer, type ProPurchases } from './pro-purchases';

type Operation = 'purchase' | 'restore';
type OfferStatus = 'idle' | 'loading' | 'ready' | 'unavailable';

export function useProAccess(client: ProPurchases | null) {
  const [isPro, setPro] = useState(false);
  const [checking, setChecking] = useState(!!client);
  const [offer, setOffer] = useState<ProOffer | null>(null);
  const [offerStatus, setOfferStatus] = useState<OfferStatus>('idle');
  const [operation, setOperation] = useState<Operation | null>(null);
  const [notice, setNotice] = useState('');
  const busy = useRef(false);
  const loadingOffer = useRef(false);
  const revision = useRef(0);

  const commitAccess = useCallback((active: boolean) => {
    revision.current++;
    setPro(active);
    setChecking(false);
  }, []);

  useEffect(() => {
    if (!client) return;
    let mounted = true;
    let detach: (() => void) | undefined;
    try {
      detach = client.onAccessChange(active => { if (mounted) commitAccess(active); });
    } catch {
      // getAccess also attempts initialization so a temporary failure can be retried.
    }
    async function refresh() {
      const startedAt = revision.current;
      try {
        const active = await client!.getAccess();
        if (mounted && startedAt === revision.current && !busy.current) commitAccess(active);
      } catch {
        // During a network failure retain the last SDK-confirmed access state.
      } finally {
        if (mounted) setChecking(false);
      }
    }
    void refresh();
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') void refresh();
    });
    return () => { mounted = false; detach?.(); appState.remove(); };
  }, [client, commitAccess]);

  const loadOffer = useCallback(async () => {
    if (!client || loadingOffer.current || busy.current) return;
    loadingOffer.current = true;
    setOffer(null);
    setOfferStatus('loading');
    try {
      const next = await client.getOffer();
      setOffer(next);
      setOfferStatus(next ? 'ready' : 'unavailable');
    } catch {
      setOfferStatus('unavailable');
    } finally {
      loadingOffer.current = false;
    }
  }, [client]);

  async function run(kind: Operation) {
    if (busy.current || !client || (kind === 'purchase' && !offer)) return;
    busy.current = true;
    setOperation(kind);
    setNotice('');
    try {
      const active = kind === 'restore' ? await client.restore() : await offer!.purchase();
      if (kind === 'restore' || active) commitAccess(active);
      setNotice(active ? (kind === 'restore' ? '購入を復元しました。Proを利用できます。' : 'Proを購入しました。すべての教材を利用できます。') :
        kind === 'restore' ? '復元できるProの購入が見つかりませんでした。購入時のApple Accountをご確認ください。' :
          '購入は処理中です。反映までお待ちいただくか、「購入を復元」をお試しください。');
    } catch (error) {
      if (error instanceof PurchaseCancelled) return;
      setNotice(error instanceof PurchasePending ? '購入は承認待ちです。承認後にProが有効になります。' :
        kind === 'restore' ? '購入を復元できませんでした。通信を確認してもう一度お試しください。' :
          '購入を確認できませんでした。少し待ってから「購入を復元」をお試しください。');
    } finally {
      setOperation(null);
      busy.current = false;
    }
  }
  return {
    isPro, checking, offer, offerStatus, operation, notice, available: !!client,
    loadOffer, clearNotice: () => setNotice(''),
    purchase: () => run('purchase'), restore: () => run('restore'),
  };
}
