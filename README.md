# Risale-i Nur Español

Aplicación de lectura Expo/React Native para libros de Risale-i Nur en español, con subrayados, notas y horarios de oración; para iOS y Android.

İspanyolca Risale-i Nur kitapları için vurgulama, notlar ve namaz vakitleri sunan Expo/React Native okuma uygulaması; iOS ve Android için.

## Ejecutar / Çalıştırma

```bash
npm install
npx expo start
```

## Libros / Kitaplar

Los textos de los libros no están en este repositorio. Sin ellos la app abre con un libro de muestra. Para la versión completa, copia los archivos del libro en `assets/books/` (por ejemplo `los-destellos.json`) y `assets/frases.json`.

Kitap metinleri bu depoda yok. Onlar olmadan uygulama örnek bir kitapla açılır. Tam sürüm için kitap dosyalarını `assets/books/` (ör. `los-destellos.json`) ve `assets/frases.json` konumuna koyun.

## Compilar APK / APK derleme

```bash
npx eas-cli build -p android --profile preview
```

Powered by [Nüve Dijital](https://nuvedigital.com)
