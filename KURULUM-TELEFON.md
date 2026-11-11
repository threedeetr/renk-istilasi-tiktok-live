# 🎨 Renk İstilası — Telefonda yayına alma

Bu paketteki dört uygulama dosyası (`index.html`, `server.js`, `package.json`, `render.yaml`) GitHub deposunun ana dizinine ayrı dosyalar olarak yüklenmelidir. İstersen `README.md` ve bu rehberi de ekleyebilirsin. **ZIP dosyasını GitHub'a tek dosya olarak yüklemek uygulamayı çalıştırmaz.**

## 1. GitHub

1. Android'de Chrome ile https://github.com/new sayfasını aç, GitHub hesabınla giriş yap.
2. Repository name: `renk-istilasi-tiktok-live`. Public seçebilirsin. `Create repository` yap.
3. Yeni deponun sayfasında `uploading an existing file` veya `Add file → Upload files` bağlantısına dokun.
4. ZIP'i telefonda açıp çıkardığın `index.html`, `server.js`, `package.json`, `render.yaml` dosyalarını seçip yükle. İstersen `README.md` dosyasını da ekle.
5. Sayfanın altından `Commit changes` ile kaydet.

## 2. Render — Blueprint yolu (önerilen)

1. https://dashboard.render.com/ adresinde giriş yap.
2. `New → Blueprint` seçip GitHub hesabını bağla; az önce açtığın depoyu seç.
3. Render `render.yaml` dosyasını algılar. `TIKTOK_USERNAME` için yayın yapacağın hesabın kullanıcı adını **@ olmadan** gir.
4. Deploy işlemini başlat. `Live` durumu çıktığında `https://...onrender.com` adresini aç.

**Alternatif Web Service yolu:** `New → Web Service`, GitHub deposu, Runtime `Node`, Build `npm install`, Start `npm start`, Instance `Free`, Environment key `TIKTOK_USERNAME`, value yayın hesabının @'siz kullanıcı adı; Create Web Service.

## 3. Kontrol

- Render adresi açılınca oyun alanı ekranı kaplar. Sağ üstteki `⛶` düğmesiyle tarayıcı tam ekrana geçebilir.
- `https://SENIN-ADRESIN.onrender.com/api/health` adresi `ok: true` döndürmeli.
- TikTok yayınını başlat; bağlantı durumunu ekranın altından takip et.
- Yayına başka bir hesaptan yorum yaz ve renkli bir topun eklenip eklenmediğini kontrol et.
- Henüz yayın yoksa veya TikTok bağlantısı başarısızsa, oyuncular otomatik gelmez. Sağ üst ⚙ menüsüyle test oyuncuları ekleyebilirsin.

## Önemli notlar

- Katılmak için ilk yorum yeterli; aynı hesap oyun oturumu boyunca bir kez top üretir.
- İsimler oyuncu sayısı artsa da otomatik gizlenmez.
- 100 kişi katıldığında her birine farklı başlangıç renk kodu atanır. Renkler birbirine benzeyebilir; çarpışmada oyuncular aynı takımın rengine geçer.
- Render ücretsiz hizmetler boşta kaldığında uykuya geçebilir. Servis yeniden başlatılırsa sunucunun oyuncu hafızası sıfırlanır.
- TikTok bağlayıcısı **resmî değildir**. TikTok güncellemeleriyle bozulabilir; kurulum ve yayında canlı test gerekir.
- Telefon üzerinden ekran paylaşırken cihazın ve TikTok uygulamasının ekran paylaşımını desteklemesi gerekir.
