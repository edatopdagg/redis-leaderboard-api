using Microsoft.AspNetCore.Mvc;
using LeaderboardApi.Services;
using StackExchange.Redis;
using System.Linq;


namespace LeaderboardApi.Controllers
{
    [ApiController]
    [Route("leaderboard")]
    public class LeaderboardController : ControllerBase
    {
        private readonly RedisService _redisService;

        public LeaderboardController(RedisService redisService)
        {
            _redisService = redisService;
        }

        
        [HttpGet("tables")]
         public IActionResult GetAllTables()
        {
            var db = _redisService.Db;
            var tableNames = db.SetMembers("LeaderboardTables").Select(x => x.ToString()).ToList();
            return Ok(tableNames);
        }

        
        [HttpGet("top/{tableName}/{n}")]
        public IActionResult GetTopPlayers(string tableName, int n)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (n <= 0)
                return BadRequest("Oyuncu sayısı pozitif olmalıdır.");

            var db = _redisService.Db;
            var topPlayers = db.SortedSetRangeByRankWithScores(tableName, 0, n - 1, Order.Descending);

            var result = topPlayers.Select(x => new {
                Username = x.Element.ToString(),
                Score = x.Score
            });

            return Ok(result);
        }

        
        [HttpGet("user/{tableName}/{username}")]
        public IActionResult GetUserRankAndScore(string tableName, string username)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            var db = _redisService.Db;
            var score = db.SortedSetScore(tableName, username);
            var rank = db.SortedSetRank(tableName, username, Order.Descending);

            if (score == null || rank == null)
                return NotFound("Kullanıcı bulunamadı.");

