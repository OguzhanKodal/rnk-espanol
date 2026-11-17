# Informe de contenido

## Entrega y reproducción

- Fuente: **Tratados sobre Ramadán, Frugalidad y Agradecimiento**, Nur Ediciones, Bogotá, 2024; traducción de Lic. Lorena Lara. PDF de 93 páginas físicas.
- SHA-256 del PDF: `1ea1cb233cc582a0df0198bae13bbc03169a8ab7e7616c74be3895db991eb9bd`.
- Libro: `assets/books/ramadan-frugalidad-agradecimiento.json`, 3 secciones, 402 bloques.
- Catálogo: 1 libro disponible y 9 títulos próximos, con las estanterías solicitadas.
- Glosario: 56 entradas, definiciones en español y variantes presentes en el libro; todas conservan `verified: false` para revisión editorial humana.
- Frases: 18 citas breves, copiadas literalmente del texto normalizado; `section` contiene el id estable s1/s2/s3.

Desde la raíz del repositorio:

```sh
python3 -m venv scripts/.venv
scripts/.venv/bin/pip install -r scripts/requirements.txt
scripts/.venv/bin/python scripts/convert_book.py
python3 scripts/validate.py
scripts/.venv/bin/python scripts/validate.py --pdf
# Opcional: verifica además los hashes y las líneas del corpus turco local.
scripts/.venv/bin/python scripts/validate.py --pdf --source-root '/Users/oguzhankodal/Desktop/Risale-i Nur/Risale-i-Nur-Külliyatı Markdown/obsidian-markdown'
```

No se modifica el PDF. `--output-dir scripts/.tmp/rebuild` permite comparar otra conversión. Las dependencias y los temporales viven exclusivamente en `.venv/` y `.tmp/`, ignorados por `scripts/.gitignore`.

## Recuperación árabe

**35 pasajes detectados; 35 resueltos; 0 sin resolver.** Un pasaje es una aparición contigua: una invocación, una cita o un conjunto de versos presentado conjuntamente; los saltos tipográficos de una misma cita no multiplican el conteo. La serie de cinco citas de p.52 constituye un pasaje; las dos invocaciones de p.61 son dos pasajes.

La premisa sobre los tipos Barla no describe el almacenamiento del árabe en este archivo concreto. Se revisaron `pdffonts` y todos los spans de PyMuPDF: Barla contiene títulos latinos y “Nur Ediciones”; el árabe del cuerpo está convertido en **trazados vectoriales rellenos**, sin caracteres Unicode ni font spans. Se inventariaron todos estos trazados, se agruparon sus límites y se inspeccionaron visualmente todas las páginas que los contienen. La única figura rellena excluida en las páginas del libro es la roseta ornamental de p.51, debajo de la oración.

Cada entrada de `scripts/arabic_overrides.json`, identificada por `página:aparición`, conserva texto Unicode copiado de la fuente turca, caja en puntos PDF, ubicación inline/independiente, contexto, archivo, línea, hash SHA-256 y confianza. Los spans inline se insertan entre los fragmentos españoles a izquierda y derecha de su caja; las oraciones independientes son bloques `arabic`. Se compararon las formas, el orden y la longitud de cada grupo renderizado con la expresión del corpus. No se generó ninguna frase árabe de memoria.

Raíz de las referencias de la tabla: `/Users/oguzhankodal/Desktop/Risale-i Nur/Risale-i-Nur-Külliyatı Markdown/obsidian-markdown/`. El corpus se identifica en sus metadatos como “Hizmet Vakfı & DİB asıl nüsha metni 2016”. La grafía y las vocales Unicode siguen ese corpus; no se intenta reproducir las ligaduras exactas del PDF. Las etiquetas HTML y `<br/>` se eliminan o convierten en saltos de línea; el separador editorial `§` se sustituye por un espacio. Las expresiones en un renglón de título (p.82) se conservan en un bloque árabe inmediatamente después del heading, porque el contrato no permite spans dentro de headings.

