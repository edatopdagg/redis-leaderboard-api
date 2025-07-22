using Microsoft.AspNetCore.Mvc;
using LeaderboardApi.Services;
using Microsoft.AspNetCore.Authorization;

namespace LeaderboardApi.Controllers
{
    [ApiController]
    [Route("scores")]
    public class ScoresController : ControllerBase
    {
        private readonly RedisService _redisService;

        public ScoresController(RedisService redisService)
        {
            _redisService = redisService;
        }

        // Belirli bir tabloya skor gönderme endpoint'i
        [HttpPost("submit/{tableName}")]
        public IActionResult SubmitScore(string tableName, [FromBody] ScoreRequest request)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            if (request.Score < 0)
                return BadRequest("Skor negatif olamaz.");

            var db = _redisService.Db;
            db.SortedSetAdd(tableName, request.Username, request.Score);
            

            // Tablo ismini LeaderboardTables Set'ine ekle
            db.SetAdd("LeaderboardTables", tableName);

            return Ok(new { Message = $"Skor '{tableName}' tablosuna başarıyla eklendi" });
        }

        // Belirli bir tablodan kullanıcının skorunu silme endpoint'i
        [HttpDelete("delete/{tableName}/{username}")]
        public IActionResult DeleteScore(string tableName, string username)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            var db = _redisService.Db;
            var removed = db.SortedSetRemove(tableName, username);

            if (removed)
            {
                return Ok(new { Message = $"'{username}' kullanıcısının skoru '{tableName}' tablosundan başarıyla silindi" });
            }
            else
            {
                return NotFound($"'{username}' kullanıcısı '{tableName}' tablosunda bulunamadı.");
            }
        }

        [HttpDelete("delete/{tableName}")]
        public IActionResult DeleteTable(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            var db = _redisService.Db;
            var removed = db.KeyDelete(tableName);

            if (removed)
            {
                return Ok(new { Message = $"'{tableName}' tablosu başarıyla silindi" });
            }
            else
            {
                return NotFound(new { Message = $"'{tableName}' tablosu bulunamadı." });
            }
        }

        // Belirli bir tablodaki kullanıcının skorunu güncelleme endpoint'i
        [HttpPut("update/{tableName}")]
        public IActionResult UpdateScore(string tableName, [FromBody] ScoreRequest request)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            if (request.Score < 0)
                return BadRequest("Skor negatif olamaz.");

            var db = _redisService.Db;
            
            // Kullanıcının mevcut skorunu kontrol et
            var existingScore = db.SortedSetScore(tableName, request.Username);
            
            if (existingScore == null)
            {
                return NotFound($"'{request.Username}' kullanıcısı '{tableName}' tablosunda bulunamadı.");
            }

            // Skoru güncelle
            db.SortedSetAdd(tableName, request.Username, request.Score);
           
            // });

            return Ok(new { 
                Message = $"'{request.Username}' kullanıcısının skoru '{tableName}' tablosunda başarıyla güncellendi",
                OldScore = existingScore,
                NewScore = request.Score
            });
        }

        // Belirli bir tablodaki kullanıcının skorunu artırma endpoint'i
        [HttpPut("increment/{tableName}")]
        public IActionResult IncrementScore(string tableName, [FromBody] ScoreIncrementRequest request)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            var db = _redisService.Db;
            
            // Kullanıcının mevcut skorunu kontrol et
            var existingScore = db.SortedSetScore(tableName, request.Username);
            
            if (existingScore == null)
            {
                return NotFound($"'{request.Username}' kullanıcısı '{tableName}' tablosunda bulunamadı.");
            }

            // Skoru artır
            var newScore = (double)existingScore + request.Increment;
            db.SortedSetAdd(tableName, request.Username, newScore);

            return Ok(new { 
                Message = $"'{request.Username}' kullanıcısının skoru '{tableName}' tablosunda başarıyla artırıldı",
                OldScore = existingScore,
                Increment = request.Increment,
                NewScore = newScore
            });
        }

        // Zaman bazlı skor ekleme endpoint'i
        [HttpPost("submit-time-based/{tableName}")]
        public IActionResult SubmitTimeBasedScore(string tableName, [FromBody] ScoreRequest request)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            if (request.Score < 0)
                return BadRequest("Skor negatif olamaz.");

            var db = _redisService.Db;
            
            // Ana tabloya skor ekle
            db.SortedSetAdd(tableName, request.Username, request.Score);
           
            db.SetAdd("LeaderboardTables", tableName);

            // Günlük tabloya skor ekle
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var dailyKey = $"{tableName}:daily:{today}";
            db.SortedSetAdd(dailyKey, request.Username, request.Score);

            // Haftalık tabloya skor ekle
            var weekStart = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek).ToString("yyyy-MM-dd");
            var weeklyKey = $"{tableName}:weekly:{weekStart}";
            db.SortedSetAdd(weeklyKey, request.Username, request.Score);

            // Aylık tabloya skor ekle
            var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).ToString("yyyy-MM");
            var monthlyKey = $"{tableName}:monthly:{monthStart}";
            db.SortedSetAdd(monthlyKey, request.Username, request.Score);

            return Ok(new { 
                Message = $"Skor '{tableName}' tablosuna ve zaman bazlı tablolara başarıyla eklendi",
                DailyKey = dailyKey,
                WeeklyKey = weeklyKey,
                MonthlyKey = monthlyKey
            });
        }

        // Zaman bazlı skor artırma endpoint'i
        [HttpPut("increment-time-based/{tableName}")]
        public IActionResult IncrementTimeBasedScore(string tableName, [FromBody] ScoreIncrementRequest request)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest("Tablo adı boş olamaz.");

            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            var db = _redisService.Db;
            
            // Ana tablodaki skoru artır
            var existingScore = db.SortedSetScore(tableName, request.Username);
            if (existingScore == null)
            {
                return NotFound($"'{request.Username}' kullanıcısı '{tableName}' tablosunda bulunamadı.");
            }
            var newScore = (double)existingScore + request.Increment;
            db.SortedSetAdd(tableName, request.Username, newScore);

            // Günlük tablodaki skoru artır
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var dailyKey = $"{tableName}:daily:{today}";
            var dailyScore = db.SortedSetScore(dailyKey, request.Username) ?? 0;
            db.SortedSetAdd(dailyKey, request.Username, dailyScore + request.Increment);

            // Haftalık tablodaki skoru artır
            var weekStart = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek).ToString("yyyy-MM-dd");
            var weeklyKey = $"{tableName}:weekly:{weekStart}";
            var weeklyScore = db.SortedSetScore(weeklyKey, request.Username) ?? 0;
            db.SortedSetAdd(weeklyKey, request.Username, weeklyScore + request.Increment);

            // Aylık tablodaki skoru artır
            var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).ToString("yyyy-MM");
            var monthlyKey = $"{tableName}:monthly:{monthStart}";
            var monthlyScore = db.SortedSetScore(monthlyKey, request.Username) ?? 0;
            db.SortedSetAdd(monthlyKey, request.Username, monthlyScore + request.Increment);

            return Ok(new { 
                Message = $"'{request.Username}' kullanıcısının skoru tüm zaman bazlı tablolarda başarıyla artırıldı",
                OldScore = existingScore,
                Increment = request.Increment,
                NewScore = newScore
            });
        }
    }

    public class ScoreRequest
    {
        public string Username { get; set; }
        public double Score { get; set; }
    }

    public class ScoreIncrementRequest
    {
        public string Username { get; set; }
        public double Increment { get; set; }
    }
}
