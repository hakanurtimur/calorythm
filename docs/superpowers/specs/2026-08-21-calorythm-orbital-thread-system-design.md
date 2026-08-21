# CALORYTHM Orbital Thread System — Tasarım Spesifikasyonu

Tarih: 2026-08-21

## Amaç

CALORYTHM'in dört renkli halka çizgisi tek seferlik bir hero dekoru değil, homepage boyunca form değiştiren kalıcı marka karakteridir. Sistem aynı dört SVG path'ini splash, hero, pointer interaction, CTA ve ileride eklenecek scroll sahneleri arasında fiziksel süreklilik korunarak taşır.

Başarı ölçütü: Kullanıcı farklı yerlerde benzer halkalar görmez; aynı çizgilerin bir durumdan diğerine dönüştüğünü hisseder.

## Onaylanan yaratıcı yön

- Tek SVG ve tek set dört path kullanılır.
- Hero'nun dinlenme durumunda çizgiler büyük merkez halkayı oluşturur.
- Pointer hareketi yalnızca aktif forma lokal deformasyon uygular; tüm obje mouse'u takip etmez.
- Hero CTA hover/focus durumunda büyük halka tamamen çözülür ve aynı dört çizgi CTA'ya doğru çekilerek buton çevresinde dört ip/kapsül formuna sarılır.
- Gradient, hazır bir hover arka planı olarak başlamaz. Çizgiler CTA'ya ulaştıkça CTA içindeki renk alanı ilerlemeye bağlı olarak oluşur.
- Hover/focus bittiğinde süreç tersine akar ve aynı path'ler tekrar büyük halkaya döner.
- İleride section'lar yeni SVG kopyaları üretmek yerine aynı sistemi yeni state/anchor tanımlarıyla kullanır.

## Değerlendirilen yaklaşımlar

### 1. Persistent SVG + state-driven geometry morph — seçilen yaklaşım

Tek portal SVG bütün deneyim boyunca yaşar. Dört path'in geometri noktaları aktif state'e göre interpolate edilir. DOM elemanları yalnızca hedef alanlarını bildirir.

Avantajları:

- Gerçek shared-element sürekliliği sağlar.
- CTA ve sonraki sahneler aynı path'leri kullanır.
- 2D marka diline ve mevcut SVG altyapısına uyar.
- WebGL gerektirmez.

### 2. Her hedefte ayrı SVG + crossfade

Uygulaması hızlıdır fakat kullanıcının eleştirdiği kopya halka hissini üretir. Fiziksel süreklilik yoktur. Reddedildi.

### 3. Canvas/WebGL particle trail

Serbest akış sağlar fakat DOM CTA ile hassas hizalama, erişilebilirlik, reduced-motion ve gelecekteki editorial state'ler için gereksiz karmaşıktır. Projenin onaylanan 2D yönüyle çeliştiği için reddedildi.

## Mimari

### 1. `OrbitalThreadStage`

Mevcut `SharedHeroRing` sorumlulukları ayrıştırılarak global/persistent render katmanına dönüştürülür.

Sorumlulukları:

- Tek SVG portalını render etmek.
- Dört marka path'inin tek sahibi olmak.
- Splash handoff'unu korumak.
- Aktif state snapshot'ını okuyup path geometrisini tek bir `requestAnimationFrame` döngüsünde üretmek.
- Resize/scroll sonrası kayıtlı anchor ölçülerini yeniden hesaplamak.

CTA veya section bileşenleri path render etmez.

### 2. `orbital-thread-store`

Framework bağımsız küçük bir external store kullanılır. Mevcut `scene-state-store` yaklaşımına benzer ancak thread sisteminin ihtiyaçlarına özeldir.

State iki katmandan oluşur:

```ts
type OrbitalBaseState =
  | { kind: "intro" }
  | { kind: "hero" }
  | { kind: "scene"; id: string; progress: number };

type OrbitalInteractionState =
  | { kind: "idle" }
  | { kind: "pointer"; x: number; y: number; strength: number }
  | { kind: "cta"; anchorId: string; active: boolean };
```

Öncelik sırası:

1. CTA/focus interaction
2. Scroll scene state
3. Pointer deformasyonu
4. Idle breathing

Bu sıralama aynı anda birden fazla kaynak state yazdığında görsel çakışmayı önler.

### 3. Anchor sözleşmesi

DOM hedefleri deklaratif bir attribute ile kayıt edilir:

```html
data-orbital-anchor="hero"
data-orbital-anchor="hero-cta"
```

İlk sürümde stage aynı document içindeki anchor'ları ölçer. Bu, server-render edilebilen editorial bileşenleri client context'e zorlamaz. İleride portal veya nested route ihtiyacı doğarsa aynı isim sözleşmesi bir ref registry ile değiştirilebilir; geometri motoru etkilenmez.

Her anchor şu bilgiyi sağlar:

- viewport rect
- hedef state adı
- interaction activation (`pointerenter`, `pointerleave`, `focus`, `blur`)

### 4. Geometry engine

Geometri motoru React'tan bağımsız saf fonksiyonlardan oluşur:

- SVG path sayıları parse edilir.
- Her marka path'i aynı sayıda anchor/control point ile temsil edilir.
- `heroRingGeometry` mevcut orbital formu üretir.
- `ctaThreadGeometry(rect, stageRect, pathIndex)` CTA etrafındaki dört ayrı ip/kapsül hedefini üretir.
- `interpolateGeometry(from, to, progress)` iki state arasında deterministik geçiş sağlar.
- Pointer deformasyonu yalnızca hero geometry üzerinde bir modifier olarak uygulanır.

CTA morph'u düz bir scale değildir. Dört path farklı response ve gecikmeyle daralır; path'lerin CTA'ya bakan bölümü önce çekilir, kalan yay bir kuyruk/ip gibi ardından gelir. Son durumda dört path CTA çevresinde birbirine girmeyen ayrı kapsül çizgileridir.

### 5. CTA renk alanı

Hero CTA içinde ikinci bir SVG bulunmaz. Mevcut `linkOrbit` kopyası kaldırılır.

Stage, morph progress değerini CTA elementine `--orbital-fill-progress` CSS custom property olarak yazar. CTA arka planı bu değeri mask/clip üzerinden kullanır:

- `0–0.45`: CTA şeffaf; çizgiler yoldadır.
- `0.45–0.8`: renk alanı çizgilerin giriş yönünden genişler.
- `0.8–1`: gradient CTA içini doldurur; dört gerçek path çevrede görünür kalır.

Gradient marka renklerini taşır, ancak path'lerin yerine geçmez.

## İlk implementasyon kapsamı

Bu turda yapılacaklar:

- Mevcut CTA içi kopya orbital SVG'yi kaldırmak.
- Persistent stage/store/geometry sınırlarını kurmak.
- `intro`, `hero`, `pointer` ve `hero-cta` state'lerini tamamlamak.
- Hero CTA hover ve keyboard focus ile aynı morph'u çalıştırmak.
- Mouse/focus ayrılınca hero ring'e ters geçiş yapmak.
- Gelecek section state'leri için `scene(id, progress)` API'sini açmak ve test etmek.

Bu turda yapılmayacaklar:

- Scene 01–07 için yeni scroll morph tasarımları.
- WebGL/Three.js.
- Yeni içerik veya section tasarımı.
- CTA dışındaki linklerde orbital interaction.

## Responsive ve reduced motion

Desktop:

- Tam shared geometry morph çalışır.
- Pointer modifier aktiftir.

Touch/mobile:

- Hover bağımlılığı yoktur.
- CTA focus/press durumunda kısa, sadeleştirilmiş renk feedback'i verilir.
- Persistent ring scroll state API'si korunur.

`prefers-reduced-motion: reduce`:

- Path'ler hero formunda statik kalır.
- CTA renk feedback'i anlık ve düşük yoğunluklu olur.
- Sürekli `requestAnimationFrame` döngüsü başlatılmaz.

## Performans

- Tek SVG ve dört path render edilir.
- Tek rAF döngüsü path günceller.
- Pointer input yalnızca hedef değerleri günceller; DOM write rAF içinde yapılır.
- Anchor rect'leri her frame okunmaz; activation, resize, scroll/scene değişimi sırasında cache yenilenir.
- Path stringleri iki ondalıkla sınırlandırılır.
- Hidden document durumunda animasyon döngüsü geometri yazmaz.

## Erişilebilirlik

- SVG `aria-hidden` ve `pointer-events: none` kalır.
- CTA gerçek `<a>` olarak kalır.
- Keyboard focus hover ile eşdeğer state'i tetikler.
- Focus görünürlüğü gradient altında kaybolmaz.
- Reduced-motion alternatifi zorunludur.

## Test stratejisi

1. Store testleri
   - state önceliği
   - progress clamp
   - aynı snapshot için gereksiz notification olmaması

2. Geometry unit testleri
   - dört path'in nokta sayısı sabit
   - progress `0` hero geometrisine eşit
   - progress `1` CTA rect'i çevresinde ayrı kapsüller üretir
   - ara progress path'leri geçerli ve sonlu koordinatlar üretir

3. Component integration testleri
   - document'ta yalnız bir orbital thread SVG bulunur
   - CTA içinde ikinci SVG/path bulunmaz
   - hover/focus state'i aynı dört persistent path'in `d` değerini değiştirir
   - leave/blur hero geometry'ye dönüşü tetikler
   - reduced-motion rAF başlatmaz

4. Browser doğrulaması
   - 1440×900 desktop morph akışı
   - varsayılan mobile fallback
   - CTA gradientinin path arrival sonrasında dolması
   - console error/warning olmaması

## Gelecekte section stackleme

Yeni bir sahne eklemek için yalnızca şunlar gerekir:

1. Sahne DOM'una isimli orbital anchor eklemek.
2. Saf bir geometry target fonksiyonu tanımlamak.
3. Scroll orchestrator'dan `scene(id, progress)` state'ini yazmak.

Renderer, path ownership, reduced-motion ve input altyapısı yeniden yazılmaz. Böylece CALORYTHM'in dört çizgisi hero'dan sonraki editorial sahnelere gerçek bir görsel omurga olarak taşınır.