            return Ok(new
            {
                Username = username,
                Score = score,
                Rank = (int)rank + 1
            });
        }

       
        [HttpGet("scores/{tableName}")]
        public IActionResult GetScoresInRange(
            string tableName,
            [FromQuery] double? minScore,
            [FromQuery] double? maxScore)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            var db = _redisService.Db;

            
            double min = minScore ?? double.NegativeInfinity;
            double max = maxScore ?? double.PositiveInfinity;

            var players = db.SortedSetRangeByScoreWithScores(tableName, min, max, Exclude.None, Order.Descending);

            var result = players.Select(x => new {
                Username = x.Element.ToString(),
                Score = x.Score
            });

            return Ok(result);
        }

        
        [HttpGet("user-scores/{username}")]
        public IActionResult GetUserScoresAcrossTables(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            var db = _redisService.Db;
            var results = new List<object>();

            
            var tableNames = db.SetMembers("LeaderboardTables").Select(x => x.ToString()).ToList();

           
            if (!tableNames.Any())
            {
                
                var allKeys = db.Multiplexer.GetServer(db.Multiplexer.GetEndPoints().First()).Keys();
                tableNames = allKeys.Where(key => db.KeyType(key) == RedisType.SortedSet)
                                   .Select(key => key.ToString())
                                   .ToList();
            }

            foreach (var table in tableNames)
            {
                var score = db.SortedSetScore(table, username);
                if (score != null)
                {
                    var rank = db.SortedSetRank(table, username, Order.Descending);
                    results.Add(new
                    {
                        TableName = table,
                        Username = username,
                        Score = score,
                        Rank = rank != null ? (int)rank + 1 : (int?)null
                    });
                }
            }

            if (!results.Any())
            {
                return NotFound($"'{username}' kullanıcısı hiçbir tabloda bulunamadı.");
            }

            return Ok(results);
        }

        
        [HttpGet("level/{tableName}/{level}")]
        public IActionResult GetUsersByLevel(string tableName, int level)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");
            if (level <= 0)
                return BadRequest("Seviye pozitif olmalıdır.");

            var db = _redisService.Db;
            double minScore = (level - 1) * 5000;
            double maxScore = (level * 5000) - 0.0001; // Üst sınır dahil olmasın diye

            var players = db.SortedSetRangeByScoreWithScores(tableName, minScore, maxScore, Exclude.None, Order.Descending);

            var result = players.Select(x => new {
                Username = x.Element.ToString(),
                Score = x.Score,
                Level = level
            });

            return Ok(result);
        }


        
        [HttpGet("daily/{tableName}/{n}")]
        public IActionResult GetDailyTopPlayers(string tableName, int n)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (n <= 0)
                return BadRequest("Oyuncu sayısı pozitif olmalıdır.");

            var db = _redisService.Db;
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var dailyKey = $"{tableName}:daily:{today}";

            var topPlayers = db.SortedSetRangeByRankWithScores(dailyKey, 0, n - 1, Order.Descending);

            var result = topPlayers.Select(x => new {
                Username = x.Element.ToString(),
                Score = x.Score,
                Period = "Günlük"
            });

            return Ok(result);
        }

        
        [HttpGet("weekly/{tableName}/{n}")]
        public IActionResult GetWeeklyTopPlayers(string tableName, int n)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (n <= 0)
                return BadRequest("Oyuncu sayısı pozitif olmalıdır.");

            var db = _redisService.Db;
            var weekStart = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek).ToString("yyyy-MM-dd");
            var weeklyKey = $"{tableName}:weekly:{weekStart}";

            var topPlayers = db.SortedSetRangeByRankWithScores(weeklyKey, 0, n - 1, Order.Descending);

            var result = topPlayers.Select(x => new {
                Username = x.Element.ToString(),
                Score = x.Score,
                Period = "Haftalık"
            });

            return Ok(result);
        }

        
        [HttpGet("monthly/{tableName}/{n}")]
        public IActionResult GetMonthlyTopPlayers(string tableName, int n)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (n <= 0)
                return BadRequest("Oyuncu sayısı pozitif olmalıdır.");

            var db = _redisService.Db;
            var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).ToString("yyyy-MM");
            var monthlyKey = $"{tableName}:monthly:{monthStart}";

            var topPlayers = db.SortedSetRangeByRankWithScores(monthlyKey, 0, n - 1, Order.Descending);

            var result = topPlayers.Select(x => new {
                Username = x.Element.ToString(),
                Score = x.Score,
                Period = "Aylık"
            });

            return Ok(result);
        }

        
        [HttpGet("daily/user/{tableName}/{username}")]
        public IActionResult GetDailyUserRankAndScore(string tableName, string username)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            var db = _redisService.Db;
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var dailyKey = $"{tableName}:daily:{today}";

            var score = db.SortedSetScore(dailyKey, username);
            var rank = db.SortedSetRank(dailyKey, username, Order.Descending);

            if (score == null || rank == null)
                return NotFound("Kullanıcı bulunamadı.");

            return Ok(new
            {
                Username = username,
                Score = score,
                Rank = (int)rank + 1,
                Period = "Günlük"
            });
        }

       
        [HttpGet("weekly/user/{tableName}/{username}")]
        public IActionResult GetWeeklyUserRankAndScore(string tableName, string username)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            var db = _redisService.Db;
            var weekStart = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek).ToString("yyyy-MM-dd");
            var weeklyKey = $"{tableName}:weekly:{weekStart}";

            var score = db.SortedSetScore(weeklyKey, username);
            var rank = db.SortedSetRank(weeklyKey, username, Order.Descending);

            if (score == null || rank == null)
                return NotFound("Kullanıcı bulunamadı.");

            return Ok(new
            {
                Username = username,
                Score = score,
                Rank = (int)rank + 1,
                Period = "Haftalık"
            });
        }

        
        [HttpGet("monthly/user/{tableName}/{username}")]
        public IActionResult GetMonthlyUserRankAndScore(string tableName, string username)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            var db = _redisService.Db;
            var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).ToString("yyyy-MM");
            var monthlyKey = $"{tableName}:monthly:{monthStart}";

            var score = db.SortedSetScore(monthlyKey, username);
            var rank = db.SortedSetRank(monthlyKey, username, Order.Descending);

            if (score == null || rank == null)
                return NotFound("Kullanıcı bulunamadı.");

            return Ok(new
            {
                Username = username,
                Score = score,
                Rank = (int)rank + 1,
                Period = "Aylık"
            });
        }
    }
}
