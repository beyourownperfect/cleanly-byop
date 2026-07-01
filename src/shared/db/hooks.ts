import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

export function useLiveQuery<T>(querier: () => (T | Promise<T>), deps?: React.DependencyList): T | undefined {
  const [result, setResult] = useState<T | undefined>(undefined);

  useEffect(() => {
    const observable = liveQuery(querier);
    const subscription = observable.subscribe({
      next: (value) => setResult(value),
      error: () => {},
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return result;
}
