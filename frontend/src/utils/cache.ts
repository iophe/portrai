import { createResource, Resource } from "solid-js";

interface CacheEntry<T> {
	value: T;
	timestamp: number;
}

const CACHE_STORE = new Map<string, CacheEntry<any>>();

interface cache_options {
	ttl?: number; // Time to live in milliseconds (optional, if not provided, cache never expires)
	cache_key?: string; // Custom cache key
    
}

/**
 * Creates a cached resource for data fetching with caching
 * @param fetcher - Simple function that fetches the data
 * @param options - Optional caching options
 * @returns Resource tuple with additional invalidate function
 */
export function createCachedResource<T>(
	fetcher: () => Promise<T>,
	options: cache_options = {},
    post_fn ?: (value:T) => void
): [
	Resource<T>,
	{
		refetch: () => Promise<T>;
		mutate: (v: T | ((prev?: T) => T)) => T;
		invalidate: () => void;
	},
] {
	// Generate a unique cache key if none provided
	const cache_key = options.cache_key ?? `resource_${crypto.randomUUID()}`;
    
	// Create a wrapper around the fetcher that checks the cache
	const cached_fetcher = async () => {
		// Check if we have a valid cached value
		const cached = CACHE_STORE.get(cache_key);

		if (cached) {
			// If ttl is not set, cache never expires
			if (!options.ttl) {
                post_fn?.(cached.value);
				return cached.value;
			}

			// If ttl is set, check if cache is still valid
			if (Date.now() - cached.timestamp < options.ttl) {
                post_fn?.(cached.value);
				return cached.value;
			} else {
				// invalidate cache
				CACHE_STORE.delete(cache_key);
			}
		}

		// If no valid cache, fetch fresh data
		const result = await fetcher();

		// Store in cache
		CACHE_STORE.set(cache_key, {
			value: result,
			timestamp: Date.now(),
		});

        post_fn?.(result);
		return result;
	};

	// Use SolidJS createResource with our cached fetcher
	const [resource, { refetch, mutate }] = createResource(cached_fetcher);

	// Create a refetch function that always bypasses cache
	const force_refetch = async () => {
		// Fetch fresh data
		const result = await fetcher();

		// Update the cache
		CACHE_STORE.set(cache_key, {
			value: result,
			timestamp: Date.now(),
		});

		// Update the resource
		mutate(() => result);

		return result;
	};

	// Create an invalidate function
	const invalidate = () => {
		CACHE_STORE.delete(cache_key);
	};

	// Return the resource with our custom functions
	return [
		resource,
		{
			refetch: force_refetch,
			mutate: (value) => {
				// When mutating, also update the cache
				const result =
					typeof value === "function"
						? (value as Function)(resource())
						: value;

				CACHE_STORE.set(cache_key, {
					value: result,
					timestamp: Date.now(),
				});

				return mutate(() => result);
			},
			invalidate,
		},
	];
}

export function invalidate(key:string) {
    CACHE_STORE.delete(key);
}