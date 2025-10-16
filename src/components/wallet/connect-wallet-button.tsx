'use client';

import { Button } from '@/components/ui/button';
import { useBaseAccountSDK } from '@/lib/base-account';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function ConnectWalletButton() {
  const sdk = useBaseAccountSDK();
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const provider = sdk.getProvider();
    provider.request({ method: 'eth_accounts', params: [] }).then((accounts) => {
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAddress(accounts[0] as string);
      }
    });
  }, [sdk]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const provider = sdk.getProvider();
      const accounts = (await provider.request({ method: 'eth_requestAccounts', params: [] })) as string[];
      setAddress(accounts[0]);
      toast.success('Wallet connected');
    } catch (error) {
      console.error(error);
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleConnect} disabled={loading} variant={address ? 'outline' : 'default'}>
      {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : loading ? 'Connecting…' : 'Connect Wallet'}
    </Button>
  );
}
