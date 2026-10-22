import { lazy, type ComponentType } from "react";

/**
 * React.lazy with retries: on a slow or flaky connection a chunk request can fail once,
 * and a single failure would otherwise take the whole page down.
 */
export function lazyRetry<P extends object>(load: () => Promise<{ default: ComponentType<P> }>, retries = 2) {
  return lazy(async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await load();
      } catch (err) {
        if (attempt >= retries) throw err;
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }
    }
  });
}
