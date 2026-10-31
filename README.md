# VetAtlas — cattle & sheep disease reference

A self-contained, offline-first educational website for bovine and ovine diseases. It uses plain HTML, CSS and JavaScript with one `data.json` file — no build step, no framework and no internet connection required.

**For education only. Consult a licensed veterinarian.**

## Run it locally

Browsers block `fetch()` of local JSON when a page is opened with `file://`, so use a small local server.

### Windows (included helper)

Double-click **`serve.ps1`**, or open PowerShell in this folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Then open <http://localhost:8000>.

Choose another port if needed:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 8080
```

### Any other system

Use any static file server from this folder, for example:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

### Opening `index.html` directly

The site detects the blocked JSON request and offers a **Choose data.json** button. Selecting the bundled `data.json` loads the full guide without a server. A local server is still the most convenient option.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell, inline SVG icon sprite, header, footer and comparison tray |
| `style.css` | Responsive mobile-first theme, light/dark modes, RTL layout and print styles |
| `app.js` | Routing, pages, search, filters, comparison, symptom checker, language and theme |
| `data.json` | All disease entries, taxonomy and the symptom catalogue |
| `serve.ps1` | Windows PowerShell local web server plus the small local API used by the “Add disease” page |
| `images/` | Photos added through the “Add disease” page (created automatically) |

Everything runs locally. There are no CDNs, web fonts, analytics or external requests.

## Features

- Cattle and sheep sections with search by disease, sign or symptom.
- Filters for disease type, body system and severity, plus A–Z / Z–A sorting.
- Full entries: causative agent, affected animals and age, symptoms, diagnosis, post-mortem examination findings, treatment, prevention/vaccination, zoonotic warning, meat-safety status and reporting status. All 37 entries include post-mortem findings and a meat-safety note.
- Side-by-side comparison of any two diseases, including cross-species comparison and shared signs.
- Educational symptom checker ranked by the number of matching signs.
- Light/dark theme and English / Kurdish Sorani / Arabic interface with automatic RTL layout.
- Keyboard navigation, visible focus states, print-friendly disease entries and persistent disclaimers.
- 37 entries: 19 cattle and 18 sheep.

## Add a disease

### From the website

1. Start the local server with `serve.ps1` (see above). The add form needs it to write files; opening `index.html` directly cannot save.
2. Open <http://localhost:8000/index.html#/add>, or choose **Add disease** in the navigation.
3. Fill in the fields. The English name and summary are required; Kurdish and Arabic fall back to English when left empty.
4. Optionally attach a JPG, PNG, WebP or GIF photo (up to 5 MB). It is stored in `images/` and shown on the entry and in the disease lists.
5. Save. The server validates the entry, gives it a unique ID from the English name, appends it to `data.json`, refreshes `meta.updated`, and keeps the previous file as `data.bak.json`.

The form has a **Disease type**, **Body systems** and **Symptom checker tags** picker built from the existing taxonomy, so values always match the rest of the app.

If the local server is not running, the page shows a warning and disables saving. Nothing is ever sent to the internet.

### By editing `data.json`

1. Open `data.json` in a UTF-8 capable editor.
2. Add a new object to the `diseases` array. Use the existing entries as a template.
3. Keep the disease `id` unique within its animal and use only IDs that already exist in the data:

```json
{
  "id": "example-disease",
  "animal": "cattle",
  "name": {
    "en": "Example disease",
    "ku": "نەخۆشی نموونە",
    "ar": "مرض مثال"
  },
  "summary": {
    "en": "One or two plain-language sentences.",
    "ku": "ڕستەیەک یان دوو ڕستەی سادە.",
    "ar": "جملة أو جملتان بلغة واضحة."
  },
  "aliases": ["Another English name"],
  "type": "bacterial",
  "systems": ["digestive"],
  "severity": "moderate",
  "zoonotic": false,
  "zoonoticNote": "",
  "notifiable": false,
  "notifiableNote": "",
  "meatSafe": true,
  "meatNote": "Whether meat can enter the food chain after recovery, official inspection and drug withdrawal. Give the conditions and any condemnation rules.",
  "causativeAgent": "Name of the organism or cause.",
  "affected": "Which animals and age groups are affected.",
  "symptoms": [
    "English clinical sign one",
    "English clinical sign two",
    "English clinical sign three"
  ],
  "symptomTags": ["fever", "appetite-loss", "diarrhea"],
  "diagnosis": "How the diagnosis is confirmed.",
  "postMortem": "Gross post-mortem findings and useful samples. Mention any zoonotic or notifiable-disease safety precautions.",
  "treatment": "Treatment principles. Mention that a veterinarian must direct treatment.",
  "prevention": "Prevention, vaccination and control measures.",
  "image": "images/example-photo.jpg",
  "imageAlt": "Short description of what the photo shows."
}
```

`image` and `imageAlt` are optional. Use a path relative to `index.html` (for photos added through the website, always `images/<file>`). Supported formats are JPG, PNG, WebP and GIF up to 5 MB.

4. Choose `type`, `systems`, `severity` and `symptomTags` from the existing ID lists in `data.json`:

- `types`: `bacterial`, `viral`, `parasitic`, `metabolic`, `nutritional`, `fungal`, `reproductive`, `complex`, `prion`
- `severities`: `critical`, `high`, `moderate`, `low`
- `systems`: `respiratory`, `digestive`, `skin`, `musculoskeletal`, `reproductive`, `nervous`, `mammary`, `urinary`, `circulatory`, `systemic`
- `symptomTags`: any `id` from `symptomCatalog`

5. If you need a new symptom, add it to `symptomCatalog` first:

```json
{
  "id": "new-symptom-id",
  "group": "general",
  "en": "New symptom",
  "ku": "نیشانەی نوێ",
  "ar": "عرض جديد"
}
```

Use a `group` from `general`, `digestive`, `respiratory`, `skin`, `musculoskeletal`, `reproductive`, `mammary`, `nervous`, `urinary`, `circulatory` or `systemic`.

6. Save with UTF-8 encoding. Reload the browser. Counts, search, filters, comparison and the symptom checker update automatically from the JSON.

The disease name and summary should include all three languages. Clinical descriptions (`symptoms`, `diagnosis`, `postMortem`, `treatment`, `prevention`, `meatNote`) are written in English by design; add fields for more languages if you extend the app. Post-mortem content describes gross findings and sampling; histopathology and laboratory tests are still needed for a final diagnosis.

`meatSafe: true` means meat may enter the food chain only after recovery, official ante- and post-mortem inspection and completion of drug withdrawal periods. It is never permission to eat an animal that died of disease or was not slaughtered under inspection. Use official local meat-inspection rules for every decision.

## Supabase cloud setup (GitHub Pages)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, open [supabase.sql](supabase.sql), replace every `admin@example.com` with your admin email, and run it.
3. Open **Authentication > Users**, create a user with that exact email and a strong password, and enable that user for email/password sign-in.
4. Open **Project Settings > API**, copy the Project URL and `anon` public key.
5. Fill those values in [supabase-config.js](supabase-config.js):

```js
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
  adminEmail: 'your-admin@example.com'
};
```

6. Commit and deploy the site to GitHub Pages. Visitors can read public disease data without signing in; only the configured admin email can add, edit, or delete data.

Animal, disease, and image changes are saved in Supabase immediately and appear for visitors after their next data refresh. Existing entries in `data.json` remain available as the offline/static fallback. The local `serve.ps1` files are not used on GitHub Pages.

## Content note

The entries are practical educational summaries, not a formulary or a diagnostic standard. Drug choices, withdrawal periods, vaccination schedules and notifiable-disease rules vary by country and change over time. Have local content reviewed by a licensed veterinarian before using the guide for decisions.
