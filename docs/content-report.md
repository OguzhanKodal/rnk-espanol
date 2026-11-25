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

## Destellos

- Manuscrito de Microsoft Word «Destellos (TERMINADO).docx». SHA-256 `cd26f885a3eb26eed4b327f0794d0588407186f729613e87b206868a7d0233ee`.
- El manuscrito se organiza en 37 secciones. La portada, la introducción, los 33 Destellos, «Una Súplica» y la oración final figuran en ese orden. Los encabezados «Introducción» y «Oración final» describen secciones que carecen de un título impreso.
- La portada acredita «De la Colección Risale-i Nur» y «Bediüzzaman Said Nursi». No incluye nombre de traductor ni editorial.
- El libro contiene 2708 bloques, incluidos 288 saltos de página y 61 notas al pie. Las notas aparecen inmediatamente después del párrafo que las cita, con el mismo número en ambos lugares. Los separadores centrados de asteriscos se omiten.
- El tipo de span admite negrita o cursiva. Cuando las dos se aplican a un mismo fragmento, se conserva la negrita.
- La referencia de página es la posición en el PDF de 288 páginas exportado por Microsoft Word. Cada párrafo y sus notas llevan la página donde empieza el párrafo. Los párrafos con imágenes únicamente se ubican entre los párrafos de texto adyacentes y, si cruzan una frontera de página, se cotejan con las imágenes extraídas del PDF. Cada página representada comienza con un bloque `pageBreak`.
- PDF fuente «Destellos (TERMINADO).pdf», exportado por Microsoft Word en 288 páginas A4. SHA-256 `92b627f2d48900a2077200e102ab29cae36ebfcfddf373f56d6cb4bf9d484a49`. La alineación cubre todos los párrafos de contenido y las páginas 1 a 288. No quedaron párrafos sin ubicación.

### Reproducción

```sh
scripts/.venv/bin/python scripts/convert_docx.py "$HOME/Downloads/Destellos (TERMINADO).docx" --pdf "$HOME/Downloads/Destellos (TERMINADO).pdf"
scripts/.venv/bin/python scripts/validate.py --docx "$HOME/Downloads/Destellos (TERMINADO).docx" \
  --destellos-pdf "$HOME/Downloads/Destellos (TERMINADO).pdf" \
  --source-root "$HOME/Desktop/Risale-i Nur/Risale-i-Nur-Külliyatı Markdown/obsidian-markdown"
```

### Observaciones del manuscrito

- El Destello Siete contiene la anotación de edición «(FALTAN MUCHAS FRASES EN ÁRABE)» en el párrafo 355. Es una nota para el editor, no parte del libro, y el conversor la omite (`EDITORIAL_NOTES`). Las frases sin imagen ni texto en el Word quedan fuera del inventario de imágenes.
- Los Destellos Ocho, Nueve, Quince, Dieciocho, Veintisiete y Treinta y Uno a Treinta y Tres remiten a otras ediciones o partes de la colección. Se conservan esas remisiones. Los Destellos Cinco y Seis describen tratados pospuestos y el Veintiocho ofrece una selección.
- El Destello Veinticinco repite el rótulo «SEXTO REMEDIO». La propia nota 36 explica la repetición. Las 61 referencias a notas tienen cuerpo en el Word.
- El orden XML de las imágenes 330 y 331 del Destello Veintinueve está invertido con respecto a la secuencia del texto en el corpus. El JSON conserva el orden del manuscrito.

### Recuperación árabe

Se inventariaron **447 apariciones** de 386 PNG distintos, con 441 apariciones en el cuerpo y seis en las notas. La apertura contiene una representación VML de compatibilidad para tres imágenes de DrawingML. Se procesa una sola representación.

Se cotejaron las imágenes con sus pasajes en el corpus Hizmet Vakfı & DİB asıl nüsha metni 2016. **411** apariciones tienen texto localizado, 391 de confianza alta, 20 de confianza media y 0 de confianza baja. **36** apariciones quedan marcadas `unresolved: true`. La confianza media señala recortes largos del Destello Veintinueve cuyos límites se cotejaron por separado o una variante de flexión localizada en otra parte del corpus (imagen 72).

Las cadenas se copian de la transcripción. Se eliminan etiquetas HTML y llamadas de nota Markdown, se convierte `<br>` en salto de línea y `§` en espacio. Se omiten los renglones vacíos intercalados cuando una cita se extiende a un tramo continuo de líneas. El archivo [arabic_overrides_destellos.json](../scripts/arabic_overrides_destellos.json) conserva el texto completo, el contexto, la ruta relativa al corpus, las líneas y el hash SHA-256 de cada archivo fuente.

#### Apariciones sin transcripción

