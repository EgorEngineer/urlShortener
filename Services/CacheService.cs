using Microsoft.Extensions.Caching.Memory;
using UrlShortener.API.Services;

namespace UrlShortener.Services
{
    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly HashSet<string> _keys = new();
        private readonly SemaphoreSlim _semaphore = new(1, 1);

        public CacheService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public Task<T?> GetAsync<T>(string key)
        {
            _cache.TryGetValue(key, out T? value);
            return Task.FromResult(value);
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            var options = new MemoryCacheEntryOptions();

            if (expiration.HasValue)
            {
                options.AbsoluteExpirationRelativeToNow = expiration;
            }
            else
            {
                options.SlidingExpiration = TimeSpan.FromMinutes(30);
            }

            options.RegisterPostEvictionCallback((k, v, r, s) =>
            {
                _semaphore.Wait();
                try
                {
                    _keys.Remove(k.ToString()!);
                }
                finally
                {
                    _semaphore.Release();
                }
            });

            _cache.Set(key, value, options);

            await _semaphore.WaitAsync();
            try
            {
                _keys.Add(key);
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public Task RemoveAsync(string key)
        {
            _cache.Remove(key);

            _semaphore.Wait();
            try
            {
                _keys.Remove(key);
            }
            finally
            {
                _semaphore.Release();
            }

            return Task.CompletedTask;
        }

        public async Task RemoveByPatternAsync(string pattern)
        {
            await _semaphore.WaitAsync();
            try
            {
                var keysToRemove = _keys.Where(k => k.Contains(pattern)).ToList();
                foreach (var key in keysToRemove)
                {
                    _cache.Remove(key);
                    _keys.Remove(key);
                }
            }
            finally
            {
                _semaphore.Release();
            }
        }
    }
}
