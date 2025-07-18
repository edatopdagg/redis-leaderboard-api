# Redis Tabanlı Liderlik Tablosu Uygulaması

Bu proje, Redis kullanarak hızlı ve esnek bir liderlik tablosu (leaderboard) API'si ve React tabanlı modern bir frontend sunar. Kullanıcılar skor ekleyebilir, güncelleyebilir, silebilir ve en iyi skorları görebilir.

## Özellikler
- **.NET 8 Web API** ile hızlı backend
- **React** ile modern ve responsive frontend
- **Redis** ile gerçek zamanlı skor saklama ve sıralama
- Zaman bazlı (günlük/haftalık/aylık) ve seviye bazlı liderlik tablosu
- Skor ekleme, güncelleme, silme ve tablo seçimi
- Mobil uyumlu ve tema desteği

## Gereksinimler
- .NET 8 SDK
- Node.js & npm
- Redis sunucusu (lokal veya Docker ile)

## Kurulum

### 1. Redis Sunucusunu Başlat

**Docker ile:**
```sh
docker run --name redis-leaderboard -p 6379:6379 -d redis
```
veya
**Lokal Redis:**
Redis'i kendi bilgisayarınıza kurup başlatın.

### 2. Backend (API) Kurulumu
```sh
cd <proje klasörü>
dotnet restore
dotnet build
dotnet run
```
Varsayılan olarak `http://localhost:5020` adresinde çalışır.

### 3. Frontend (React) Kurulumu
```sh
cd frontend
npm install
npm start
```
Varsayılan olarak `http://localhost:3000` adresinde çalışır.

## Temel API Endpointleri

- **Skor Ekle:**
  - `POST /scores/submit/{tableName}`
  - Body: `{ "username": "ali", "score": 1234 }`
- **Skor Güncelle:**
  - `PUT /scores/update/{tableName}`
  - Body: `{ "username": "ali", "score": 1500 }`
- **Skor Sil:**
  - `DELETE /scores/delete/{tableName}/{username}`
- **En İyi Skorlar:**
  - `GET /leaderboard/top/{tableName}/{n}`
- **Seviye Bazlı:**
  - `GET /leaderboard/level/{tableName}/{level}`
- **Zaman Bazlı:**
  - `GET /leaderboard/daily/{tableName}/{n}`
  - `GET /leaderboard/weekly/{tableName}/{n}`
  - `GET /leaderboard/monthly/{tableName}/{n}`

Tüm endpointler için Swagger arayüzü: `http://localhost:5020/swagger`

## Frontend Özellikleri
- Tablo ve grafik ile skorları görselleştirme
- Tablo seçici ve seviye/zaman filtresi
- Skor ekleme, güncelleme, silme formları
- Responsive ve tema desteği

## Örnek Skor Ekleme (cURL)
```sh
curl -X POST http://localhost:5020/scores/submit/game1 \
  -H "Content-Type: application/json" \
  -d '{ "username": "eda", "score": 5000 }'
```

## Katkı ve Lisans
- Katkı yapmak için PR gönderebilirsiniz.
- MIT Lisansı ile lisanslanmıştır.

---

Her türlü soru ve katkı için iletişime geçebilirsiniz! 