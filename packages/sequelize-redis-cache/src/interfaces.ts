export type CacheOptions =
    | {
          /**
           * Ttl in seconds
           */
          ttl: number;

          /**
           * Do not retrieve data from cache, but set is still called
           */
          skip?: boolean;
      }
    | {
          /**
           * Clear only (no request)
           */
          clear: true;
      };