| Página:aparición | Contexto español / posición | Árabe de la fuente | Archivo:línea | Confianza |
|---|---|---|---|---|
| 5:1 | Invocación inicial antes del Primer Punto | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `02 Mektubat/29 Yirmi Dokuzuncu Mektup.md:177` | Alta |
| 5:2 | Aleya inicial del tratado sobre el Ramadán | شَهْرُ رَمَضَانَ الَّذٖٓى اُنْزِلَ فٖيهِ الْقُرْاٰنُ هُدًى لِلنَّاسِ وَ بَيِّنَاتٍ مِنَ الْهُدٰى وَ الْفُرْقَانِ | `02 Mektubat/29 Yirmi Dokuzuncu Mektup.md:177` | Alta |
| 6:1 | puso cada una de estas bendiciones en una forma de | مِنْ حَيْثُ لَا يَحْتَسِبُ | `02 Mektubat/29 Yirmi Dokuzuncu Mektup.md:186` | Alta |
| 14:1 | Cada mes de Ramadán se muestra que la aleya | شَهْرُ رَمَضَانَ الَّذٖٓى اُنْزِلَ فٖيهِ الْقُرْاٰنُ | `02 Mektubat/29 Yirmi Dokuzuncu Mektup.md:227` | Alta |
| 23:1 | Y el alma contestó: Tú eres mi Compasivo Señor | اَنْتَ رَبِّى الرَّحٖيمُ وَاَنَا عَبْدُكَ الْعَاجِزُ | `02 Mektubat/29 Yirmi Dokuzuncu Mektup.md:282` | Alta |
| 23:2 | Súplica final del tratado sobre el Ramadán | اَللّٰهُمَّ صَلِّ وَسَلِّمْ عَلٰى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تَكُونُ لَكَ رِضَاءً وَ لِحَقِّهٖ اَدَاءً بِعَدَدِ ثَوَابِ قِرَائَةِ حُرُوفِ الْقُرْاٰنِ فٖى شَهْرِ رَمَضَانَ وَ عَلٰى اٰلِهٖ وَ صَحْبِهٖ وَ سَلِّمْ<br>سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلَامٌ عَلَى الْمُرْسَلٖينَ وَ الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمٖينَ اٰمٖينَ | `02 Mektubat/29 Yirmi Dokuzuncu Mektup.md:284` | Alta |
| 25:1 | Invocación inicial del tratado Sobre la Frugalidad | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:10` | Alta |
| 25:2 | Aleya inicial del tratado Sobre la Frugalidad | كُلُوا وَ اشْرَبُوا وَ لَا تُسْرِفُوا | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:10` | Alta |
| 30:1 | verdad: Hace tiempo, un alumno del Sheik Geylani | قُمْ بِاِذْنِ اللّٰه | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:39` | Alta |
| 31:1 | Según este Hadiz del Profeta una persona moderada | لَا يَعُولُ مَنِ اقْتَصَدَ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:46` | Alta |
| 33:1 | según el significado de esta aleya del Sagrado Corán | اِنَّ اللّٰهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتٖينُ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:52` | Alta |
| 33:2 | y del significado explícito de esta otra | وَمَا مِنْ دَٓابَّةٍ فِى الْاَرْضِ اِلَّا عَلَى اللّٰهِ رِزْقُهَا | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:52` | Alta |
| 35:1 | según la regla cuando uno esté obligado | اِنَّ الضَّرُورَةَ تُقَدَّرُ بِقَدْرِهَا | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:62` | Alta |
| 41:1 | El Imam Azam señaló esto cuando dijo | لَا اِسْرَافَ فِى الْخَيْرِ كَمَا لَا خَيْرَ فِى الْاِسْرَافِ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:100` | Alta |
| 42:1 | Incluso confirma el refrán que dice La codicia | اَلْحَرٖيصُ خَائِبٌ خَاسِرٌ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:107` | Alta |
| 45:1 | De acuerdo con el Hadiz del Profeta la satisfacción | اَلْقَنَاعَةُ كَنْزٌ لَا يَفْنٰى | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:119` | Alta |
| 46:1 | Según el Hadiz del Profeta la consecuencia | عَزَّ مَنْ قَنَعَ ذَلَّ مَنْ طَمَعَ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:123` | Alta |
| 48:1 | interpretó la siguiente aleya desde un punto médico | كُلُوا وَ اشْرَبُوا وَ لَا تُسْرِفُوا | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:131` | Alta |
| 49:1 | Concentro la ciencia de la medicina en dos líneas | جَمَعْتُ الطِّبَّ فِى الْبَيْتَيْنِ جَمْعًا وَ حُسْنُ الْقَوْلِ فٖى قَصْرِ الْكَلَامِ : | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:133` | Alta |
| 49:2 | Cuando comas, come poco y no comas nada | فَقَلِّلْ اِنْ اَكَلْتَ وَ بَعْدَ اَكْلٍ تَجَنَّبْ وَ الشِّفَاءُ فِى الْاِنْهِضَامِ<br>وَ لَيْسَ عَلَى النُّفُوسِ اَشَدُّ حَالًا مِنْ اِدْخَالِ الطَّعَامِ عَلَى الطَّعَامِ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:135` | Alta |
| 51:1 | Súplica final del tratado Sobre la Frugalidad | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:144` | Alta |
| 52:1 | Invocación inicial del Tratado Sobre el Agradecimiento | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>وَ اِنْ مِنْ شَىْءٍ اِلَّا يُسَبِّحُ بِحَمْدِهٖ | `02 Mektubat/28 Yirmi Sekizinci Mektup.md:264` | Alta |
| 52:2 | El Sagrado Corán reitera aleyas como por ejemplo | اَفَلَا يَشْكُرُونَ ۞ اَفَلَا يَشْكُرُونَ ۞ وَسَنَجْزِى الشَّاكِرٖينَ ۞ لَئِنْ شَكَرْتُمْ لَاَزٖيدَنَّكُمْ ۞ بَلِ اللّٰهَ فَاعْبُدْ وَ كُنْ مِنَ الشَّاكِرٖينَ | `02 Mektubat/28 Yirmi Sekizinci Mektup.md:268` | Alta |
| 53:1 | treinta y una veces que la ingratitud es negación | فَبِاَىِّ اٰلَٓاءِ رَبِّكُمَا تُكَذِّبَانِ | `02 Mektubat/28 Yirmi Sekizinci Mektup.md:270` | Alta |
| 61:1 | Súplica para ser de los agradecidos | اَللّٰهُمَّ اجْعَلْنَا مِنَ الشَّاكِرٖينَ بِرَحْمَتِكَ يَا اَرْحَمَ الرَّاحِمٖينَ | `02 Mektubat/28 Yirmi Sekizinci Mektup.md:326` | Alta |
| 61:2 | Súplica final del Tratado Sobre el Agradecimiento | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `02 Mektubat/28 Yirmi Sekizinci Mektup.md:326` | Alta |
| 62:1 | La Segunda Parte del Destello Veintinueve | بِاسْمِهٖ سُبْحَانَهُ | `04 Şuâlar/15 Yirmi Dokuzuncu Lem’a’dan İkinci Bab.md:6` | Alta |
| 62:2 | Esta Segunda Parte es sobre Gracias a Allah | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `04 Şuâlar/15 Yirmi Dokuzuncu Lem’a’dan İkinci Bab.md:12` | Alta |
| 68:1 | la tercera entonces necesita una cuarta Esto significa | وَهَلُمَّ جَرًّا | `04 Şuâlar/15 Yirmi Dokuzuncu Lem’a’dan İkinci Bab.md:48` | Alta |
| 69:1 | En consecuencia según el misterio de la aleya | اَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللّٰهِ | `04 Şuâlar/15 Yirmi Dokuzuncu Lem’a’dan İkinci Bab.md:52` | Alta |
| 75:1 | el Sabio Corán alude a estas maravillosas recompensas | وَ سَخَّرَ لَكُمُ الشَّمْسَ وَ الْقَمَرَ ۞ وَ سَخَّرَ لَكُمْ مَا فِى الْبَرِّ وَالْبَحْرِ | `04 Şuâlar/15 Yirmi Dokuzuncu Lem’a’dan İkinci Bab.md:80` | Alta |
| 76:1 | letra lam específicamente en una de las recompensas | اَلْحَمْدُ لِلّٰهِ | `04 Şuâlar/15 Yirmi Dokuzuncu Lem’a’dan İkinci Bab.md:84` | Alta |
| 81:1 | NOVENO PUNTO Said Nursi | اَلْحَمْدُ مِنَ اللّٰهِ بِاللّٰهِ عَلَى اللّٰهِ لِلّٰهِ | `04 Şuâlar/15 Yirmi Dokuzuncu Lem’a’dan İkinci Bab.md:108` | Alta |
| 82:1 | LA QUINTA FRASE Las adoraciones los elogios | وَ لَهُ الْحَمْدُ | `02 Mektubat/20 Yirminci Mektup.md:57` | Alta |
| 83:1 | de la misma manera a través de la frase | لَهُ الْحَمْدُ | `02 Mektubat/20 Yirminci Mektup.md:63` | Alta |

## Decisiones editoriales y límites

- Las páginas impresas coinciden con las físicas 5–92, pero el conversor obtiene el número del pie real; no lo asigna por índice. Conserva 88 bloques `pageBreak`, incluidos los folios vacíos 88–92. Se excluyen las páginas iniciales sin cuerpo (1–4) y la página 93, una imagen con publicidad del lector de PDF, ajena al libro.
- Los títulos decorativos Barla se trasladan a los títulos de sección. “Sobre la Frugalidad” y los puntos se mantienen como headings; el apéndice “La Segunda Parte del Destello Veintinueve” queda dentro de la tercera sección, respetando la organización de esta edición.
- Las líneas de la página de créditos se conservan literalmente como cadenas, en orden visual, sin sangrías ni espacios finales. No se añaden créditos inventados ni se extraen del anuncio final.
- Los párrafos se detectan por sangría y distancia entre líneas; se unen las líneas envueltas y las continuaciones entre folios. `page` es el folio donde **empieza** el párrafo. Un `pageBreak` señala el comienzo del siguiente folio entre bloques; el texto de un párrafo que cruza página permanece unido en su bloque anterior, según el contrato de anclaje. Las notas al pie se conservan como `note`, separadas por su tipografía y tamaño.
- Negrita y cursiva se derivan del nombre de font y de los flags de PyMuPDF. La font NewestCenturySchoolbook aparece con el mismo nombre truncado para normal/negrita, por lo que su flag bold es necesario.
- Se eliminan guiones de partición entre líneas, incluso entre páginas. Se conservan guiones reales como Mun-ím, al-A’zam, pre-eternidad y post-eternidad. Dos caracteres defectuosos de extracción antes del guion de partición (`producto�-` p.42 y `Minis�-` p.44) se retiran para producir “productores” y “Ministro”; se contrastaron las imágenes.
- Se preservan los errores y particularidades del español impreso, por ejemplo “Ayat al-Kursidan”, “mezquina”, “tomento”, “recompense” y “Rahman)es”; no se hace una retraducción ni una corrección de estilo. La variante del glosario advierte la unión tipográfica de Ayat al-Kursi.
- Las páginas 84–85 y 86–87 repiten el mismo pasaje con distinta distribución: se conservan ambas copias, porque están en el original. No se deduplican silenciosamente.
- Las definiciones del glosario son ayudas editoriales redactadas para esta entrega, no citas ni una certificación doctrinal. La atribución y autenticidad de hadices o relatos milagrosos no se evalúa: se transcribe la edición sin promover sus atribuciones a hechos verificados.

## Verificación realizada

- `scripts/validate.py --pdf --source-root …`: **PASS**. Comprueba claves exactas del contrato, tipos, ids estables, páginas, catálogo, todos los spans árabes frente a los overrides, hashes y líneas de la fuente turca, presencia de variantes y citas literales.
- Dos conversiones sucesivas y los JSON entregados son idénticos byte por byte.
- Cobertura independiente de los trazados: cada glifo vectorial relleno de las páginas 5–92 está dentro de una caja recuperada, salvo la roseta de p.51.
- Conservación independiente de caracteres españoles: el multiconjunto de caracteres de todos los spans del cuerpo PDF coincide con los headings y spans españoles del JSON, ignorando únicamente espacios, guiones de partición, el carácter defectuoso de extracción y asteriscos de llamadas. Esto complementa la comprobación visual; no pretende demostrar por sí solo el orden de lectura.
- Páginas completas contrastadas a **110 dpi** mediante `pdftoppm`: **6, 14, 26, 42, 58 y 78**. Las páginas **6, 14 y 42** verifican árabe inline; 26 verifica un punto y su párrafo, 58 términos y líneas partidas, 78 continuación y citas. También se inspeccionaron completas p.5 y p.44; esta última confirma la nota y sus firmas. Además se revisaron los recortes renderizados de **todas** las páginas con árabe: 5, 6, 14, 23, 25, 30, 31, 33, 35, 41, 42, 45, 46, 48, 49, 51, 52, 53, 61, 62, 68, 69, 75, 76, 81, 82 y 83.
- Las imágenes temporales no se incorporan al repositorio. Los límites reproducibles permanecen en los overrides.
- `tsc --noEmit` se ejecutó por las instrucciones del repositorio: señaló un error de `ViewToken.index` en `app/reader.tsx:45`, dentro del trabajo UI concurrente y fuera de esta entrega. `eslint app src --no-cache` señaló 10 errores y 1 advertencia en ese mismo archivo (incluidas reglas de hooks/pureza). No se modificó la UI para resolverlos. El wrapper `expo lint` intentó escribir su caché fuera de las rutas asignadas; se utilizó ESLint directamente con `--no-cache` para la comprobación de solo lectura.
