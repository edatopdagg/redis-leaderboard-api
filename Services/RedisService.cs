using StackExchange.Redis;

namespace LeaderboardApi.Services
{
    public class RedisService
    {
        private readonly ConnectionMultiplexer _redis;
        public IDatabase Db => _redis.GetDatabase();

        public RedisService(IConfiguration configuration)
        {
            _redis = ConnectionMultiplexer.Connect(configuration["Redis:ConnectionString"]);
        }
    }
}
