# RENK İSTİLASI — TikTok LIVE

Yorum yazan her izleyici kendine özgü başlangıç rengiyle bir yuvarlak olarak oyuna katılır. Yuvarlaklar dolaşır, çarpışır, çarpışmaya doğru daha çok hareket eden renk diğerine bulaşır. İsimler aynı kalır, sadece takım renkleri değişir. En büyük üç renk takımı küçük bir yüzer tabloda altta gösterilir. **Oyun alanı ekranın her noktasında devam eder**, üst başlık/bar yoktur. Tam ekran ve ayarlar butonları sağ üstte yüzer.

## Kullanıcı adlarının görünürlüğü

170 oyuncu üzerindeyken isimlerin gizlenmesine neden olan eski sınır kaldırıldı. Kullanıcı adı gösterme ayarı açıkken etiketler her oyuncu için çizilir, topların üstünde katmanlanır ve kalabalıkta mümkün olduğunca çakışmayacak yerlere yerleştirilir. Çok yoğun ekranda fiziksel alan yetmediğinden bazı etiketler yine üst üste gelebilir.

## Telefonda hızlı demo

1. `index.html` dosyasını Android'deki tarayıcıda aç (veya dosyayı internet üzerinde yayınla).
2. 12 örnek oyuncu otomatik başlar.
3. Sağ üst **⚙** tuşundan `+15 TEST OYUNCUSU`, elle isim ekleme, hız ve isim seçeneklerini dene.
4. Sağ üst **⛶** ile tam ekran yap.

> `index.html` tek başına çalışırken TikTok yorumlarını alamaz. Bunun için Node.js sunucusu gereklidir.

## TikTok LIVE bağlama — GitHub + Render

1. ZIP içindeki **index.html**, **server.js**, **package.json** dosyalarını yeni bir GitHub deposunun kök klasörüne yükle. README isteğe bağlı.
2. Render'da **New → Web Service** oluştur, GitHub deposunu bağla.
3. Runtime: **Node**. Build command: `npm install`. Start command: `npm start`.
4. Environment ekranına aşağıdaki değişkeni ekle:

   - Key: `TIKTOK_USERNAME`
   - Value: TikTok yayın hesabının kullanıcı adı, örn. `ornekhesap` (başında @ olmasa daha iyi).

5. Deploy et ve Render'ın verdiği HTTPS adresini Chrome'da aç. Yayın açıkken **CANLI SOHBET BAĞLI** görünmesini bekle. Yorum yapanlar kendiliğinden eklenir.
6. Telefonda tarayıcıyı tam ekrana al. TikTok LIVE ekran paylaşımı yaparken Chrome ekranını paylaş.

### Kurallar

- Katılım için hediye gerekmez, **ilk yorum yeterli**.
- Her TikTok kullanıcı adı oyun oturumunda **yalnızca bir kez** yuvarlak oluşturur. Sonraki yorumlar yeni yuvarlak doğurmaz.
- İlk 65.536 katılımcıya **farklı başlangıç HSL renk kodu** atanır (100 kişi için de garanti). Renkler gözle birbirine benzeyebilir; çarpışma olduğunda farklı toplar aynı renge geçebilir. Renkler 16 bitlik döngünün permütasyonuyla dağıtılır.
- Farklı renklerin çarpışmasında yaklaşma yönü/hızı daha güçlü olanın rengi diğerine yayılır; çok yakınsa rastgele belirlenir. Toplar sonra sekerek ilerler.
- Bir renk tüm oyuncuları ele geçirirse kazanan duyurulur, yeni katılan kullanıcılar yine yeni renk getirir.
- Eski oyuncu ve renk bilgisi sayfa açık olduğu sürece tutulur. Sunucu yeniden başlatıldığında sunucu geçmişi sıfırlanır.
- Sunucu çalışırken sayfa yenilenirse 5000'e kadar ilk katılan kullanıcı yeni tarayıcı oturumuna aktarılır; gerçek oyundaki önceki çarpışmalar yeniden kurulmaz.

### Önemli not

`tiktok-live-connector` resmi olmayan, tersine mühendislikle çalışan bir bağlantıdır. TikTok değişiklikleri veya yayın durumu nedeniyle çalışmayabilir; bağlantı koparsa yaklaşık 25 saniye sonra yeniden denenir. Bu proje TikTok kısıtlamalarını aşma veya platform kurallarını atlatma yöntemi içermez.