| PNG | Apariciones | Contexto español | Motivo |
|---|---:|---|---|
| `image3.png` | 1 | Bediüzzaman Said Nursi / ⟦otra imagen⟧⟦imagen⟧⟦otra imagen⟧ / [Ésta, la primera parte de la Carta Treinta y Uno consiste de seis Destellos, cada uno de los cuales | La imagen del encabezamiento omite los dos fragmentos incluidos en las imágenes 2 y 4. No coincide como cita continua con la línea del corpus. |
| `image382.png` | 1 | Nota 1 · Las aleyas: ⟦imagen⟧ | Dos aleyas unidas en la imagen. El corpus las separa con prosa turca. |
| `image26.png` | 1 | nuncia:  , así también su corazón, espíritu, mente y todas sus facultades sutiles deberían declarar: / ⟦imagen⟧ / * * * | La imagen reúne tres pasajes. El primero aparece incrustado en la prosa turca y los otros dos van en una línea aparte. |
| `image75.png` | 1 | nos meses de Hasan como Califa sería importante, como lo confirmaron las noticias del Profeta (PyB): / ⟦imagen⟧ / que asegura la reconciliación de dos grandes ejércitos, dos grandísimas comunidades islámicas, y eli | Dos dichos comparten el PNG. En el corpus están separados por prosa turca. |
| `image113.png` | 1 | Éste, el Destello Trece, explica el significado de: / ⟦imagen⟧ / [Éste es sobre buscar refugio en Allah de Satanás. Se escribirán trece indicaciones. Algunas de ella | El encabezamiento une la invocación temática de la línea 6 con el bloque de la línea 8, intercalado con prosa en el corpus. |
| `image145.png` | 1 | o, la bendita descendencia de Fátima sería altamente honrada como la de la madre de María, que dijo: / ⟦imagen⟧ / * * * | La imagen une la cita de la línea 75 con la oración de la línea 77, separadas por prosa en el corpus. |
| `image237.png` | 1 | Tratado Sobre la Naturaleza / ⟦imagen⟧ / [Si bien originalmente estaba asignado como la Nota Dieciséis del Destello Diecisiete, ha sido desig | Rótulo ornamental en turco otomano para el Tratado Sobre la Naturaleza. Sin transcripción literal localizada. |
| `image256.png` | 1 | * * * / ⟦imagen⟧ / Destello Veinticinco | Rótulo ornamental en caligrafía. Sin texto literal localizado en el corpus. |
| `image258.png` | 25 | Separadores entre los remedios del Destello Veinticinco, p. ej. se repite a menudo: “Los tiempos de calamidad duran mucho, los momentos de alegría son muy breves.” / ⟦imagen⟧ / SEGUNDO REMEDIO | Roseta ornamental sin texto. Se contabiliza cada aparición. |
| `image271.png` | 1 | calculables cadáveres de los árboles muertos sobre la faz de la tierra, haciéndolos manifestar ⟦imagen⟧ la vida después de la muerte y reviviendo a trescientas mil especies de plantas y animales como | No se encontró la expresión completa con la misma forma léxica que en el PNG. |
| `image296.png` | 1 | ción de estos contenedores sucede con tanta velocidad, facilidad y abundancia de la fábrica de ⟦imagen⟧, que el Corán dice que es llevado a cabo con una mera orden de ⟦otra imagen⟧. Así, puedes encon | Dos letras aisladas separadas por un guion. El corpus comenta la orden en prosa y no incluye el rótulo. |
| `image311.png` | 1 | y decimos en significado en nombre de todas ellas: / ⟦imagen⟧ / Said Nursi | La imagen une una cita incrustada en la prosa y el párrafo siguiente. Sin coincidencia literal continua. |

#### Correspondencias por aparición

Los ids empiezan por el párrafo de Word (`p`) o la nota al pie (`fn`). Cada referencia es relativa a la raíz del corpus. La tabla abrevia las transcripciones largas.

| Id de aparición | Posición | Pasaje o inicio | Fuente y línea | Confianza |
|---|---|---|---|---|
| `p7:1:image1.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/01 Birinci Lem’a.md:5` | Alta |
| `p8:1:image2.png` | Independiente | فَنَادٰى فِى | `03 Lem'alar/01 Birinci Lem’a.md:5` | Alta |
| `p8:2:image3.png` | Independiente | Pendiente | — | Sin resolver |
| `p8:3:image4.png` | Independiente | لَا حَوْلَ وَلَا قُوَّةَ | `03 Lem'alar/01 Birinci Lem’a.md:5` | Alta |
| `p15:1:image5.png` | En línea | لَٓا اِلٰهَ اِلَّٓا اَنْتَ سُبْحَانَكَ اِنّٖى كُنْتُ مِنَ الظَّالِمٖينَ | `03 Lem'alar/01 Birinci Lem’a.md:12` | Alta |
| `p18:1:image6.png` | Independiente | لَٓا اِلٰهَ اِلَّٓا اَنْتَ سُبْحَانَكَ اِنّٖى كُنْتُ مِنَ الظَّالِمٖينَ | `03 Lem'alar/01 Birinci Lem’a.md:20` | Alta |
| `p22:1:image7.png` | Independiente | لَٓا اِلٰهَ اِلَّٓا اَنْتَ سُبْحَانَكَ اِنّٖى كُنْتُ مِنَ الظَّالِمٖينَ | `03 Lem'alar/01 Birinci Lem’a.md:24` | Alta |
| `p24:1:image8.png` | En línea | لَٓا اِلٰهَ اِلَّٓا اَنْتَ | `03 Lem'alar/01 Birinci Lem’a.md:24` | Alta |
| `p24:2:image9.png` | En línea | سُبْحَانَكَ | `03 Lem'alar/01 Birinci Lem’a.md:24` | Alta |
| `p24:3:image10.png` | En línea | اِنّٖى كُنْتُ مِنَ الظَّالِمٖينَ | `03 Lem'alar/01 Birinci Lem’a.md:24` | Alta |
| `p28:1:image11.png` | Independiente | لَٓا اِلٰهَ اِلَّٓا اَنْتَ سُبْحَانَكَ اِنّٖى كُنْتُ مِنَ الظَّالِمٖينَ | `03 Lem'alar/01 Birinci Lem’a.md:34` | Alta |
| `p29:1:image12.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/01 Birinci Lem’a.md:36` | Alta |
| `p37:1:image13.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>اِذْ نَادٰى رَبَّهُٓ اَنّٖى مَسَّنِىَ الضُّرُّ وَاَنْتَ اَرْحَمُ الرَّاحِمٖينَ | `03 Lem'alar/02 İkinci Lem’a.md:6` | Alta |
| `p42:1:image14.png` | Independiente | رَبِّ اِنّٖى مَسَّنِىَ الضُّرُّ وَاَنْتَ اَرْحَمُ الرَّاحِمٖينَ | `03 Lem'alar/02 İkinci Lem’a.md:8` | Alta |
| `p58:1:image15.png` | En línea | بَلْ رَانَ عَلٰى قُلُوبِهِمْ | `03 Lem'alar/02 İkinci Lem’a.md:23` | Alta |
| `p65:1:image16.png` | Independiente | مَالِكُ الْمُلْكِ يَتَصَرَّفُ فٖى مُلْكِهٖ كَيْفَ يَشَٓاءُ | `03 Lem'alar/02 İkinci Lem’a.md:28` | Alta |
| `p79:1:image17.png` | Independiente | اَلْحَمْدُ لِلّٰهِ عَلٰى كُلِّ حَالٍ سِوَى الْكُفْرِ وَ الضَّلَالِ | `03 Lem'alar/02 İkinci Lem’a.md:41` | Alta |
| `p126:1:image18.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>كُلُّ شَىْءٍ هَالِكٌ اِلَّا وَجْهَهُ لَهُ الْحُكْمُ وَاِلَيْهِ تُرْجَعُونَ | `03 Lem'alar/03 Üçüncü Lem’a.md:8` | Alta |
| `p128:1:image19.png` | En línea | يَا بَاقٖى اَنْتَ الْبَاقٖى ۞ يَا بَاقٖى اَنْتَ الْبَاقٖى | `03 Lem'alar/03 Üçüncü Lem’a.md:10` | Alta |
| `p131:1:image20.png` | En línea | يَا بَاقٖى اَنْتَ الْبَاقٖى | `03 Lem'alar/03 Üçüncü Lem’a.md:13` | Alta |
| `p133:1:image21.png` | En línea | يَا بَاقٖى اَنْتَ الْبَاقٖى | `03 Lem'alar/03 Üçüncü Lem’a.md:19` | Alta |
| `p133:2:image22.png` | En línea | يَا بَاقٖى اَنْتَ الْبَاقٖى | `03 Lem'alar/03 Üçüncü Lem’a.md:19` | Alta |
| `p134:1:image22.png` | En línea | يَا بَاقٖى اَنْتَ الْبَاقٖى | `03 Lem'alar/03 Üçüncü Lem’a.md:19` | Alta |
| `p134:2:image23.png` | En línea | يَا بَاقٖى | `03 Lem'alar/03 Üçüncü Lem’a.md:23` | Alta |
| `p141:1:image22.png` | En línea | يَا بَاقٖى اَنْتَ الْبَاقٖى | `03 Lem'alar/03 Üçüncü Lem’a.md:19` | Alta |
| `p149:1:image24.png` | Independiente | سِنَةُ الْفِرَاقِ سَنَةٌ وَ سَنَةُ الْوِصَالِ سِنَةٌ | `03 Lem'alar/03 Üçüncü Lem’a.md:47` | Alta |
| `p151:1:image25.png` | Independiente | اَرْضُ الْفَلَاتِ مَعَ الْاَعْدَاءِ فِنْجَانٌ سَمُّ الْخِيَاطِ مَعَ الْاَحْبَابِ مَيْدَانٌ | `03 Lem'alar/03 Üçüncü Lem’a.md:51` | Alta |
| `fn2.p1:1:image382.png` | En línea | Pendiente | — | Sin resolver |
| `fn2.p2:1:image383.png` | En línea | وَاِنَّ يَوْمًا عِنْدَ رَبِّكَ كَاَلْفِ سَنَةٍ مِمَّا تَعُدُّونَ | `03 Lem'alar/03 Üçüncü Lem’a.md:77` | Alta |
| `p159:1:image22.png` | En línea | يَا بَاقٖى اَنْتَ الْبَاقٖى | `03 Lem'alar/03 Üçüncü Lem’a.md:19` | Alta |
| `p161:1:image26.png` | Independiente | Pendiente | — | Sin resolver |
| `p173:1:image27.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>لَقَدْ جَٓاءَكُمْ رَسُولٌ مِنْ اَنْفُسِكُمْ عَزٖيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرٖيصٌ عَل… | `03 Lem'alar/04 Dördüncü Lem’a.md:10` | Alta |
| `p195:1:image28.png` | En línea | اِلَّا الْمَوَدَّةَ فِى الْقُرْبٰى | `03 Lem'alar/04 Dördüncü Lem’a.md:36` | Alta |
| `p196:1:image29.png` | En línea | اِنَّ اَكْرَمَكُمْ عِنْدَ اللّٰهِ اَتْقٰيكُمْ | `03 Lem'alar/04 Dördüncü Lem’a.md:38` | Alta |
| `p198:1:image30.png` | Independiente | اَللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ وَ عَلٰى اٰلِ سَيِّدِنَا مُحَمَّدٍ كَمَا صَلَّيْتَ عَلٰى اِبْرَاهٖيمَ وَ عَلٰى … | `03 Lem'alar/04 Dördüncü Lem’a.md:40` | Alta |
| `p199:1:image31.png` | En línea | لَٓا اَسْئَلُكُمْ عَلَيْهِ اَجْرًا اِلَّا الْمَوَدَّةَ فِى الْقُرْبٰى | `03 Lem'alar/04 Dördüncü Lem’a.md:40` | Alta |
| `p214:1:image32.png` | En línea | مَنْ كُنْتُ مَوْلَاهُ فَعَلِىٌّ مَوْلَاهُ | `03 Lem'alar/04 Dördüncü Lem’a.md:67` | Alta |
| `p216:1:image33.png` | En línea | لَا لِحُبِّ عَلِىٍّ بَلْ لِبُغْضِ عُمَرَ | `03 Lem'alar/04 Dördüncü Lem’a.md:71` | Alta |
| `p233:1:image34.png` | Independiente | فَاِنْ تَوَلَّوْا فَقُلْ حَسْبِىَ اللّٰهُ لَٓا اِلٰهَ اِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظٖيمِ | `03 Lem'alar/04 Dördüncü Lem’a.md:102` | Alta |
| `p241:1:image35.png` | Independiente | حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكٖيلُ | `03 Lem'alar/05 Beşinci Lem’a.md:6` | Alta |
| `p250:1:image36.png` | Independiente | لَا حَوْلَ وَلَا قُوَّةَ اِلَّا بِاللّٰهِ الْعَلِىِّ الْعَظٖيمِ | `03 Lem'alar/06 Altıncı Lem’a.md:6` | Alta |
| `p259:1:image37.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>لَقَدْ صَدَقَ اللّٰهُ رَسُولَهُ الرُّؤْيَا بِالْحَقِّ لَتَدْخُلُنَّ الْمَسْجِدَ الْحَر… | `03 Lem'alar/07 Yedinci Lem’a.md:8` | Alta |
| `p265:1:image38.png` | Independiente | لَقَدْ صَدَقَ اللّٰهُ رَسُولَهُ الرُّؤْيَا … الخ | `03 Lem'alar/07 Yedinci Lem’a.md:14` | Alta |
| `p270:1:image39.png` | Independiente | فَجَعَلَ مِنْ دُونِ ذٰلِكَ فَتْحًا قَرٖيبًا | `03 Lem'alar/07 Yedinci Lem’a.md:20` | Alta |
| `p277:1:image40.png` | En línea | لَا تَخَافُونَ | `03 Lem'alar/07 Yedinci Lem’a.md:36` | Alta |
| `p281:1:image41.png` | Independiente | هُوَ الَّذٖٓى اَرْسَلَ رَسُولَهُ بِالْهُدٰى وَ دٖينِ الْحَقِّ لِيُظْهِرَهُ عَلَى الدّٖينِ كُلِّهٖ | `03 Lem'alar/07 Yedinci Lem’a.md:42` | Alta |
| `p286:1:image42.png` | Independiente | مُحَمَّدٌ رَسُولُ اللّٰهِ وَالَّذٖينَ مَعَهُٓ اَشِدَّٓاءُ عَلَى الْكُفَّارِ رُحَمَٓاءُ بَيْنَهُمْ تَرٰيهُمْ رُكَّعًا سُجَّد… | `03 Lem'alar/07 Yedinci Lem’a.md:48` | Alta |
| `p289:1:image43.png` | En línea | وَالَّذٖينَ مَعَهُ | `03 Lem'alar/07 Yedinci Lem’a.md:52` | Alta |
| `p289:2:image44.png` | En línea | اَشِدَّٓاءُ عَلَى الْكُفَّارِ | `03 Lem'alar/07 Yedinci Lem’a.md:54` | Alta |
| `p289:3:image45.png` | En línea | رُحَمَٓاءُ بَيْنَهُمْ | `03 Lem'alar/07 Yedinci Lem’a.md:56` | Alta |
| `p290:1:image46.png` | Independiente | تَرٰيهُمْ رُكَّعًا سُجَّدًا يَبْتَغُونَ فَضْلًا مِنَ اللّٰهِ وَ رِضْوَانًا | `03 Lem'alar/07 Yedinci Lem’a.md:58` | Alta |
| `p295:1:image47.png` | En línea | ذٰلِكَ مَثَلُهُمْ فِى التَّوْرٰيةِ | `03 Lem'alar/07 Yedinci Lem’a.md:62` | Alta |
| `p296:1:image48.png` | En línea | مَثَلُهُمْ فِى التَّوْرٰيةِ | `03 Lem'alar/07 Yedinci Lem’a.md:66` | Alta |
| `p297:1:image49.png` | En línea | مَثَلُهُمْ فِى التَّوْرٰيةِ | `03 Lem'alar/07 Yedinci Lem’a.md:68` | Alta |
| `p297:2:image50.png` | En línea | مَثَلُهُمْ فِى التَّوْرٰيةِ | `03 Lem'alar/07 Yedinci Lem’a.md:70` | Alta |
| `p302:1:image51.png` | Independiente | وَ مَثَلُهُمْ فِى الْاِنْجٖيلِ كَزَرْعٍ اَخْرَجَ شَطْاَهُ فَاٰزَرَهُ فَاسْتَغْلَظَ فَاسْتَوٰى عَلٰى سُوقِهٖ يُعْجِبُ الزُّر… | `03 Lem'alar/07 Yedinci Lem’a.md:74` | Alta |
| `p305:1:image52.png` | En línea | مَعَهُ قَضٖيبٌ مِنْ حَدٖيدٍ وَاُمَّتُهُ كَذٰلِكَ | `03 Lem'alar/07 Yedinci Lem’a.md:78` | Alta |
| `p307:1:image53.png` | En línea | مَغْفِرَةً | `03 Lem'alar/07 Yedinci Lem’a.md:84` | Alta |
| `p307:2:image54.png` | En línea | مَغْفِرَةً | `03 Lem'alar/07 Yedinci Lem’a.md:86` | Alta |
| `p307:3:image55.png` | En línea | لِيَغْفِرَلَكَ اللّٰهُ مَا تَقَدَّمَ مِنْ ذَنْبِكَ وَمَا تَاَخَّرَ | `03 Lem'alar/07 Yedinci Lem’a.md:86` | Alta |
| `p310:1:image56.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/07 Yedinci Lem’a.md:90` | Alta |
| `p319:1:image57.png` | Independiente | وَلَهَدَيْنَاهُمْ صِرَاطًا مُسْتَقٖيمًا ۞ وَمَنْ يُطِعِ اللّٰهَ وَ الرَّسُولَ فَاُولٰٓئِكَ مَعَ الَّذٖينَ اَنْعَمَ اللّٰهُ ع… | `03 Lem'alar/07 Yedinci Lem’a.md:97` | Alta |
| `p327:1:image58.png` | Independiente | مِنَ النَّبِيّٖنَ وَ الصِّدّٖيقٖينَ وَ الشُّهَدَٓاءِ وَ الصَّالِحٖينَ وَ حَسُنَ اُولٰٓئِكَ رَفٖيقًا | `03 Lem'alar/07 Yedinci Lem’a.md:105` | Alta |
| `p329:1:image59.png` | En línea | مِنَ النَّبِيّٖنَ | `03 Lem'alar/07 Yedinci Lem’a.md:107` | Alta |
| `p329:2:image60.png` | En línea | وَالصِّدّٖيقٖينَ | `03 Lem'alar/07 Yedinci Lem’a.md:107` | Alta |
| `p329:3:image61.png` | En línea | وَالشُّهَدَٓاءِ | `03 Lem'alar/07 Yedinci Lem’a.md:109` | Alta |
| `p330:1:image62.png` | En línea | وَالصَّالِحٖينَ | `03 Lem'alar/07 Yedinci Lem’a.md:111` | Alta |
| `p330:2:image63.png` | En línea | وَ حَسُنَ اُولٰٓئِكَ رَفٖيقًا | `03 Lem'alar/07 Yedinci Lem’a.md:111` | Alta |
| `p330:3:image64.png` | En línea | اِنَّ الْخِلَافَةَ بَعْدٖى ثَلَاثُونَ سَنَةً | `03 Lem'alar/07 Yedinci Lem’a.md:111` | Alta |
| `p333:1:image65.png` | Independiente | رَبَّنَا لَا تُؤَاخِذْنَٓا اِنْ نَسٖينَٓا اَوْ اَخْطَاْنَا<br>سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ ا… | `03 Lem'alar/07 Yedinci Lem’a.md:115` | Alta |
| `p341:1:image66.png` | Independiente | فَاُولٰٓئِكَ مَعَ الَّذٖينَ اَنْعَمَ اللّٰهُ عَلَيْهِمْ مِنَ النَّبِيّٖنَ وَ الصِّدّٖيقٖينَ وَ الشُّهَدَٓاءِ وَ الصَّالِحٖين… | `03 Lem'alar/07 Yedinci Lem’a.md:120` | Alta |
| `p342:1:image67.png` | En línea | صِرَاطَ الَّذٖينَ اَنْعَمْتَ عَلَيْهِمْ | `03 Lem'alar/07 Yedinci Lem’a.md:120` | Alta |
| `p343:1:image68.png` | En línea | وَ الَّذٖينَ اٰمَنُوا وَ عَمِلُوا الصَّالِحَاتِ | `03 Lem'alar/07 Yedinci Lem’a.md:122` | Alta |
| `p343:2:image69.png` | En línea | اِنْ كُنْتُمْ تُحِبُّونَ اللّٰهَ فَاتَّبِعُونٖى يُحْبِبْكُمُ اللّٰهُ | `03 Lem'alar/07 Yedinci Lem’a.md:122` | Alta |
| `p343:3:image70.png` | En línea | وَالصِّدّٖيقٖينَ | `03 Lem'alar/07 Yedinci Lem’a.md:124` | Alta |
| `p343:4:image71.png` | En línea | وَالشُّهَدَٓاءِ | `03 Lem'alar/07 Yedinci Lem’a.md:126` | Alta |
| `p343:5:image72.png` | En línea | شُهَدَٓاءَ | `07 İşaratü'l-i'caz/17 Bakara Suresi 23-24. âyetler.md:427` | Media |
| `p344:1:image73.png` | En línea | وَالصَّالِحٖينَ | `03 Lem'alar/07 Yedinci Lem’a.md:128` | Alta |
| `p344:2:image74.png` | En línea | وَ حَسُنَ اُولٰٓئِكَ رَفٖيقًا | `03 Lem'alar/07 Yedinci Lem’a.md:130` | Alta |
| `p345:1:image75.png` | Independiente | Pendiente | — | Sin resolver |
| `p346:1:image76.png` | En línea | وَ حَسُنَ اُولٰٓئِكَ رَفٖيقًا | `03 Lem'alar/07 Yedinci Lem’a.md:132` | Alta |
| `p349:1:image77.png` | Independiente | رَبَّنَا لَا تُؤَاخِذْنَٓا اِنْ نَسٖينَٓا اَوْ اَخْطَاْنَا<br>سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ ا… | `03 Lem'alar/07 Yedinci Lem’a.md:136` | Alta |
| `p363:1:image78.png` | Independiente | رَبَّنَا لَا تُؤَاخِذْنَٓا اِنْ نَسٖينَٓا اَوْ اَخْطَاْنَا<br>سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ ا… | `03 Lem'alar/07 Yedinci Lem’a.md:149` | Alta |
| `p385:1:image79.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>يَوْمَ تَجِدُ كُلُّ نَفْسٍ مَا عَمِلَتْ مِنْ خَيْرٍ مُحْضَرًا وَمَا عَمِلَتْ مِنْ سُٓو… | `03 Lem'alar/10 Onuncu Lem’a.md:8` | Alta |
| `p442:1:image80.png` | En línea | اَلظُّلْمُ لَا يَدُومُ وَالْكُفْرُ يَدُومُ | `03 Lem'alar/10 Onuncu Lem’a.md:94` | Alta |
| `p444:1:image81.png` | En línea | اَلدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ | `03 Lem'alar/10 Onuncu Lem’a.md:102` | Alta |
| `p446:1:image82.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/10 Onuncu Lem’a.md:108` | Alta |
| `p455:1:image83.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>لَقَدْ جَٓاءَكُمْ رَسُولٌ مِنْ اَنْفُسِكُمْ عَزٖيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرٖيصٌ عَل… | `03 Lem'alar/11 On Birinci Lem’a.md:8` | Alta |
| `p459:1:image84.png` | Independiente | فَاِنْ تَوَلَّوْا فَقُلْ حَسْبِىَ اللّٰهُ لَٓا اِلٰهَ اِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظٖيمِ<br>قُل… | `03 Lem'alar/11 On Birinci Lem’a.md:12` | Alta |
| `p465:1:image85.png` | En línea | مَنْ تَمَسَّكَ بِسُنَّتٖى عِنْدَ فَسَادِ اُمَّتٖى فَلَهُ اَجْرُ مِأَةِ شَهٖيدٍ | `03 Lem'alar/11 On Birinci Lem’a.md:17` | Alta |
| `p482:1:image86.png` | En línea | اَلْمَوْتُ حَقٌّ | `03 Lem'alar/11 On Birinci Lem’a.md:40` | Alta |
| `p486:1:image87.png` | En línea | فَاِنْ تَوَلَّوْا … اِلٰى اٰخِرِ | `03 Lem'alar/11 On Birinci Lem’a.md:46` | Alta |
| `p488:1:image88.png` | Independiente | فَاِنْ تَوَلَّوْا فَقُلْ حَسْبِىَ اللّٰهُ لَٓا اِلٰهَ اِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظٖيمِ | `03 Lem'alar/11 On Birinci Lem’a.md:48` | Alta |
| `p496:1:image89.png` | En línea | قُلْ اِنْ كُنْتُمْ تُحِبُّونَ اللّٰهَ فَاتَّبِعُونٖى يُحْبِبْكُمُ اللّٰهُ | `03 Lem'alar/11 On Birinci Lem’a.md:57` | Alta |
| `p505:1:image90.png` | En línea | كُلُّ بِدْعَةٍ ضَلَالَةٌ وَكُلُّ ضَلَالَةٍ فِى النَّارِ | `03 Lem'alar/11 On Birinci Lem’a.md:78` | Alta |
| `p505:2:image91.png` | En línea | اَلْيَوْمَ اَكْمَلْتُ لَكُمْ دٖينَكُمْ | `03 Lem'alar/11 On Birinci Lem’a.md:80` | Alta |
| `p512:1:image92.png` | En línea | اَدَّبَنٖى رَبّٖى فَاَحْسَنَ تَاْدٖيبٖى | `03 Lem'alar/11 On Birinci Lem’a.md:89` | Alta |
| `p512:2:image93.png` | En línea | بٖى اَدَبْ مَحْرُومْ بَاشَدْ اَزْ لُطْفِ رَبْ | `03 Lem'alar/11 On Birinci Lem’a.md:89` | Alta |
| `p521:1:image94.png` | En línea | فَاِنْ تَوَلَّوْا فَقُلْ حَسْبِىَ اللّٰهُ | `03 Lem'alar/11 On Birinci Lem’a.md:106` | Alta |
| `p521:2:image95.png` | En línea | لَقَدْ جَٓاءَكُمْ رَسُولٌ … اِلٰى اٰخِرِ | `03 Lem'alar/11 On Birinci Lem’a.md:106` | Alta |
| `p521:3:image96.png` | En línea | فَاِنْ تَوَلَّوْا | `03 Lem'alar/11 On Birinci Lem’a.md:106` | Alta |
| `p530:1:image97.png` | En línea | اَلْيَوْمَ اَكْمَلْتُ لَكُمْ دٖينَكُمْ | `03 Lem'alar/11 On Birinci Lem’a.md:119` | Alta |
| `p534:1:image98.png` | Independiente | اَللّٰهُمَّ ارْزُقْنَا اِتِّبَاعَ السُّنَّةِ السَّنِيَّةِ<br>رَبَّنَٓا اٰمَنَّا بِمَٓا اَنْزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاك… | `03 Lem'alar/11 On Birinci Lem’a.md:125` | Alta |
| `p538:1:image99.png` | En línea | قُلْ اِنْ كُنْتُمْ تُحِبُّونَ اللّٰهَ فَاتَّبِعُونٖى يُحْبِبْكُمُ اللّٰهُ | `03 Lem'alar/11 On Birinci Lem’a.md:125` | Alta |
| `p544:1:image100.png` | En línea | اَلْاِنْسَانُ عَبٖيدُ الْاِحْسَانِ | `03 Lem'alar/11 On Birinci Lem’a.md:142` | Alta |
| `p557:1:image101.png` | En línea | وَاِنَّكَ لَعَلٰى خُلُقٍ عَظٖيمٍ | `03 Lem'alar/11 On Birinci Lem’a.md:169` | Alta |
| `p561:1:image102.png` | En línea | فَاسْتَقِمْ كَمَٓا اُمِرْتَ | `03 Lem'alar/11 On Birinci Lem’a.md:173` | Alta |
| `p562:1:image103.png` | En línea | اَلْعَارِفُ تَكْفٖيهِ الْاِشَارَةُ | `03 Lem'alar/11 On Birinci Lem’a.md:181` | Alta |
| `p564:1:image104.png` | Independiente | اَللّٰهُمَّ صَلِّ عَلٰى جَامِعِ مَكَارِمِ الْاَخْلَاقِ وَ مَظْهَرِ سِرِّ (وَ اِنَّكَ لَعَلٰى خُلُقٍ عَظٖيمٍ) اَلَّذٖى قَالَ … | `03 Lem'alar/11 On Birinci Lem’a.md:183–185` | Alta |
| `p572:1:image105.png` | Independiente | بِاسْمِهٖ سُبْحَانَهُ<br> وَ اِنْ مِنْ شَىْءٍ اِلَّا يُسَبِّحُ بِحَمْدِهٖ<br>اَلسَّلَامُ عَلَيْكُمْ وَ عَلٰى اِخْوَانِكُمْ وَ رَح… | `03 Lem'alar/12 On İkinci Lem’a.md:8` | Alta |
| `p583:1:image106.png` | Independiente | وَكَاَيِّنْ مِنْ دَٓابَّةٍ لَا تَحْمِلُ رِزْقَهَا اَللّٰهُ يَرْزُقُهَا وَاِيَّاكُمْ ۞ اِنَّ اللّٰهَ هُوَ الرَّزَّاقُ ذُو ال… | `03 Lem'alar/12 On İkinci Lem’a.md:16` | Alta |
| `p598:1:image107.png` | Independiente | اَللّٰهُ الَّذٖى خَلَقَ سَبْعَ سَمٰوَاتٍ وَمِنَ الْاَرْضِ مِثْلَهُنَّ … اِلٰى اٰخِرِ | `03 Lem'alar/12 On İkinci Lem’a.md:52` | Alta |
| `p608:1:image108.png` | Independiente | تُسَبِّحُ لَهُ السَّمٰوَاتُ السَّبْعُ وَالْاَرْضُ وَمَنْ فٖيهِنَّ … اِلٰى اٰخِرِ<br>ثُمَّ اسْتَوٰٓى اِلَى السَّمَٓاءِ فَسَوّٰيه… | `03 Lem'alar/12 On İkinci Lem’a.md:84` | Alta |
| `p612:1:image109.png` | En línea | اَلسَّمَاءُ مَوْجٌ مَكْفُوفٌ | `03 Lem'alar/12 On İkinci Lem’a.md:92` | Alta |
| `p617:1:image110.png` | En línea | فَسَوّٰيهُنَّ سَبْعَ سَمٰوَاتٍ | `03 Lem'alar/12 On İkinci Lem’a.md:108` | Alta |
| `p622:1:image111.png` | En línea | فَسَوّٰيهُنَّ سَبْعَ سَمٰوَاتٍ | `03 Lem'alar/12 On İkinci Lem’a.md:116` | Alta |
| `p627:1:image112.png` | Independiente | اَللّٰهُمَّ صَلِّ عَلٰى شَمْسِ سَمَاءِ الرِّسَالَةِ وَ قَمَرِ فَلَكِ النُّبُوَّةِ وَ عَلٰى اٰلِهٖ وَ صَحْبِهٖ نُجُومِ الْهُد… | `03 Lem'alar/12 On İkinci Lem’a.md:140` | Alta |
| `p635:1:image113.png` | Independiente | Pendiente | — | Sin resolver |
| `p643:1:image114.png` | En línea | وَالْعَاقِبَةُ لِلْمُتَّقٖينَ | `03 Lem'alar/13 On Üçüncü Lem’a.md:19` | Alta |
| `p668:1:image115.png` | En línea | اِنَّ كَيْدَ الشَّيْطَانِ كَانَ ضَعٖيفًا | `03 Lem'alar/13 On Üçüncü Lem’a.md:57` | Alta |
| `p672:1:image116.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/13 On Üçüncü Lem’a.md:65` | Alta |
| `p672:2:image117.png` | En línea | فَاسْتَعِذْ | `03 Lem'alar/13 On Üçüncü Lem’a.md:65` | Alta |
| `p672:3:image118.png` | En línea | اَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجٖيمِ | `03 Lem'alar/13 On Üçüncü Lem’a.md:65` | Alta |
| `p679:1:image119.png` | Independiente | اِنَّ الْاِمْكَانَ الذَّاتِىَّ لَا يُنَافِى الْيَقٖينَ الْعِلْمِىَّ | `03 Lem'alar/13 On Üçüncü Lem’a.md:76` | Alta |
| `p681:1:image120.png` | Independiente | لَا عِبْرَةَ لِلْاِحْتِمَالِ الْغَيْرِ النَّاشِىءِ عَنْ دَلٖيلٍ | `03 Lem'alar/13 On Üçüncü Lem’a.md:80` | Alta |
| `p739:1:image121.png` | En línea | تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ | `03 Lem'alar/13 On Üçüncü Lem’a.md:201` | Alta |
| `p757:1:image122.png` | En línea | اَلْحَقُّ يَعْلُو وَلَا يُعْلٰى عَلَيْهِ | `03 Lem'alar/13 On Üçüncü Lem’a.md:236` | Alta |
| `p759:1:image123.png` | En línea | وَالْعَاقِبَةُ لِلْمُتَّقٖينَ | `03 Lem'alar/13 On Üçüncü Lem’a.md:242` | Alta |
| `p759:2:image124.png` | En línea | اَلْحَقُّ يَعْلُو وَلَا يُعْلٰى عَلَيْهِ | `03 Lem'alar/13 On Üçüncü Lem’a.md:242` | Alta |
| `p762:1:image125.png` | Independiente | فَمَا بَكَتْ عَلَيْهِمُ السَّمَٓاءُ وَ الْاَرْضُ | `03 Lem'alar/13 On Üçüncü Lem’a.md:246` | Alta |
| `p764:1:image126.png` | En línea | اَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجٖيمِ | `03 Lem'alar/13 On Üçüncü Lem’a.md:250` | Alta |
| `p775:1:image127.png` | En línea | وَ عَيْنُ الرِّضَا عَنْ كُلِّ عَيْبٍ كَلٖيلَةٌ | `03 Lem'alar/13 On Üçüncü Lem’a.md:267` | Alta |
| `p776:1:image128.png` | Independiente | وَمَٓا اُبَرِّئُ نَفْسٖٓى اِنَّ النَّفْسَ لَاَمَّارَةٌ بِالسُّٓوءِ اِلَّا مَا رَحِمَ رَبّٖى | `03 Lem'alar/13 On Üçüncü Lem’a.md:267` | Alta |
| `p784:1:image129.png` | Independiente | اَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجٖيمِ | `03 Lem'alar/13 On Üçüncü Lem’a.md:283` | Alta |
| `p786:1:image129.png` | En línea | اَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجٖيمِ | `03 Lem'alar/13 On Üçüncü Lem’a.md:283` | Alta |
| `p787:1:image130.png` | Independiente | اَسْتَعٖيذُ بِاللّٰهِ بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>قُلْ اَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ اِلٰهِ النَّاس… | `03 Lem'alar/13 On Üçüncü Lem’a.md:287` | Alta |
| `p790:1:image131.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ<br>رَبِّ اَعُوذُ بِكَ مِنْ هَمَزَات… | `03 Lem'alar/13 On Üçüncü Lem’a.md:291` | Alta |
| `p800:1:image132.png` | Independiente | بِاسْمِهٖ سُبْحَانَهُ<br> وَ اِنْ مِنْ شَىْءٍ اِلَّا يُسَبِّحُ بِحَمْدِهٖ<br>اَلسَّلَامُ عَلَيْكُمْ وَ رَحْمَةُ اللّٰهِ وَ بَرَكَا… | `03 Lem'alar/14 On Dördüncü Lem’a.md:11` | Alta |
| `p806:1:image133.png` | En línea | عَلَى الثَّوْرِ وَالْحُوتِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:19` | Alta |
| `p807:1:image134.png` | En línea | عَلَى الثَّوْرِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:19` | Alta |
| `p807:2:image135.png` | En línea | عَلَى الْحُوتِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:19` | Alta |
| `p815:1:image136.png` | En línea | وَالْعِلْمُ عِنْدَ اللّٰهِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:45` | Alta |
| `p815:2:image137.png` | En línea | اَلْاَرْضُ عَلَى الثَّوْرِ وَالْحُوتِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:47` | Alta |
| `p817:1:image138.png` | En línea | اَلْاَرْضُ عَلَى الثَّوْرِ وَالْحُوتِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:47` | Alta |
| `p819:1:image139.png` | En línea | عَلَى الثَّوْرِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:59` | Alta |
| `p819:2:image140.png` | En línea | عَلَى الْحُوتِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:59` | Alta |
| `p819:3:image139.png` | En línea | عَلَى الثَّوْرِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:59` | Alta |
| `p819:4:image140.png` | En línea | عَلَى الْحُوتِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:59` | Alta |
| `p820:1:image141.png` | En línea | عَلَى الثَّوْرِ وَالْحُوتِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:61` | Alta |
| `p821:1:image142.png` | Independiente | وَاللّٰهُ اَعْلَمُ بِالصَّوَابِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:61` | Alta |
| `p823:1:image143.png` | Independiente | رَبَّنَا لَا تُؤَاخِذْنَٓا اِنْ نَسٖينَٓا اَوْ اَخْطَاْنَا<br>سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ ا… | `03 Lem'alar/14 On Dördüncü Lem’a.md:65` | Alta |
| `p827:1:image144.png` | Independiente | لِيُذْهِبَ عَنْكُمُ الرِّجْسَ اَهْلَ الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهٖيرًا | `03 Lem'alar/14 On Dördüncü Lem’a.md:69` | Alta |
| `p832:1:image145.png` | Independiente | Pendiente | — | Sin resolver |
| `p838:1:image146.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p844:1:image147.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>قَالَتْ يَٓا اَيُّهَا الْمَلَؤُا اِنّٖٓى اُلْقِىَ اِلَىَّ كِتَابٌ كَرٖيمٌ ۞ اِنَّهُ م… | `03 Lem'alar/14 On Dördüncü Lem’a.md:88` | Alta |
| `p850:1:image148.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p852:1:image149.png` | En línea | بِسْمِ اللّٰهِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p853:1:image150.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p854:1:image151.png` | En línea | الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p854:2:image152.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p856:1:image152.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p861:1:image153.png` | En línea | وَ لِلّٰهِ الْمَثَلُ الْاَعْلٰى | `03 Lem'alar/14 On Dördüncü Lem’a.md:106` | Alta |
| `p861:2:image152.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p866:1:image152.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p869:1:image152.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p872:1:image152.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p875:1:image152.png` | En línea | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/14 On Dördüncü Lem’a.md:82` | Alta |
| `p879:1:image154.png` | En línea | اِيَّاكَ نَعْبُدُ | `03 Lem'alar/14 On Dördüncü Lem’a.md:134` | Alta |
| `p879:2:image155.png` | En línea | اِيَّاكَ نَعْبُدُ وَ اِيَّاكَ نَسْتَعٖينُ | `03 Lem'alar/14 On Dördüncü Lem’a.md:134` | Alta |
| `p879:3:image155.png` | En línea | اِيَّاكَ نَعْبُدُ وَ اِيَّاكَ نَسْتَعٖينُ | `03 Lem'alar/14 On Dördüncü Lem’a.md:134` | Alta |
| `p880:1:image156.png` | Independiente | وَمِنْ اٰيَاتِهٖ خَلْقُ السَّمٰوَاتِ وَالْاَرْضِ وَاخْتِلَافُ اَلْسِنَتِكُمْ وَ اَلْوَانِكُمْ | `03 Lem'alar/14 On Dördüncü Lem’a.md:138` | Alta |
| `p882:1:image155.png` | En línea | اِيَّاكَ نَعْبُدُ وَ اِيَّاكَ نَسْتَعٖينُ | `03 Lem'alar/14 On Dördüncü Lem’a.md:134` | Alta |
| `p888:1:image157.png` | Independiente | اِنَّ اللّٰهَ خَلَقَ الْاِنْسَانَ عَلٰى صُورَةِ الرَّحْمٰنِ –اَوْ كَمَا قَالَ– | `03 Lem'alar/14 On Dördüncü Lem’a.md:151` | Alta |
| `p892:1:image158.png` | Independiente | لَيْسَ كَمِثْلِهٖ شَىْءٌ وَهُوَ السَّمٖيعُ الْبَصٖيرُ | `03 Lem'alar/14 On Dördüncü Lem’a.md:157` | Alta |
| `p894:1:image159.png` | Independiente | وَلَهُ الْمَثَلُ الْاَعْلٰى فِى السَّمٰوَاتِ وَالْاَرْضِ وَهُوَ الْعَزٖيزُ الْحَكٖيمُ | `03 Lem'alar/14 On Dördüncü Lem’a.md:161` | Alta |
| `p899:1:image160.png` | Independiente | اَللّٰهُمَّ يَا رَحْمٰنُ يَا رَحٖيمُ بِحَقِّ بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ اِرْحَمْنَا كَمَا يَلٖيقُ بِرَحٖيمِيَّتِك… | `03 Lem'alar/14 On Dördüncü Lem’a.md:169` | Alta |
| `p910:1:image161.png` | Independiente | اَللّٰهُمَّ بِحَقِّ اَسْرَارِ بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ صَلِّ وَ سَلِّمْ عَلٰى مَنْ اَرْسَلْتَهُ رَحْمَةً لِلْع… | `03 Lem'alar/14 On Dördüncü Lem’a.md:180–182` | Alta |
| `p922:1:image162.png` | Independiente | بِاسْمِهٖ وَ اِنْ مِنْ شَىْءٍ اِلَّا يُسَبِّحُ بِحَمْدِهٖ<br>اَلسَّلَامُ عَلَيْكُمْ وَ رَحْمَةُ اللّٰهِ وَ بَرَكَاتُهُ | `03 Lem'alar/16 On Altıncı Lem’a.md:6` | Alta |
| `p962:1:image163.png` | Independiente | بِاسْمِهٖ سُبْحَانَهُ<br> وَ اِنْ مِنْ شَىْءٍ اِلَّا يُسَبِّحُ بِحَمْدِهٖ<br>اَلسَّلَامُ عَلَيْكُمْ وَ رَحْمَةُ اللّٰهِ وَ بَرَكَا… | `03 Lem'alar/16 On Altıncı Lem’a.md:57` | Alta |
| `p968:1:image164.png` | Independiente | حَتّٰٓى اِذَا بَلَغَ مَغْرِبَ الشَّمْسِ وَجَدَهَا تَغْرُبُ فٖى عَيْنٍ حَمِئَةٍ | `03 Lem'alar/16 On Altıncı Lem’a.md:63` | Alta |
| `p972:1:image165.png` | En línea | تَغْرُبُ فٖى عَيْنٍ حَمِئَةٍ | `03 Lem'alar/16 On Altıncı Lem’a.md:73` | Alta |
| `p973:1:image166.png` | En línea | عَيْنٍ | `03 Lem'alar/16 On Altıncı Lem’a.md:77` | Alta |
| `fn13.p1:1:image166.png` | En línea | عَيْنٍ | `03 Lem'alar/16 On Altıncı Lem’a.md:77` | Alta |
| `fn13.p1:2:image384.png` | En línea | فٖى عَيْنٍ حَمِئَةٍ | `03 Lem'alar/16 On Altıncı Lem’a.md:155` | Alta |
| `p992:1:image167.png` | Independiente | بِاسْمِهٖ وَ اِنْ مِنْ شَىْءٍ اِلَّا يُسَبِّحُ بِحَمْدِهٖ<br>اَلسَّلَامُ عَلَيْكُمْ وَ رَحْمَةُ اللّٰهِ وَ بَرَكَاتُهُ | `03 Lem'alar/16 On Altıncı Lem’a.md:105` | Alta |
| `p1001:1:image168.png` | En línea | وَ يَعْلَمُ مَا فِى الْاَرْحَامِ | `03 Lem'alar/16 On Altıncı Lem’a.md:129` | Alta |
| `p1006:1:image169.png` | Independiente | اَلْبَاقٖى هُوَ الْبَاقٖى | `03 Lem'alar/16 On Altıncı Lem’a.md:145` | Alta |
| `p1008:1:image170.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/16 On Altıncı Lem’a.md:149` | Alta |
| `p1016:1:image171.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/17 On Yedinci Lem’a.md:8` | Alta |
| `p1061:1:image172.png` | Independiente | وَمَا دُعَٓاءُ الْكَافِرٖينَ اِلَّا فٖى ضَلَالٍ | `03 Lem'alar/17 On Yedinci Lem’a.md:78` | Alta |
| `p1066:1:image173.png` | En línea | اللَّهُمَّ اغْفِرْ لِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ | `03 Lem'alar/17 On Yedinci Lem’a.md:106` | Alta |
| `p1071:1:image174.png` | En línea | اِنَّا لِلّٰهِ وَاِنَّٓا اِلَيْهِ رَاجِعُونَ | `03 Lem'alar/17 On Yedinci Lem’a.md:114` | Alta |
| `p1076:1:image175.png` | Independiente | هَدٰينَا اللّٰهُ وَ اِيَّاكُمْ اِلَى الصِّرَاطِ الْمُسْتَقٖيمِ | `03 Lem'alar/17 On Yedinci Lem’a.md:124` | Alta |
| `p1084:1:image176.png` | En línea | وَ الْعَدَمُ الْمُطْلَقُ لَا يُثْبَتُ اِلَّا بِمُشْكِلَاتٍ عَظٖيمَةٍ | `03 Lem'alar/17 On Yedinci Lem’a.md:135` | Alta |
| `p1092:1:image177.png` | En línea | اَلْحَرٖيصُ خَائِبٌ خَاسِرٌ | `03 Lem'alar/17 On Yedinci Lem’a.md:144` | Alta |
| `p1112:1:image178.png` | Independiente | اَلْمُسْتَرٖيحُ الْعَاطِلُ شَاكٍ مِنْ عُمْرِهٖ وَ السَّاعِىُ الْعَامِلُ شَاكِرٌ | `03 Lem'alar/17 On Yedinci Lem’a.md:179` | Alta |
| `p1120:1:image179.png` | En línea | وَ اَوْحٰى رَبُّكَ اِلَى النَّحْلِ | `03 Lem'alar/17 On Yedinci Lem’a.md:203` | Alta |
| `p1122:1:image180.png` | En línea | وَسِعَتْ رَحْمَتُهُ كُلَّ شَىْءٍ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p1123:1:image181.png` | En línea | وَ اِنْ مِنْ شَىْءٍ اِلَّا يُسَبِّحُ بِحَمْدِهٖ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p1124:1:image182.png` | En línea | اِنَّمَٓا اَمْرُهُٓ اِذَٓا اَرَادَ شَيْئًا اَنْ يَقُولَ لَهُ كُنْ فَيَكُونُ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p1125:1:image183.png` | En línea | فَسُبْحَانَ الَّذٖى بِيَدِهٖ مَلَكُوتُ كُلِّ شَىْءٍ وَاِلَيْهِ تُرْجَعُونَ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p1130:1:image184.png` | En línea | اَقٖيمُوا الصَّلٰوةَ | `03 Lem'alar/17 On Yedinci Lem’a.md:210` | Alta |
| `p1144:1:image185.png` | En línea | قُلِ اللّٰهُمَّ مَالِكَ الْمُلْكِ | `03 Lem'alar/17 On Yedinci Lem’a.md:232` | Alta |
| `p1151:1:image186.png` | En línea | كُلُّ اٰتٍ قَرٖيبٌ | `03 Lem'alar/17 On Yedinci Lem’a.md:245` | Alta |
| `p1157:1:image187.png` | Independiente | لَا اِلٰهَ اِلَّا اَنْتَ وَحْدَكَ لَا شَرٖيكَ لَكَ اٰخِرُ الْكَلَامِ فِى الدُّنْيَا وَ اَوَّلُ الْكَلَامِ فِى الْاٰخِرَةِ و… | `03 Lem'alar/17 On Yedinci Lem’a.md:259` | Alta |
| `p1163:1:image188.png` | Independiente | اِنَّ لِلّٰهِ اَنْ يَخْتَبِرَ عَبْدَهُ وَ لَيْسَ لِلْعَبْدِ اَنْ يَخْتَبِرَ رَبَّهُ | `03 Lem'alar/17 On Yedinci Lem’a.md:268` | Alta |
| `p1166:1:image189.png` | En línea | وَمَا عَلَى الرَّسُولِ اِلَّا الْبَلَاغُ | `03 Lem'alar/17 On Yedinci Lem’a.md:274` | Alta |
| `p1167:1:image190.png` | Independiente | اِنَّكَ لَا تَهْدٖى مَنْ اَحْبَبْتَ وَلٰكِنَّ اللّٰهَ يَهْدٖى مَنْ يَشَٓاءُ | `03 Lem'alar/17 On Yedinci Lem’a.md:274` | Alta |
| `p1172:1:image191.png` | En línea | طُوبٰى لِمَنْ عَرَفَ حَدَّهُ وَلَمْ يَتَجَاوَزْ طَوْرَهُ | `03 Lem'alar/17 On Yedinci Lem’a.md:286` | Alta |
| `p1177:1:image192.png` | Independiente | هَلَكَ النَّاسُ اِلَّا الْعَالِمُونَ وَهَلَكَ الْعَالِمُونَ اِلَّا الْعَامِلُونَ وَهَلَكَ الْعَامِلُونَ اِلَّا الْمُخْلِصُون… | `03 Lem'alar/17 On Yedinci Lem’a.md:294` | Alta |
| `p1180:1:image193.png` | Independiente | وَ مَا اَنَا بِالْبَاغٖى عَلَى الْحُبِّ رِشْوَةً ضَعٖيفٌ هَوًى يُبْغٰى عَلَيْهِ ثَوَابٌ | `03 Lem'alar/17 On Yedinci Lem’a.md:300` | Alta |
| `p1182:1:image194.png` | En línea | وَلَا تَاْكُلُوا مِمَّا لَمْ يُذْكَرِ اسْمُ اللّٰهِ عَلَيْهِ | `03 Lem'alar/17 On Yedinci Lem’a.md:306` | Alta |
| `p1200:1:image195.png` | En línea | يَا بَاقٖى اَنْتَ الْبَاقٖى | `03 Lem'alar/17 On Yedinci Lem’a.md:343` | Alta |
| `p1206:1:image196.png` | En línea | لَا اِلٰهَ اِلَّا اللّٰهُ | `03 Lem'alar/17 On Yedinci Lem’a.md:355` | Alta |
| `p1212:1:image197.png` | Independiente | فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ۞ وَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ | `03 Lem'alar/17 On Yedinci Lem’a.md:360` | Alta |
| `p1218:1:image198.png` | Independiente | فَارْجِعِ الْبَصَرَ هَلْ تَرٰى مِنْ فُطُورٍ | `03 Lem'alar/17 On Yedinci Lem’a.md:368` | Alta |
| `p1225:1:image199.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/17 On Yedinci Lem’a.md:378` | Alta |
| `p1239:1:image200.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>كُلُوا وَ اشْرَبُوا وَ لَا تُسْرِفُوا | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:10` | Alta |
| `p1263:1:image201.png` | En línea | لَا يَعُولُ مَنِ اقْتَصَدَ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:46` | Alta |
| `p1266:1:image202.png` | En línea | اِنَّ اللّٰهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتٖينُ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:52` | Alta |
| `p1266:2:image203.png` | En línea | وَمَا مِنْ دَٓابَّةٍ فِى الْاَرْضِ اِلَّا عَلَى اللّٰهِ رِزْقُهَا | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:52` | Alta |
| `p1269:1:image204.png` | En línea | اِنَّ الضَّرُورَةَ تُقَدَّرُ بِقَدْرِهَا | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:62` | Alta |
| `p1285:1:image205.png` | Independiente | لَا اِسْرَافَ فِى الْخَيْرِ كَمَا لَا خَيْرَ فِى الْاِسْرَافِ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:100` | Alta |
| `p1298:1:image206.png` | Independiente | اَلْقَنَاعَةُ كَنْزٌ لَا يَفْنٰى | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:119` | Alta |
| `p1303:1:image207.png` | Independiente | عَزَّ مَنْ قَنَعَ ذَلَّ مَنْ طَمَعَ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:123` | Alta |
| `p1308:1:image208.png` | En línea | كُلُوا وَ اشْرَبُوا وَ لَا تُسْرِفُوا | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:131` | Alta |
| `p1310:1:image209.png` | Independiente | جَمَعْتُ الطِّبَّ فِى الْبَيْتَيْنِ جَمْعًا وَ حُسْنُ الْقَوْلِ فٖى قَصْرِ الْكَلَامِ :<br>فَقَلِّلْ اِنْ اَكَلْتَ وَ بَعْدَ ا… | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:133–135` | Alta |
| `p1321:1:image210.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/19 On Dokuzuncu Lem’a.md:144` | Alta |
| `p1331:1:image211.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/20 Yirminci Lem’a.md:10` | Alta |
| `p1334:1:image212.png` | Independiente | اِنَّٓا اَنْزَلْنَٓا اِلَيْكَ الْكِتَابَ بِالْحَقِّ فَاعْبُدِ اللّٰهَ مُخْلِصًا لَهُ الدّٖينَ ۞ اَلَا لِلّٰهِ الدّٖينُ الْخ… | `03 Lem'alar/20 Yirminci Lem’a.md:10` | Alta |
| `p1337:1:image213.png` | Independiente | هَلَكَ النَّاسُ اِلَّا الْعَالِمُونَ وَهَلَكَ الْعَالِمُونَ اِلَّا الْعَامِلُونَ وَهَلَكَ الْعَامِلُونَ اِلَّا الْمُخْلِصُون… | `03 Lem'alar/20 Yirminci Lem’a.md:14` | Alta |
| `p1349:1:image214.png` | En línea | اِنْ اَجْرِىَ اِلَّا عَلَى اللّٰهِ | `03 Lem'alar/20 Yirminci Lem’a.md:34` | Alta |
| `p1349:2:image215.png` | En línea | وَمَا عَلَى الرَّسُولِ اِلَّا الْبَلَاغُ | `03 Lem'alar/20 Yirminci Lem’a.md:34` | Alta |
| `fn24.p1:1:image385.png` | En línea | وَ يُؤْثِرُونَ عَلٰى اَنْفُسِهِمْ وَلَوْ كَانَ بِهِمْ خَصَاصَةٌ | `03 Lem'alar/20 Yirminci Lem’a.md:162` | Alta |
| `fn25.p1:1:image386.png` | En línea | مَنْ طَلَبَ وَ جَدَّ وَجَدَ | `03 Lem'alar/20 Yirminci Lem’a.md:164` | Alta |
| `p1384:1:image216.png` | En línea | وَ قَالَ نِسْوَةٌ فِى الْمَدٖينَةِ | `03 Lem'alar/20 Yirminci Lem’a.md:94` | Alta |
| `p1384:2:image217.png` | En línea | قَالَ | `03 Lem'alar/20 Yirminci Lem’a.md:94` | Alta |
| `p1385:1:image218.png` | En línea | قَالَتِ الْاَعْرَابُ | `03 Lem'alar/20 Yirminci Lem’a.md:94` | Alta |
| `p1388:1:image219.png` | En línea | وَلَا تَنَازَعُوا فَتَفْشَلُوا وَتَذْهَبَ رٖيحُكُمْ | `03 Lem'alar/20 Yirminci Lem’a.md:106` | Alta |
| `p1388:2:image220.png` | En línea | وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوٰى | `03 Lem'alar/20 Yirminci Lem’a.md:106` | Alta |
| `p1395:1:image221.png` | Independiente | وَاِذَا مَرُّوا بِاللَّغْوِ مَرُّوا كِرَامًا | `03 Lem'alar/20 Yirminci Lem’a.md:115` | Alta |
| `p1408:1:image222.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/20 Yirminci Lem’a.md:152` | Alta |
| `p1420:1:image223.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>وَلَا تَنَازَعُوا فَتَفْشَلُوا وَتَذْهَبَ رٖيحُكُمْ ۞ وَ قُومُوا لِلّٰهِ قَانِتٖينَ ۞ … | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:12` | Alta |
| `p1423:1:image224.png` | En línea | وَلَا تَشْتَرُوا بِاٰيَاتٖى ثَمَنًا قَلٖيلًا | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:18` | Alta |
| `p1425:1:image225.png` | Independiente | اِنَّ النَّفْسَ لَاَمَّارَةٌ بِالسُّٓوءِ اِلَّا مَا رَحِمَ رَبّٖى | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:20` | Alta |
| `p1446:1:image226.png` | En línea | وَ يُؤْثِرُونَ عَلٰٓى اَنْفُسِهِمْ | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:55` | Alta |
| `p1456:1:image227.png` | Independiente | كُلُّ نَفْسٍ ذَٓائِقَةُ الْمَوْتِ ۞ اِنَّكَ مَيِّتٌ وَاِنَّهُمْ مَيِّتُونَ | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:74` | Alta |
| `p1458:1:image228.png` | Independiente | اَكْثِرُوا ذِكْرَ هَادِمِ اللَّذَّاتِ –اَوْ كَمَا قَالَ– | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:74` | Alta |
| `p1462:1:image229.png` | Independiente | وَلَا تَشْتَرُوا بِاٰيَاتٖى ثَمَنًا قَلٖيلًا | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:88` | Alta |
| `p1475:1:image230.png` | Independiente | اَللّٰهُمَّ بِحَقِّ سُورَةِ الْاِخْلَاصِ اِجْعَلْنَا مِنْ عِبَادِكَ الْمُخْلِصٖينَ الْمُخْلَصٖينَ اٰمٖينَ اٰمٖينَ<br>سُبْحَانَك… | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:118` | Alta |
| `p1483:1:image231.png` | Independiente | يُوزَنُ مِدَادُ الْعُلَمَاءِ بِدِمَاءِ الشُّهَدَاءِ –اَوْ كَمَا قَالَ– | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:125` | Alta |
| `p1486:1:image232.png` | Independiente | مَنْ تَمَسَّكَ بِسُنَّتٖى عِنْدَ فَسَادِ اُمَّتٖى فَلَهُ اَجْرُ مِاَةِ شَهٖيدٍ –اَوْ كَمَا قَالَ– | `03 Lem'alar/21 Yirmi Birinci Lem’a.md:127` | Alta |
| `p1500:1:image233.png` | Independiente | بِاسْمِهٖ سُبْحَانَهُ | `03 Lem'alar/22 Yirmi İkinci Lem’a.md:6` | Alta |
| `p1510:1:image234.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>وَمَنْ يَتَوَكَّلْ عَلَى اللّٰهِ فَهُوَ حَسْبُهُ اِنَّ اللّٰهَ بَالِغُ اَمْرِهٖ قَدْ ج… | `03 Lem'alar/22 Yirmi İkinci Lem’a.md:16` | Alta |
| `p1543:1:image235.png` | En línea | اَلْمَوْتُ حَقٌّ | `03 Lem'alar/22 Yirmi İkinci Lem’a.md:89` | Alta |
| `p1560:1:image236.png` | Independiente | رَبِّ اَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطٖينِ ۞ وَاَعُوذُ بِكَ رَبِّ اَنْ يَحْضُرُونِ<br>اَللّٰهُمَّ يَا حَافِظُ يَا حَفٖيظُ … | `03 Lem'alar/22 Yirmi İkinci Lem’a.md:116` | Alta |
| `p1568:1:image237.png` | Independiente | Pendiente | — | Sin resolver |
| `p1578:1:image238.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>قَالَتْ رُسُلُهُمْ اَفِى اللّٰهِ شَكٌّ فَاطِرِ السَّمٰوَاتِ وَالْاَرْضِ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:15` | Alta |
| `p1590:1:image239.png` | En línea | اَوْجَدَتْهُ الْاَسْبَابُ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:24` | Alta |
| `p1592:1:image240.png` | En línea | تَشَكَّلَ بِنَفْسِهٖ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:26` | Alta |
| `p1594:1:image241.png` | En línea | اِقْتَضَتْهُ الطَّبٖيعَةُ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:28` | Alta |
| `p1618:1:image242.png` | En línea | اَلْوَاحِدُ لَا يَصْدُرُ اِلَّا عَنِ الْوَاحِدِ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:51` | Alta |
| `p1626:1:image243.png` | En línea | تَشَكَّلَ بِنَفْسِهٖ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:58` | Alta |
| `p1650:1:image244.png` | En línea | اِقْتَضَتْهُ الطَّبٖيعَةُ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:77` | Alta |
| `p1690:1:image245.png` | En línea | اَفِى اللّٰهِ شَكٌّ فَاطِرِ السَّمٰوَاتِ وَالْاَرْضِ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:133` | Alta |
| `p1727:1:image246.png` | Independiente | مَا خَلْقُكُمْ وَلَا بَعْثُكُمْ اِلَّا كَنَفْسٍ وَاحِدَةٍ ۞ وَمَٓا اَمْرُ السَّاعَةِ اِلَّا كَلَمْحِ الْبَصَرِ اَوْ هُوَ اَق… | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:192` | Alta |
| `p1730:1:image247.png` | En línea | وَهُوَ عَلٰى كُلِّ شَىْءٍ قَدٖيرٌ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:194` | Alta |
| `p1744:1:image248.png` | Independiente | وَمَٓا اَمْرُ السَّاعَةِ اِلَّا كَلَمْحِ الْبَصَرِ اَوْ هُوَ اَقْرَبُ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:218` | Alta |
| `p1757:1:image249.png` | Independiente | اَلْحَمْدُ لِلّٰهِ عَلٰى دٖينِ الْاِسْلَامِ وَ كَمَالِ الْاٖيمَانِ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:240` | Alta |
| `p1758:1:image250.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:240` | Alta |
| `p1759:1:image251.png` | Independiente | اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/23 Yirmi Üçüncü Lem’a.md:240` | Alta |
| `p1770:1:image252.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>يَا اَيُّهَا النَّبِىُّ قُلْ لِاَزْوَاجِكَ وَبَنَاتِكَ وَنِسَٓاءِ الْمُؤْمِنٖينَ يُدْن… | `03 Lem'alar/24 Yirmi Dördüncü Lem’a.md:10` | Alta |
| `p1794:1:image253.png` | En línea | تَنَاكَحُوا تَكَاثَرُوا فَاِنّٖى اُبَاهٖى بِكُمُ الْاُمَمَ –اَوْ كَمَا قَالَ | `03 Lem'alar/24 Yirmi Dördüncü Lem’a.md:50` | Alta |
| `p1801:1:image254.png` | Independiente | بِاسْمِهٖ سُبْحَانَهُ | `03 Lem'alar/24 Yirmi Dördüncü Lem’a.md:64` | Alta |
| `p1827:1:image255.png` | Independiente | اَلْبَاقٖى هُوَ الْبَاقٖى | `03 Lem'alar/24 Yirmi Dördüncü Lem’a.md:117` | Alta |
| `p1834:1:image256.png` | Independiente | Pendiente | — | Sin resolver |
| `p1850:1:image257.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>اَلَّذٖينَ اِذَٓا اَصَابَتْهُمْ مُصٖيبَةٌ قَالُٓوا اِنَّا لِلّٰهِ وَاِنَّٓا اِلَيْهِ ر… | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:13` | Alta |
| `p1856:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1862:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1871:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1880:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1889:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1899:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1905:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1910:1:image259.png` | Independiente | اِنَّمَا الْاَشْيَاءُ تُعْرَفُ بِاَضْدَادِهَا | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:73` | Alta |
| `p1915:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1926:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1942:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1949:1:image260.png` | Independiente | اَلْحَمْدُ لِلّٰهِ عَلٰى كُلِّ حَالٍ | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:122` | Alta |
| `p1951:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1959:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1966:1:image261.png` | Independiente | قُلْ مَا يَعْبَؤُا بِكُمْ رَبّٖى لَوْلَا دُعَٓاؤُكُمْ | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:134` | Alta |
| `p1969:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1979:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1989:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p1995:1:image262.png` | Independiente | اَشَدُّ النَّاسِ بَلَاءً اَلْاَنْبِيَاءُ ثُمَّ الْاَوْلِيَاءُ اَلْاَمْثَلُ فَالْاَمْثَلُ –اَوْ كَمَا قَالَ– | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:159` | Alta |
| `p2002:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2006:1:image263.png` | En línea | اِنَّ الْاِنْسَانَ لَيَطْغٰى ۞ اَنْ رَاٰهُ اسْتَغْنٰى | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:170` | Alta |
| `p2009:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2022:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2030:1:image264.png` | En línea | لِكُلِّ مُصٖيبَةٍ اِنَّا لِلّٰهِ وَاِنَّٓا اِلَيْهِ رَاجِعُونَ | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:200` | Alta |
| `p2032:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2044:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2053:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2061:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2072:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2084:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2093:1:image258.png` | Independiente | Pendiente | — | Sin resolver |
| `p2102:1:image265.png` | Independiente | اَلْحَمْدُ لِلّٰهِ الَّذٖى هَدٰينَا لِهٰذَا وَمَا كُنَّا لِنَهْتَدِىَ لَوْلَٓا اَنْ هَدٰينَا اللّٰهُ لَقَدْ جَٓاءَتْ رُسُلُ … | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:271` | Alta |
| `p2106:1:image266.png` | Independiente | وَهُوَ لِكُلِّ دَاءٍ دَوَاءٌ | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:275` | Alta |
| `p2110:1:image267.png` | En línea | وَهُوَ لِكُلِّ دَاءٍ دَوَاءٌ | `03 Lem'alar/25 Yirmi Beşinci Lem’a.md:279` | Alta |
| `p2135:1:image268.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>كٓهٰيٰعٓصٓ ۞ ذِكْرُ رَحْمَتِ رَبِّكَ عَبْدَهُ زَكَرِيَّا ۞ اِذْ نَادٰى رَبَّهُ نِدَٓاء… | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:26` | Alta |
| `p2153:1:image269.png` | En línea | اَلسَّبَبُ كَالْفَاعِلِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:57` | Alta |
| `p2173:1:image270.png` | En línea | كُنْ فَيَكُونُ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p2173:2:image271.png` | En línea | Pendiente | — | Sin resolver |
| `p2208:1:image272.png` | En línea | كُلُّ نَفْسٍ ذَٓائِقَةُ الْمَوْتِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:150` | Alta |
| `p2209:1:image272.png` | En línea | كُلُّ نَفْسٍ ذَٓائِقَةُ الْمَوْتِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:150` | Alta |
| `p2212:1:image273.png` | En línea | وَ بَشِّرِ الَّذٖينَ اٰمَنُوا … اِلٰى اٰخِرِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:160` | Alta |
| `p2216:1:image274.png` | Independiente | لَيْتَ الشَّبَابَ يَعُودُ يَوْمًا فَاُخْبِرَهُ بِمَا فَعَلَ الْمَشٖيبُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:164` | Alta |
| `p2226:1:image275.png` | Independiente | حُبُّ الدُّنْيَا رَاْسُ كُلِّ خَطٖيئَةٍ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:178` | Alta |
| `p2232:1:image276.png` | En línea | يَوْمًا يَجْعَلُ الْوِلْدَانَ شٖيبًا | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:185` | Alta |
| `p2233:1:image277.png` | En línea | حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكٖيلُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:185` | Alta |
| `p2235:1:image278.png` | Independiente | غَرٖيبَمْ بٖى كَسَمْ ضَعٖيفَمْ نَاتُوَانَمْ اَلْاَمَانْ گُويَمْ عَفُوْ جُويَمْ مَدَدْ خٰواهَمْ زِدَرْگَاهَتْ اِلٰهٖى | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:187` | Alta |
| `p2248:1:image279.png` | Independiente | وَلَوْلَا الْبَهَائِمُ الرُّتَّعُ وَالصُّبْيَانُ الرُّضَّعُ … اِلٰى اٰخِرِ – اَوْ كَمَا قَالَ– | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:589` | Alta |
| `p2250:1:image280.png` | Independiente | وَ لَوْلَا الشُّيُوخُ الرُّكَّعُ لَصُبَّ عَلَيْكُمُ الْبَلَاءُ صَبًّا | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:202` | Alta |
| `p2253:1:image281.png` | Independiente | اِمَّا يَبْلُغَنَّ عِنْدَكَ الْكِبَرَ اَحَدُهُمَٓا اَوْ كِلَاهُمَا فَلَا تَقُلْ لَهُمَٓا اُفٍّ وَلَا تَنْهَرْهُمَا وَقُلْ ل… | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:206` | Alta |
| `p2279:1:image282.png` | En línea | كُنْ فَيَكُونُ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p2280:1:image282.png` | En línea | كُنْ فَيَكُونُ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p2282:1:image283.png` | En línea | اِنَّ الَّذٖينَ تَدْعُونَ مِنْ دُونِ اللّٰهِ لَنْ يَخْلُقُوا ذُبَابًا وَلَوِ اجْتَمَعُوا لَهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:266` | Alta |
| `p2285:1:image284.png` | Independiente | مَا خَلْقُكُمْ وَلَا بَعْثُكُمْ اِلَّا كَنَفْسٍ وَاحِدَةٍ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:268` | Alta |
| `p2286:1:image282.png` | En línea | كُنْ فَيَكُونُ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p2304:1:image285.png` | Independiente | كُلُّ شَىْءٍ هَالِكٌ اِلَّا وَجْهَهُ لَهُ الْحُكْمُ وَاِلَيْهِ تُرْجَعُونَ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:297` | Alta |
| `p2311:1:image286.png` | Independiente | فَاِنْ تَوَلَّوْا فَقُلْ حَسْبِىَ اللّٰهُ لَٓا اِلٰهَ اِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظٖيمِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:305` | Alta |
| `p2312:1:image287.png` | En línea | كُلُّ شَىْءٍ هَالِكٌ اِلَّا وَجْهَهُ… اِلٰى اٰخِرِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:309` | Alta |
| `p2327:1:image288.png` | Independiente | لَوْلَا مُفَارَقَةُ الْاَحْبَابِ مَا وَجَدَتْ لَهَا الْمَنَايَا اِلٰى اَرْوَاحِنَا سُبُلًا | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:336` | Alta |
| `p2332:1:image289.png` | Independiente | لِدُوا لِلْمَوْتِ وَابْنُوا لِلْخَرَابِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:346` | Alta |
| `p2338:1:image290.png` | Independiente | سَبَّحَ لِلّٰهِ مَا فِى السَّمٰوَاتِ وَالْاَرْضِ وَهُوَ الْعَزٖيزُ الْحَكٖيمُ ۞ لَهُ مُلْكُ السَّمٰوَاتِ وَ الْاَرْضِ يُحْي… | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:354` | Alta |
| `p2347:1:image291.png` | Independiente | اَلْحَمْدُ لِلّٰهِ عَلٰى نُورِ الْاٖيمَانِ الْمُصَوِّرِ مَا يُتَوَهَّمُ اَجَانِبَ اَعْدَاءً اَمْوَاتًا مُوَحِّشٖينَ اَيْتَام… | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:374` | Alta |
| `p2350:1:image292.png` | Independiente | اَلْحَمْدُ لِلّٰهِ عَلٰى نُورِ الْاٖيمَانِ الْمُصَوِّرِ لِلدَّارَيْنِ مَمْلُوؤَتَيْنِ مِنَ النِّعْمَةِ وَ الرَّحْمَةِ لِكُل… | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:380` | Alta |
| `p2356:1:image293.png` | Independiente | خَيْرُ شَبَابِكُمْ مَنْ تَشَبَّهَ بِكُهُولِكُمْ وَشَرُّ كُهُولِكُمْ مَنْ تَشَبَّهَ بِشَبَابِكُمْ –اَوْ كَمَا قَالَ– | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:394` | Alta |
| `p2362:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2364:1:image295.png` | Independiente | حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكٖيلُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2366:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2368:1:image295.png` | En línea | حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكٖيلُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2368:2:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2370:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2372:1:image295.png` | En línea | حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكٖيلُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2373:1:image296.png` | En línea | Pendiente | — | Sin resolver |
| `p2373:2:image297.png` | En línea | كُنْ | `03 Lem'alar/17 On Yedinci Lem’a.md:205` | Alta |
| `p2374:1:image295.png` | Independiente | حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكٖيلُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2376:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2378:1:image298.png` | En línea | نَا | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:422` | Alta |
| `p2378:2:image299.png` | En línea | حَسْبُنَا | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:422` | Alta |
| `p2378:3:image299.png` | En línea | حَسْبُنَا | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:422` | Alta |
| `p2378:4:image295.png` | En línea | حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكٖيلُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2378:5:image298.png` | En línea | نَا | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:422` | Alta |
| `p2378:6:image299.png` | En línea | حَسْبُنَا | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:422` | Alta |
| `p2380:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2386:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2388:1:image295.png` | En línea | حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكٖيلُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2393:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2395:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2397:1:image300.png` | Independiente | اَللّٰهُ نُورُ السَّمٰوَاتِ وَالْاَرْضِ … اِلٰى اٰخِرِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:448` | Alta |
| `p2398:1:image294.png` | En línea | حَسْبُنَا اللّٰهُ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:408` | Alta |
| `p2413:1:image301.png` | En línea | وَالْكَاظِمٖينَ الْغَيْظَ وَالْعَافٖينَ عَنِ النَّاسِ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:489` | Alta |
| `p2434:1:image302.png` | Independiente | عَسٰٓى اَنْ تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَكُمْ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:536` | Alta |
| `p2440:1:image303.png` | Independiente | اَلْخَيْرُ فٖى مَا اخْتَارَهُ اللّٰهُ ۞ عَسٰٓى اَنْ تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَكُمْ | `03 Lem'alar/26 Yirmi Altıncı Lem’a.md:558` | Alta |
| `p2468:1:image304.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>وَمَا خَلَقْتُ الْجِنَّ وَالْاِنْسَ اِلَّا لِيَعْبُدُونِ ۞ مَٓا اُرٖيدُ مِنْهُمْ مِنْ … | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:9` | Alta |
| `p2475:1:image305.png` | En línea | لَمْ يَلِدْ وَ لَمْ يُولَدْ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:23` | Alta |
| `p2475:2:image305.png` | En línea | لَمْ يَلِدْ وَ لَمْ يُولَدْ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:23` | Alta |
| `p2481:1:image306.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>اَوْ هُمْ قَٓائِلُونَ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:29` | Alta |
| `p2483:1:image307.png` | En línea | قَٓائِلُونَ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:31` | Alta |
| `p2483:2:image308.png` | En línea | اَوْ هُمْ قَٓائِلُونَ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:31` | Alta |
| `p2496:1:image309.png` | Independiente | اَلْفُ اَلْفِ صَلَاةٍ وَ اَلْفُ اَلْفِ سَلَامٍ عَلَيْكَ يَا رَسُولَ اللّٰهِ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:53` | Alta |
| `p2501:1:image310.png` | Independiente | اَلصَّلَاةُ وَ السَّلَامُ عَلَيْكَ يَا رَسُولَ اللّٰه | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:65` | Alta |
| `p2503:1:image311.png` | Independiente | Pendiente | — | Sin resolver |
| `p2517:1:image312.png` | Independiente | قُلِ اللّٰهُ ثُمَّ ذَرْهُمْ فٖى خَوْضِهِمْ يَلْعَبُونَ ۞ مَا لِلتُّرَابِ وَ لِرَبِّ الْاَرْبَابِ<br>سُبْحَانَ مَنْ تَقَدَّسَ ع… | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:87` | Alta |
| `p2528:1:image313.png` | Independiente | قَالَ مُحْيِى الدّٖينِ : تَحْرُمُ مُطَالَعَةُ كُتُبِنَا عَلٰى مَنْ لَيْسَ مِنَّا | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:100` | Alta |
| `p2535:1:image314.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:106` | Alta |
| `p2546:1:image314.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:106` | Alta |
| `p2548:1:image315.png` | En línea | اِنَّ النَّفْسَ لَاَمَّارَةٌ بِالسُّٓوءِ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:122` | Alta |
| `p2548:2:image316.png` | En línea | اَعْدٰى عَدُوِّكَ نَفْسُكَ الَّتٖى بَيْنَ جَنْبَيْكَ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:124` | Alta |
| `p2550:1:image317.png` | Independiente | مَنِ اتَّخَذَ اِلٰهَهُ هَوٰيهُ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:126` | Alta |
| `p2553:1:image318.png` | Independiente | اَللّٰهُمَّ احْفَظْنَا مِنْ شَرِّ النَّفْسِ وَالشَّيْطَانِ وَمِنْ شَرِّ الْجِنِّ وَالْاِنْسَانِ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:130` | Alta |
| `p2562:1:image319.png` | Independiente | خَالِدٖينَ فٖيهَا اَبَدًا | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:136` | Alta |
| `p2563:1:image320.png` | En línea | خَالِدٖينَ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:138` | Alta |
| `p2611:1:image321.png` | En línea | مَنْ اَصْحَابُ الصِّرَاطِ السَّوِىِّ وَ مَنِ اهْتَدٰى | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:195` | Alta |
| `p2629:1:image322.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>لَا يَسَّمَّعُونَ اِلَى الْمَلَاِ الْاَعْلٰى وَيُقْذَفُونَ مِنْ كُلِّ جَانِبٍ ۞ دُحُور… | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:220` | Alta |
| `p2638:1:image323.png` | Independiente | وَلَقَدْ زَيَّنَّا السَّمَٓاءَ الدُّنْيَا بِمَصَابٖيحَ وَجَعَلْنَاهَا رُجُومًا لِلشَّيَاطٖينِ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:234` | Alta |
| `p2651:1:image324.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/28 Yirmi Sekizinci Lem’a.md:266` | Alta |
| `p2659:1:image325.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:6` | Alta |
| `p2665:1:image326.png` | Independiente | لَعَلَّكُمْ تَتَفَكَّرُونَ ۞ لَعَلَّهُمْ يَتَفَكَّرُونَ ۞ اَوَلَمْ يَتَفَكَّرُوا فٖٓى اَنْفُسِهِمْ مَا خَلَقَ اللّٰهُ السَّم… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:11` | Alta |
| `p2668:1:image327.png` | Independiente | تَفَكُّرُ سَاعَةٍ خَيْرٌ مِنْ عِبَادَةِ سَنَةٍ | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:15` | Alta |
| `p2675:1:image328.png` | Independiente | اَلْبَابُ الثَّالِثُ فٖى مَرَاتِبِ اَللّٰهُ اَكْبَرُ | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:27` | Alta |
| `p2679:1:image329.png` | Independiente | اَلْمَرْتَبَةُ الْاُولٰى:<br>وَ قُلِ الْحَمْدُ لِلّٰهِ الَّذٖى لَمْ يَتَّخِذْ وَلَدًا وَ لَمْ يَكُنْ لَهُ شَرٖيكٌ فِى الْمُلْك… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:31–33` | Media |
| `p2680:1:image330.png` | Independiente | اِذِ الْوَاحِدُ بِالْفِعْلِ الْوَاحِدِ يُحَصِّلُ نَتٖيجَةً وَ وَضْعِيَّةً لِلْكَثٖيرِ بِلَا كُلْفَةٍ وَ لَا مُبَاشَرَةٍ ٠ ل… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:33–35` | Media |
| `p2680:2:image331.png` | Independiente | الْكَائِنَاتِ بِقَلَمِ قَدَرِهٖ كَمَا كَتَبَ الْاِنْسَانَ بِذٰلِكَ الْقَلَمِ اِذْ ذَاكَ الْعَالَمُ الْكَبٖيرُ كَهٰذَا الْعَا… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:33` | Media |
| `p2681:1:image332.png` | Independiente | وَ بِحِكْمَةِ اَنَّ فِى الْوَحْدَةِ يُمْكِنُ الْاِبْدَاعُ وَ اٖيجَادُ الْاَيْسِ مِنَ اللَّيْسِ يَعْنٖى اِبْدَاعُ الْمَوْجُود… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:35–37` | Media |
| `p2682:1:image333.png` | En línea | اَلْاَيْسُ | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:83` | Alta |
| `p2683:1:image334.png` | En línea | اَللَّيْسُ | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:85` | Alta |
| `p2685:1:image335.png` | Independiente | الثَّانٖى) مِنَ السَّمٰوَاتِ اِلَى التَّشَخُّصَاتِ الْوَجْهِيَّةِ فَاَعْطَتْ جَمٖيعُهَا جَوَابَ رَدِّ الشِّرْكِ بِاِرَائَةِ … | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:37–39` | Media |
| `p2685:2:image336.png` | Independiente | اَلْمَرْتَبَةُ الثَّانِيَةُ:<br>جَلَّ جَلَالُهُ اَللّٰهُ اَكْبَرُ مِنْ كُلِّ شَىْءٍ قُدْرَةً وَ عِلْمًا اِذْ هُوَ الْخَلَّاقُ ا… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:41–43` | Media |
| `p2686:1:image337.png` | Independiente | تَبَسُّمُ الْاَزْهَارِ مِنْ زٖينَةِ الْاَثْمَارِ، تَسَجُّعُ الْاَطْيَارِ فٖى نَسْمَةِ الْاَسْحَارِ، تَهَزُّجُ الْاَمْطَارِ ع… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:43` | Media |
| `p2686:2:image338.png` | Independiente | فٖى هٰذِهِ الْمَوْجُودَاتِ وَ التَّخْرٖيبِ وَ التَّبْدٖيلِ وَ التَّحْوٖيلِ وَ التَّجْدٖيدِ لِهٰذِهِ الْكَائِنَاتِ ٠<br>اَللّٰه… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:43–49` | Media |
| `p2688:1:image339.png` | Independiente | وَ تَنْوٖيرِهٖ بِلُطْفٍ وَ كَرَمٍ وَ اِلَّا اَزَاهٖيرُ لَطَائِفِ لُطْفِهٖ وَ كَرَمِهٖ وَ تَعَرُّفِهٖ وَ تَوَدُّدِهٖ بِرَحْم… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:49–53` | Media |
| `p2688:2:image340.png` | Independiente | وَ حِكْمَتِهٖ وَ فَصَّلَهَا بِدَسَاتٖيرِ قَضَائِهٖ وَ قَدَرِهٖ وَ نَظَّمَهَا بِقَوَانٖينِ عَادَتِهٖ وَ سُنَّتِهٖ وَ زَيَّنَه… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:53` | Media |
| `p2689:1:image341.png` | Independiente | فٖى تَغَيُّرَاتِهَا الْمُسْتَلْزِمُ لِوُجُودِ الْمُغَيِّرِ الْغَيْرِ الْمُتَغَيِّرِ وَ الْاِتِّفَاقُ فٖى تَسْبٖيحَاتِهَا كَا… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:53` | Media |
| `p2689:2:image342.png` | Independiente | اَلْمَرْتَبَةُ الْخَامِسَةُ:<br>اَللّٰهُ اَكْبَرُ اِذْ هُوَ الْخَلَّاقُ الْقَدٖيرُ الْمُصَوِّرُ الْبَصٖيرُ الَّذٖى هٰذِهِ الْا… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:55–59` | Media |
| `p2692:1:image343.png` | Independiente | فٖى جَمٖيعِ الْمَوْجُودَاتِ مِنَ الْاِنْتِظَامَاتِ الْمَوْزُونَةِ وَ الْاِتِّزَانَاتِ الْمَنْظُومَةِ وَ الْحِكَمِ الْعَامَّة… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:59–61` | Media |
| `p2692:2:image344.png` | Independiente | وَ اَنَّ خَلْقَ الْمَوْجُودَاتِ الْمُخْتَلِفَاتِ الْمُنْتَظَمَاتِ الْحَيَوِيَّةِ مِنَ الْبَسَائِطِ الْجَامِدَةِ كَالْاِنْسَا… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:63` | Media |
| `p2693:1:image345.png` | Independiente | الْمُطْلَقِ وَ الْاِتِّزَانِ الْمُطْلَقِ وَ الْاِمْتِيَازِ الْمُطْلَقِ فِى السُّرْعَةِ وَ السُّهُولَةِ وَ الْكَثْرَةِ الْمُط… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:63` | Media |
| `p2693:2:image346.png` | Independiente | فَكَمَا اَنَّ غَايَةَ كَمَالِ السُّهُولَةِ فٖى اٖيجَادِ الْاَشْيَاءِ اَوْقَعَتْ اَهْلَ الضَّلَالَةِ فٖى اِلْتِبَاسِ التَّشْك… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:63–67` | Media |
| `p2696:1:image347.png` | Independiente | وَ الزَّمَانِ يَخْرُجُ مِنْ قَبْضَةِ تَصَرُّفِ رَحْمٰنٍ وَ تَنْظٖيمِ حَنَّانٍ وَ تَزْيٖينِ مَنَّانٍ وَ تَوْزٖينِ دَيَّانٍ ٠<br>… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:67` | Media |
| `p2696:2:image348.png` | Independiente | الْاِسْمِ الْبَاطِنِ فَبِكَمَالِ الْاِنْتِظَامِ وَ التَّدْبٖيرِ الْمُحَيِّرِ لِلْعُقُولِ وَ تَوْزٖيعِ مَوَادِّ الْحَيَاةِ ا… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:67–73` | Media |
| `p2699:1:image349.png` | Independiente | وَ مَوْجُودَاتِهَا ظِلَالُ اَنْوَارِهٖ وَ اٰثَارُ اَفْعَالِهٖ وَ اَلْوَانُ نُقُوشِ اَنْوَاعِ تَجَلِّيَاتِ اَسْمَائِهٖ وَ خُط… | `03 Lem'alar/29 Yirmi Dokuzuncu Lem’a.md:73` | Media |
| `p2723:1:image350.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>وَالْاَرْضَ فَرَشْنَاهَا فَنِعْمَ الْمَاهِدُونَ | `03 Lem'alar/30 Otuzuncu Lem’a.md:23` | Alta |
| `p2743:1:image351.png` | En línea | اَلنَّظَافَةُ مِنَ الْاٖيمَانِ | `03 Lem'alar/30 Otuzuncu Lem’a.md:55` | Alta |
| `p2743:2:image352.png` | En línea | اِنَّ اللّٰهَ يُحِبُّ التَّوَّابٖينَ وَيُحِبُّ الْمُتَطَهِّرٖينَ | `03 Lem'alar/30 Otuzuncu Lem’a.md:55` | Alta |
| `p2751:1:image353.png` | Independiente | وَ اِنْ مِنْ شَىْءٍ اِلَّا عِنْدَنَا خَزَٓائِنُهُ وَمَا نُنَزِّلُهُٓ اِلَّا بِقَدَرٍ مَعْلُومٍ | `03 Lem'alar/30 Otuzuncu Lem’a.md:60` | Alta |
| `p2765:1:image354.png` | Independiente | وَالسَّمَٓاءَ رَفَعَهَا وَوَضَعَ الْمٖيزَانَ اَلَّا تَطْغَوْا فِى الْمٖيزَانِ وَاَقٖيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْس… | `03 Lem'alar/30 Otuzuncu Lem’a.md:82` | Alta |
| `p2779:1:image355.png` | Independiente | اُدْعُ اِلٰى سَبٖيلِ رَبِّكَ بِالْحِكْمَةِ | `03 Lem'alar/30 Otuzuncu Lem’a.md:97` | Alta |
| `p2816:1:image356.png` | En línea | كُلُوا وَ اشْرَبُوا وَ لَا تُسْرِفُوا | `03 Lem'alar/30 Otuzuncu Lem’a.md:163` | Alta |
| `p2823:1:image357.png` | Independiente | عَلَيْهِ وَعَلٰى اٰلِهٖ وَصَحْبِهِ الصَّلَاةُ وَالسَّلَامُ بِعَدَدِ عَاشِرَاتِ الْاَيَّامِ وَذَرَّاتِ الْاَنَامِ<br>سُبْحَانَك… | `03 Lem'alar/30 Otuzuncu Lem’a.md:173` | Alta |
| `p2831:1:image358.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>قُلْ هُوَ اللّٰهُ اَحَدٌ | `03 Lem'alar/30 Otuzuncu Lem’a.md:178` | Alta |
| `p2872:1:image359.png` | En línea | لَوْ كَانَ فٖيهِمَٓا اٰلِهَةٌ اِلَّا اللّٰهُ لَفَسَدَتَا | `03 Lem'alar/30 Otuzuncu Lem’a.md:264` | Alta |
| `p2872:2:image360.png` | En línea | فَارْجِعِ الْبَصَرَ هَلْ تَرٰى مِنْ فُطُورٍ | `03 Lem'alar/30 Otuzuncu Lem’a.md:264` | Alta |
| `p2890:1:image361.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ | `03 Lem'alar/30 Otuzuncu Lem’a.md:298` | Alta |
| `p2898:1:image362.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>فَانْظُرْ اِلٰٓى اٰثَارِ رَحْمَتِ اللّٰهِ كَيْفَ يُحْيِى الْاَرْضَ بَعْدَ مَوْتِهَا ا… | `03 Lem'alar/30 Otuzuncu Lem’a.md:303` | Alta |
| `p2901:1:image363.png` | Independiente | اَللّٰهُ لَٓا اِلٰهَ اِلَّا هُوَ الْحَىُّ الْقَيُّومُ لَا تَاْخُذُهُ سِنَةٌ وَلَا نَوْمٌ | `03 Lem'alar/30 Otuzuncu Lem’a.md:307` | Alta |
| `p2925:1:image364.png` | Independiente | وَهُوَ الَّذٖى يُحْيٖى وَ يُمٖيتُ وَلَهُ اخْتِلَافُ الَّيْلِ وَالنَّهَارِ ۞ هُوَ الَّذٖى يُحْيٖى وَ يُمٖيتُ فَاِذَا قَضٰى ا… | `03 Lem'alar/30 Otuzuncu Lem’a.md:351` | Alta |
| `p2927:1:image365.png` | Independiente | هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتٖينُ ۞ وَ اِذَا مَرِضْتُ فَهُوَ يَشْفٖينِ ۞ وَهُوَ الَّذٖى يُنَزِّلُ الْغَيْثَ مِنْ ب… | `03 Lem'alar/30 Otuzuncu Lem’a.md:357` | Alta |
| `p2928:1:image366.png` | En línea | هُوَ الَّذٖى ۞ هُوَ الرَّزَّاقُ | `03 Lem'alar/30 Otuzuncu Lem’a.md:359` | Alta |
| `p2963:1:image367.png` | Independiente | يَا حَىُّ قَبْلَ كُلِّ حَىٍّ ۞ يَا حَىُّ بَعْدَ كُلِّ حَىٍّ ۞ يَا حَىُّ الَّذٖى لَيْسَ كَمِثْلِهٖ حَىٌّ ۞ يَا حَىُّ الَّذٖى … | `03 Lem'alar/30 Otuzuncu Lem’a.md:423` | Alta |
| `p2977:1:image368.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>بِيَدِهٖ مَلَكُوتُ كُلِّ شَىْءٍ ۞ لَهُ مَقَالٖيدُ السَّمٰوَاتِ وَ الْاَرْضِ ۞ وَ اِنْ … | `03 Lem'alar/30 Otuzuncu Lem’a.md:440` | Alta |
| `p2982:1:image369.png` | En línea | لَيْسَ كَمِثْلِهٖ شَىْءٌ | `03 Lem'alar/30 Otuzuncu Lem’a.md:444` | Alta |
| `p3000:1:image370.png` | Independiente | لَا تَاْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۞ مَا مِنْ دَٓابَّةٍ اِلَّا هُوَ اٰخِذٌ بِنَاصِيَتِهَا ۞ لَهُ مَقَالٖيدُ السَّمٰوَاتِ وَ … | `03 Lem'alar/30 Otuzuncu Lem’a.md:476` | Alta |
| `p3016:1:image371.png` | En línea | رَفَعَ السَّمَاءَ بِغَيْرِ عَمَدٍ تَرَوْنَهَا | `03 Lem'alar/30 Otuzuncu Lem’a.md:504` | Alta |
| `p3018:1:image372.png` | En línea | وَ اِلَيْهِ يُرْجَعُ الْاَمْرُ كُلُّهُ | `03 Lem'alar/30 Otuzuncu Lem’a.md:506` | Alta |
| `p3023:1:image373.png` | Independiente | كُلَّ يَوْمٍ هُوَ فٖى شَاْنٍ ۞ فَعَّالٌ لِمَا يُرٖيدُ ۞ يَخْلُقُ مَا يَشَٓاءُ ۞ بِيَدِهٖ مَلَكُوتُ كُلِّ شَىْءٍ ۞ فَانْظُرْ … | `03 Lem'alar/30 Otuzuncu Lem’a.md:510` | Alta |
| `p3027:1:image374.png` | En línea | يُحْيٖى وَ يُمٖيتُ | `03 Lem'alar/30 Otuzuncu Lem’a.md:516` | Alta |
| `p3092:1:image375.png` | Independiente | عَلَيْهِ وَ عَلٰى اٰلِهِ الصَّلَاةُ وَ السَّلَامُ بِعَدَدِ حَسَنَاتِ اُمَّتِهٖ | `03 Lem'alar/30 Otuzuncu Lem’a.md:623` | Alta |
| `p3093:1:image376.png` | Independiente | يَا اَللّٰهُ يَا رَحْمٰنُ يَا رَحٖيمُ يَا فَرْدُ يَا حَىُّ يَا قَيُّومُ يَا حَكَمُ يَا عَدْلُ يَا قُدُّوسُ<br>نَسْئَلُكَ بِحَق… | `03 Lem'alar/30 Otuzuncu Lem’a.md:623` | Alta |
| `p3117:1:image377.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ | `03 Lem'alar/36 Dua (Lem’alar).md:5` | Alta |
| `p3121:1:image378.png` | Independiente | اِنَّ فٖى خَلْقِ السَّمٰوَاتِ وَالْاَرْضِ وَاخْتِلَافِ الَّيْلِ وَالنَّهَارِ وَالْفُلْكِ الَّتٖى تَجْرٖى فِى الْبَحْرِ بِمَا… | `01 Sözler/33 Otuz Üçüncü Söz.md:64` | Alta |
| `p3247:1:image379.png` | Independiente | سُبْحَانَهُ وَ تَعَالٰى عَمَّا يَقُولُونَ عُلُوًّا كَبٖيرًا | `03 Lem'alar/34 Münâcat (Lem’alar).md:208` | Alta |
| `p3258:1:image380.png` | Independiente | سُبْحَانَكَ لَا عِلْمَ لَنَٓا اِلَّا مَا عَلَّمْتَنَٓا اِنَّكَ اَنْتَ الْعَلٖيمُ الْحَكٖيمُ<br>وَ اٰخِرُ دَعْوٰيهُمْ اَنِ الْح… | `03 Lem'alar/34 Münâcat (Lem’alar).md:220` | Alta |
| `p3268:1:image381.png` | Independiente | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ<br>يَا اَللّٰهُ يَا رَحْمٰنُ يَا رَحٖيمُ يَا فَرْدُ يَا حَىُّ يَا قَيُّومُ يَا حَكَمُ يَا… | `03 Lem'alar/36 Dua (Lem’alar).md:5` | Alta |

### Comprobaciones

- `npx tsc --noEmit` y `npx eslint app src` finalizaron correctamente.
- `scripts/validate.py --source-root …` validó las citas del primer libro y el inventario de Destellos con sus hashes y pasajes fuente.
- El validador reproduce Destellos a partir del Word y del PDF y verifica el esquema, los ids, las 288 páginas y la correspondencia de las 447 apariciones. Dos conversiones de Destellos produjeron un JSON idéntico byte por byte. Una extracción independiente con Poppler confirmó la página de inicio de los 2124 párrafos con texto español.
- Se revisaron las páginas 1, 9 y 169 en Expo Go en el simulador iOS RisaleShelf. Se comprobó el texto árabe de derecha a izquierda en un bloque y en un párrafo en español, así como los saltos de página y el encabezado de remedio. El lector muestra [árabe] en los bloques independientes sin resolver, incluidas las rosetas inventariadas. Los tres spans en línea sin resolver tienen texto vacío.

### Árabe compuesto y lo que queda como imagen (revisión 2026-11-23)

- **Ocho imágenes reúnen varios pasajes** que el corpus separa con prosa turca (`image382`, `image26`, `image75`, `image113`, `image145`, `image311`, y `image2`+`image3`+`image4`, que Word reparte en tres PNG de una sola cita). Cada pasaje se copia literalmente de su propia línea del corpus; la entrada guarda `parts` (texto, archivo, línea, SHA-256) y `joiner` (salto de línea o espacio). El validador comprueba cada parte en su línea y que el texto sea exactamente la unión de las partes. `image3` e `image4` llevan `mergedInto` hacia `image2`, que contiene la cita completa (`01 Birinci Lem’a.md:5`).
- **`image271`** («بَعْثُ بَعْدَ الْمَوْتِ») está en esa forma exacta en `01 Sözler/33 Otuz Üçüncü Söz.md:326`.
- **`image296`** son dos letras aisladas con guion («ك - ن», kâf y nûn de «kun»); se transcriben literalmente (`transcribed: true`), sin cita del corpus.
- **Quedan como imagen original** solo la caligrafía otomana de los títulos `image237` (Tabiat Risalesi) e `image256` (Hastalar Risalesi) y las 25 rosetas `image258`: el convertidor copia sus PNG a `assets/books/los-destellos/` y el lector los muestra en su sitio.

Resultado: 447 apariciones = 398 altas + 20 medias + 2 fusionadas + 27 imágenes (2 títulos caligráficos y 25 rosetas). Ningún pasaje árabe del texto queda sin Unicode.
