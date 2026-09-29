import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an api.js loader and tracks its result.
 *
 * Every service function resolves to `{ data }`, so the admin screens all load
 * the same way: `const { data, loading, setData } = useAsync(api.listAdminVendors)`.
 * `setData` lets a mutation (approve, disable, hide) swap in the fresh list the
 * endpoint returns without a second round trip.
 */
export default function useAsync(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const reload = useCallback(() => {
    let alive = true;
    setLoading(true);
    run()
      .then((result) => {
        if (alive) {
          setData(result?.data ?? null);
          setError(null);
        }
      })
      .catch((err) => {
        if (alive) setError(err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [run]);

  useEffect(() => reload(), [reload]);

  return { data, loading, error, setData, reload };
}
