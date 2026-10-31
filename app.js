/* =========================================================
   VetAtlas — offline cattle & sheep disease reference
   Plain JavaScript. All disease content lives in data.json.
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Saved preferences ---------- */
  const PREF = {
    get(key, fallback) {
      try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* private mode */ }
    },
    sessionGet(key, fallback) {
      try { return sessionStorage.getItem(key) ?? fallback; } catch { return fallback; }
    },
    sessionSet(key, value) {
      try { sessionStorage.setItem(key, value); } catch { /* private mode */ }
    }
  };

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = PREF.get('vetatlas.theme', prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = initialTheme === 'dark' ? 'dark' : 'light';

  /* ---------- Administrator session ---------- */
  const AUTH = {
    key: 'vetatlas.token',
    token: PREF.get('vetatlas.token', ''),
    user: ''
  };

  /* ---------- Interface translations ---------- */
  const STRINGS = {
    en: {
      skipLink: 'Skip to content',
      eduStrip: 'For education only. Consult a licensed veterinarian.',
      brandTagline: 'Field guide for cattle & sheep',
      navHome: 'Home', navCattle: 'Cattle', navSheep: 'Sheep', navCompare: 'Compare', navChecker: 'Symptom checker', navAdd: 'Add disease',
      language: 'Language', themeToggle: 'Toggle dark mode', themeDark: 'Use dark mode', themeLight: 'Use light mode',
      menuOpen: 'Open menu', menuClose: 'Close menu', loading: 'Loading the field guide…',
      footerAlertTitle: 'A field companion, not a diagnosis',
      footerAlertBody: 'Disease signs overlap and treatments depend on local rules, drug availability and the individual animal. Always involve a licensed veterinarian before treating, moving or culling animals. In a notifiable-disease emergency, contact the relevant veterinary authority.',
      footerTagline: 'Clear, practical disease information for better animal care.',
      retry: 'Try again', backHome: 'Back to home',

      heroEyebrow: 'A field-ready veterinary reference',
      heroTitleTop: 'Know the signs.',
      heroTitleBottom: 'Protect the herd.',
      heroLede: 'A clear, practical disease guide for veterinary students, farmers and field workers — covering cattle and sheep, from first signs to prevention.',
      heroSearchLabel: 'Search the field guide',
      heroSearchPlaceholder: 'Search a disease, sign or symptom…',
      heroQuickLabel: 'Try a search:',
      heroQuickFever: 'fever', heroQuickMastitis: 'mastitis', heroQuickBloat: 'bloat',
      statDiseases: 'disease entries', statSpecies: 'species covered', statLanguages: 'languages',
      browseEyebrow: 'Browse the reference', browseTitle: 'Choose your animal',
      browseLead: 'Every entry gives you the causative agent, signs, diagnosis, post-mortem findings, treatment, prevention, meat-safety status and reporting information.',
      cattleDesc: 'From milk fever and mastitis to tick-borne disease, calf scours and notifiable emergencies.',
      sheepDesc: 'From foot rot and fly strike to pregnancy toxaemia, PPR and other flock-threatening diseases.',
      conditionsCount: '{count} conditions', exploreCattle: 'Explore cattle diseases', exploreSheep: 'Explore sheep diseases',
      featuresEyebrow: 'Practical tools', featuresTitle: 'Go beyond a list', featuresLead: 'Search by symptom, compare two conditions side by side, or start with the signs in front of you.',
      compareFeatureTitle: 'Compare diseases', compareFeatureDesc: 'Put two cattle or sheep diseases side by side and see the differences in signs, cause and control.',
      checkerFeatureTitle: 'Symptom checker', checkerFeatureDesc: 'Tick the signs you see to explore possible diseases. Educational only — never a diagnosis.',
      guideFeatureTitle: 'Built for the field', guideFeatureDesc: 'Fast, keyboard-friendly and fully offline. Works on a phone in the barn without a signal.',
      ctaEyebrow: 'Start with what you see', ctaTitle: 'Not sure where to begin?',
      ctaBody: 'Use the educational symptom checker to explore possible conditions, then open a full disease entry and confirm with a veterinarian.',
      ctaButton: 'Open the symptom checker',
      searchMatches: '{count} matches', searchNoResults: 'No diseases match that search. Try a different name or symptom.',
      searchResultsLabel: 'Search results',

      cattleListTitle: 'Cattle diseases', sheepListTitle: 'Sheep diseases',
      cattleListIntro: 'Browse cattle conditions by name, type, body system and severity. Search with English, Kurdish or Arabic disease names and symptom terms.',
      sheepListIntro: 'Browse sheep conditions by name, type, body system and severity. Search with English, Kurdish or Arabic disease names and symptom terms.',
      searchDiseases: 'Search by disease or symptom', searchPlaceholder: 'e.g. mastitis, fever, lameness…',
      typeFilter: 'Disease type', systemFilter: 'Body system', severityFilter: 'Severity',
      allTypes: 'All types', allSystems: 'All systems', allSeverities: 'All severities',
      sortBy: 'Sort by', sortAz: 'Name A–Z', sortZa: 'Name Z–A',
      clearAllFilters: 'Clear all filters', filterResults: 'Filter results',
      showingCount: '{visible} of {total} conditions', activeFilters: 'Active filters',
      typeShort: 'Type', systemShort: 'System', severityShort: 'Severity', searchShort: 'Search',
      noDiseasesTitle: 'No conditions match these filters',
      noDiseasesBody: 'Try a broader search, remove a filter, or check the spelling of the disease or symptom.',
      resetFilters: 'Reset filters',
      compareShort: 'Compare', comparedShort: 'In comparison',
      viewDetails: 'View full entry', zoonoticShort: 'Zoonotic', reportableShort: 'Reportable',
      animalCattle: 'Cattle', animalSheep: 'Sheep',
      removeFilter: 'Remove filter {name}',

      backToCattle: 'All cattle diseases', backToSheep: 'All sheep diseases',
      quickFacts: 'At a glance', causativeAgent: 'Causative agent', affectedAnimals: 'Affected animals & age group',
      bodySystems: 'Body systems', diseaseType: 'Disease type', severityLabel: 'Severity',
      zoonoticRisk: 'Zoonotic risk', meatSafety: 'Meat safe to eat after inspection', meatSafetyShort: 'Meat safe', reportingStatus: 'Notifiable / reportable', yes: 'Yes', no: 'No',
      reportable: 'Reportable', notUsuallyReportable: 'Not usually reportable',
      symptomsHeading: 'Symptoms to look for', diagnosisHeading: 'Diagnosis', treatmentHeading: 'Treatment',
      preventionHeading: 'Prevention & vaccination', aliasesLabel: 'Also known as',
      postMortemHeading: 'Post-mortem examination',
      postMortemNote: 'Necropsy findings support but do not replace laboratory testing. Use protective equipment and follow local rules; never open a suspected anthrax carcass.',
      addToCompare: 'Add to comparison', inComparison: 'In comparison',
      reportAlert: 'Notifiable / reportable disease. Do not move animals or samples. Contact your veterinary authority immediately.',
      fieldSafetyTitle: 'Field safety', fieldSafetyBody: 'Wear clean gloves and wash hands after handling sick animals, birth fluids or carcasses. Keep children, pregnant women and immunosuppressed people away from high-risk material.',
      languageContentNote: 'Clinical descriptions are shown in English. Interface labels and disease names are available in all three languages.',
      updatedNote: 'Reference updated 30 October 2026',
      animalLabel: 'Animal',

      compareTitle: 'Compare two diseases', compareIntro: 'Select two conditions to see their causes, signs, post-mortem findings, meat safety, treatment and prevention side by side.',
      firstDisease: 'First disease', secondDisease: 'Second disease', chooseDisease: 'Choose a disease…',
      swapSides: 'Swap sides', comparePromptTitle: 'Choose two diseases to begin',
      comparePromptBody: 'Use the two selectors above. You can compare any cattle or sheep diseases, including across species.',
      compareDisclaimer: 'This comparison is for education only. It does not replace a clinical examination, local veterinary advice or official disease reporting rules.',
      sharedSigns: 'Signs shared by both diseases', noSharedSigns: 'No matching symptom tags in this reference.',
      compareClear: 'Clear comparison', sameDisease: 'Please choose two different diseases.',
      overviewLabel: 'Overview', diagnosisLabel: 'Diagnosis', treatmentLabel: 'Treatment', preventionLabel: 'Prevention',
      fullEntry: 'Open full entry',

      checkerTitle: 'Symptom checker', checkerIntro: 'Educational exploration only. Tick the signs you can see and we will show diseases that list those signs. Always confirm with a veterinarian.',
      checkerWarning: 'Do not use this tool to decide treatment, to delay calling a veterinarian, or as a diagnosis. Many diseases share signs and some are emergencies.',
      animalScope: 'Animal', allAnimals: 'All', selectSignsTitle: 'Tick the signs you see',
      selectSignsHint: 'Choose one or more signs. The possible-disease list updates immediately.',
      clearSymptoms: 'Clear signs', signsSelected: '{count} selected',
      possibleResults: 'Possible diseases', possibleResultsHint: 'Ranked by how many of your chosen signs they share. This is not a diagnosis.',
      checkerPlaceholderTitle: 'Start with the signs', checkerPlaceholderBody: 'Tick at least one symptom to see possible conditions. Use the animal filter to narrow the reference.',
      matchLabel: '{percent}% sign match', signsMatched: '{matched} of {selected} chosen signs',
      showAllResults: 'Show all {count} matches', showFewerResults: 'Show fewer matches',
      noMatchTitle: 'No matching conditions', noMatchBody: 'No reference entry lists every combination. Try removing one sign or choosing a different animal.',
      clearAndStart: 'Clear all signs', groupGeneral: 'General signs',
      checkerDisclaimer: 'For education only. Consult a licensed veterinarian. In an emergency — severe breathing difficulty, sudden death, severe bloat or suspected anthrax — seek immediate veterinary help.',

      addEyebrow: 'Contribute to the reference',
      addTitle: 'Add a disease entry',
      addIntro: 'Fill in the fields below to create a new entry. The local server saves it to data.json and stores any photo in the images folder.',
      addServerChecking: 'Checking the local server…',
      addServerOk: 'Local server connected. Your entry will be saved to data.json.',
      addServerDown: 'Browser storage is unavailable. Enable local storage in your browser and reload this page.',
      addSectionBasics: 'Basics',
      addSectionClinical: 'Clinical details',
      addSectionSafety: 'Safety & reporting',
      addSectionPhoto: 'Photo',
      addNameEn: 'Name (English)', addNameKu: 'Name (Kurdish)', addNameAr: 'Name (Arabic)',
      addSummaryEn: 'Summary (English)', addSummaryKu: 'Summary (Kurdish)', addSummaryAr: 'Summary (Arabic)',
      addAliases: 'Also known as', addAliasesHint: 'Separate names with commas.',
      addAnimal: 'Animal', addAnimalNew: 'Add animal', addAnimalEn: 'Animal name (English)', addAnimalKu: 'Animal name (Kurdish)', addAnimalAr: 'Animal name (Arabic)', addAnimalSave: 'Add animal', addAnimalSaved: 'Animal added.', addType: 'Disease type', addSeverity: 'Severity',
      addSystems: 'Body systems', addSystemsHint: 'Choose every body system the disease affects.',
      addCausative: 'Causative agent', addAffected: 'Affected animals & age group',
      addSymptoms: 'Symptoms', addSymptomsHint: 'One sign per line.',
      addSymptomTags: 'Symptom checker tags', addSymptomTagsHint: 'Choose the signs used by the symptom checker.',
      addTagFilter: 'Filter signs…', addTagsSelected: '{count} selected',
      addDiagnosis: 'Diagnosis', addPostMortem: 'Post-mortem examination', addTreatment: 'Treatment', addPrevention: 'Prevention & vaccination',
      addZoonotic: 'Zoonotic risk', addZoonoticNote: 'Zoonotic note',
      addNotifiable: 'Notifiable / reportable', addNotifiableNote: 'Reporting note',
      addMeatSafe: 'Meat safe after inspection', addMeatNote: 'Meat-safety note',
      addImage: 'Photo', addImageHint: 'JPG, PNG, WebP or GIF, up to 5 MB. Optional.',
      addImageChoose: 'Choose a photo', addImageRemove: 'Remove photo',
      addImageAlt: 'Photo description (alt text)', addImageAltHint: 'Describe what the photo shows, for screen readers.',
      addRequiredNote: 'Fields marked * are required.',
      addSubmit: 'Save disease entry', addSaving: 'Saving…',
      addCancel: 'Cancel', addSuccess: 'Disease entry saved.',
      addError: 'The entry could not be saved.',
      addErrorValidation: 'Check the marked fields and try again.',
      addNeedSystems: 'Choose at least one body system.',
      addNeedSymptoms: 'Add at least one symptom.',
      addNeedTags: 'Choose at least one symptom-checker tag.',
      addNeedMeat: 'Choose whether the meat is safe after inspection.',
      addImageTooLarge: 'The photo is larger than 5 MB.',
      addImageBadType: 'Use a JPG, PNG, WebP or GIF image.',
      addServerRequired: 'The local server is needed to save entries.',
      addChoose: 'Choose…',
      addNoTags: 'No signs match that filter.',
      addFieldRequired: '{field} is required.',

      navAccount: 'Sign in', navAccountAdmin: 'Account',
      loginEyebrow: 'Administrator access',
      loginTitle: 'Sign in to manage diseases',
      loginIntro: 'Only the administrator can add or edit disease entries. The rest of the reference stays open to everyone.',
      loginUser: 'Username', loginPassword: 'Password',
      loginSubmit: 'Sign in', loginSaving: 'Signing in…',
      loginEmpty: 'Enter the username and password.',
      loginError: 'The sign-in request failed. Is the local server running?',
      loginInvalid: 'Incorrect username or password.',
      loginLocked: 'Too many failed attempts. Wait a minute and try again.',
      loginNote: 'Administrator changes are stored locally in this browser. They are not sent to the internet.',
      loginNeeded: 'Sign in as the administrator to add or edit diseases.',
      loginWelcome: 'Signed in as administrator.',
      loginSignOut: 'Sign out', loginSignedOut: 'Signed out.',
      accountTitle: 'Administrator account',
      accountSignedIn: 'Signed in as',
      accountBody: 'You can add new disease entries and edit any existing entry, including its photo.',
      authExpired: 'Your session expired. Sign in again to continue.',
      editDisease: 'Edit disease',
      editTitle: 'Edit disease entry',
      editEyebrow: 'Administrator edit',
      editIntro: 'Update any field, replace or remove the photo, then save. The entry keeps its ID and links.',
      editSubmit: 'Save changes', editSaving: 'Saving…',
      editSuccess: 'Disease entry updated.',
      addCurrentPhoto: 'Current photo',

      comparison: 'Comparison', compareNow: 'Compare now', clear: 'Clear',
      compareTrayPrompt: 'Select up to two diseases to compare.',
      toastAdded: 'Added to comparison', toastRemoved: 'Removed from comparison',
      toastMax: 'You can compare two diseases at a time. Remove one first.',
      toastNeedTwo: 'Choose two diseases to compare.', toastSame: 'Choose two different diseases.',
      toastCleared: 'Comparison cleared.', toastNoFile: 'That file could not be loaded.',
      invalidData: 'This does not look like a valid VetAtlas data file.',

      errorTitle: 'The field guide could not load',
      errorBody: 'data.json could not be read. If you opened index.html directly from disk, your browser may block local JSON for security.',
      errorServer: 'Host this folder on any static web server, then reload the page.',
      errorChoose: 'Choose data.json below to load the guide directly:',
      chooseDataFile: 'Choose data.json',
      notFoundTitle: 'That page is not in the field guide',
      notFoundBody: 'The link may be old or mistyped. Return home or browse the cattle and sheep sections.',
      notFoundBack: 'Return home'
    },
    ku: {
      skipLink: 'بازدان بۆ ناوەڕۆک',
      eduStrip: 'تەنها بۆ فێربوون. پرسیار لە ڤێتەرینەرێکی مۆڵەتدار بکە.',
      brandTagline: 'ڕێنمایی مەیدانی بۆ مانگا و مەڕ',
      navHome: 'سەرەتا', navCattle: 'مانگا', navSheep: 'مەڕ', navCompare: 'بەراورد', navChecker: 'پشکنینی نیشانە', navAdd: 'زیادکردنی نەخۆشی',
      language: 'زمان', themeToggle: 'گۆڕینی ڕووکار', themeDark: 'دۆخی تاریک بەکاربهێنە', themeLight: 'دۆخی ڕووناک بەکاربهێنە',
      menuOpen: 'مێنیو بکەرەوە', menuClose: 'مێنیو ب داخستن',
      footerAlertTitle: 'هاوڕێی مەیدان، نەک دەستنیشانکردن',
      footerAlertBody: 'نیشانەکانی نەخۆشی لە یەک دەچن و چارەسەر بەپێی یاسای ناوچە، بەردەستی دەرمان و بارودۆخی ئاژەڵ دەگۆڕێت. پێش چارەسەر، گواستنەوە یان سەربڕین هەمیشە ڤێتەرینەرێکی مۆڵەتدار لەگەڵ بکە. لە نەخۆشییەکی راپۆرتکراودا، دەستبەجێ پەیوەندی بە دەسەڵاتی ڤێتەرینەری بکە.',
      footerTagline: 'زانیاری نەخۆشی ڕوون و کرداری بۆ چاودێری باشتر.',
      retry: 'دووبارە هەوڵبدە', backHome: 'گەڕانەوە بۆ سەرەتا',
      heroEyebrow: 'سەرچاوەیەکی ڤێتەرینەری بۆ مەیدان',
      heroTitleTop: 'نیشانەکان بناسە.',
      heroTitleBottom: 'ڕەوەکە بپارێزە.',
      heroLede: 'ڕێنماییەکی ڕوون و کرداری نەخۆشی بۆ خوێندکارانی ڤێتەرینەری، جوتیاران و کارکەرانی مەیدان — بۆ مانگا و مەڕ، لە یەکەمین نیشانەوە تا خۆپارێزی.',
      heroSearchLabel: 'گەڕان لە ڕێنماییەکە',
      heroSearchPlaceholder: 'ناوی نەخۆشی، نیشانە یان ئازارێک بنووسە…',
      heroQuickLabel: 'بەم شێوەیەش تاقیبکەرەوە:',
      heroQuickFever: 'تا', heroQuickMastitis: 'هەوکردنی مەمک', heroQuickBloat: 'ئاوسانی سک',
      statDiseases: 'تۆمار', statSpecies: 'جۆری ئاژەڵ', statLanguages: 'زمان',
      browseEyebrow: 'سەرچاوەکە بگەڕێ', browseTitle: 'ئاژەڵەکەت هەڵبژێرە',
      browseLead: 'هەر تۆمارێک هۆکار، نیشانە، دەستنیشانکردن، دۆزینەوەی دوای مردن، چارەسەر، خۆپارێزی، دۆخی سەلامەتی گۆشت و زانیاری ڕاپۆرتکردنت پێدەدات.',
      cattleDesc: 'لە تبای شیر و هەوکردنی مەمکەوە تا نەخۆشی مێش، سکچوونی گوێرە و حاڵەتە فریاکەوتنەکان.',
      sheepDesc: 'لە نەخۆشی پێ و هێرشی مێشەوە تا تۆکسیمی دووگیانی، PPR و نەخۆشییەکانی دیکەی مەترسیدار بۆ ڕەو.',
      conditionsCount: '{count} حاڵەت', exploreCattle: 'نەخۆشییەکانی مانگا ببینە', exploreSheep: 'نەخۆشییەکانی مەڕ ببینە',
      featuresEyebrow: 'ئامرازی کرداری', featuresTitle: 'زیاتر لە لیست', featuresLead: 'بە نیشانە بگەڕێ، دوو نەخۆشی بەراورد بکە، یان لە نیشانەکانی بەرچاوت دەست پێبکە.',
      compareFeatureTitle: 'بەراوردکردنی نەخۆشی', compareFeatureDesc: 'دوو نەخۆشی مانگا یان مەڕ بەراورد بکە و جیاوازی نیشانە، هۆکار و کۆنترۆڵ ببینە.',
      checkerFeatureTitle: 'پشکنینی نیشانە', checkerFeatureDesc: 'ئەو نیشانانەی دەیبینیت هەڵبژێرە بۆ دۆزینەوەی نەخۆشییە گەرمەکان. تەنها بۆ فێربوونە — هەرگیز دەستنیشانکردن نییە.',
      guideFeatureTitle: 'بۆ مەیدان دروستکراوە', guideFeatureDesc: 'خێرا، بۆ کیبۆرد ئاسان و بە تەواوی ئۆفلاین. لە مۆبایل لە ئەشکەوتەدا بەبێ ئینتەرنێت کار دەکات.',
      ctaEyebrow: 'لەوەوە دەست پێبکە کە دەیبینیت', ctaTitle: 'نازانیت لە کوێوە دەست پێبکەیت؟',
      ctaBody: 'پشکنینی نیشانە بەکاربهێنە بۆ گەڕان بەدوای حاڵەتەکان، پاشان تۆمارێکی تەواو بکەرەوە و لەگەڵ ڤێتەرینەر دڵنیابەرەوە.',
      ctaButton: 'پشکنینی نیشانە بکەرەوە',
      searchMatches: '{count} ئەنجام', searchNoResults: 'هیچ نەخۆشییەک نەدۆزرایەوە. ناوێک یان نیشانەیەکی دیکە تاقیبکەرەوە.',
      searchResultsLabel: 'ئەنجامەکانی گەڕان',
      cattleListTitle: 'نەخۆشییەکانی مانگا', sheepListTitle: 'نەخۆشییەکانی مەڕ',
      cattleListIntro: 'حاڵەتەکانی مانگا بەپێی ناو، جۆر، سیستەمی لەش و توندی بگەڕێ. بە ناوی ئینگلیزی، کوردی یان عەرەبی و نیشانەکان بگەڕێ.',
      sheepListIntro: 'حاڵەتەکانی مەڕ بەپێی ناو، جۆر، سیستەمی لەش و توندی بگەڕێ. بە ناوی ئینگلیزی، کوردی یان عەرەبی و نیشانەکان بگەڕێ.',
      searchDiseases: 'بە نەخۆشی یان نیشانە بگەڕێ', searchPlaceholder: 'بۆ نموونە: هەوکردنی مەمک، تا، لەنگبوون…',
      typeFilter: 'جۆری نەخۆشی', systemFilter: 'سیستەمی لەش', severityFilter: 'توندی',
      allTypes: 'هەموو جۆرەکان', allSystems: 'هەموو سیستەمەکان', allSeverities: 'هەموو ئاستەکان',
      sortBy: 'ڕیزکردن', sortAz: 'ناو A–Z', sortZa: 'ناو Z–A',
      clearAllFilters: 'سڕینەوەی فلتەرەکان', filterResults: 'فلتەرکردنی ئەنجامەکان',
      showingCount: '{visible} لە {total} حاڵەت', activeFilters: 'فلتەرە چالاکەکان',
      typeShort: 'جۆر', systemShort: 'سیستەم', severityShort: 'توندی', searchShort: 'گەڕان',
      noDiseasesTitle: 'هیچ حاڵەتێک لەگەڵ ئەم فلتەرانە ناگونجێت',
      noDiseasesBody: 'گەڕانێکی فراوانتر تاقیبکەرەوە، فلتەرێک لابەرە، یان ڕێنووسی نەخۆشی یان نیشانەکە بپشکنە.',
      resetFilters: 'ڕێکخستنەوەی فلتەرەکان', compareShort: 'بەراورد', comparedShort: 'لە بەراورددا',
      viewDetails: 'تۆمارەکە ببینە', zoonoticShort: 'بۆ مرۆڤ', reportableShort: 'ڕاپۆرتکراو',
      animalCattle: 'مانگا', animalSheep: 'مەڕ', removeFilter: 'لابردنی فلتەری {name}',
      backToCattle: 'هەموو نەخۆشییەکانی مانگا', backToSheep: 'هەموو نەخۆشییەکانی مەڕ',
      quickFacts: 'بە کورتی', causativeAgent: 'هۆکاری نەخۆشی', affectedAnimals: 'ئاژەڵ و تەمەنی تووشبوو',
      bodySystems: 'سیستەمەکانی لەش', diseaseType: 'جۆری نەخۆشی', severityLabel: 'توندی',
      zoonoticRisk: 'مەترسی بۆ مرۆڤ', meatSafety: 'سەلامەتی گۆشت بۆ خواردن دوای پشکنین', meatSafetyShort: 'سەلامەتی گۆشت', reportingStatus: 'ڕاپۆرتکردن', yes: 'بەڵێ', no: 'نەخێر',
      reportable: 'ڕاپۆرتکراو', notUsuallyReportable: 'زۆرجار ڕاپۆرت ناکرێت',
      symptomsHeading: 'نیشانەکان', diagnosisHeading: 'دەستنیشانکردن', treatmentHeading: 'چارەسەر',
      preventionHeading: 'خۆپارێزی و پێدانی ڤاکسین', aliasesLabel: 'بە ناوەکانی دیکەش ناسراوە',
      postMortemHeading: 'پشکنینی دوای مردن',
      postMortemNote: 'دۆزینەوەکانی پشکنینی دوای مردن پشتگیری دەستنیشانکردن دەکەن بەڵام جێگەی تاقیکردنەوەی تاقیگە ناگرنەوە. کەرەستەی پاراستن بەکاربهێنە و یاساکانی ناوچە پەیڕەو بکە؛ هەرگیز تەرمێکی گومانلەسەر بە ئەنتراکس مەکەرەوە.',
      addToCompare: 'زیادکردن بۆ بەراورد', inComparison: 'لە بەراورددا',
      reportAlert: 'نەخۆشییەکی ڕاپۆرتکراوە. ئاژەڵ یان نموونە مەگوازەوە. دەستبەجێ پەیوەندی بە دەسەڵاتی ڤێتەرینەری بکە.',
      fieldSafetyTitle: 'سەلامەتی مەیدان', fieldSafetyBody: 'دەستکێشی پاک بپۆشە و دوای دەستلەکارکێشانەوە لە ئاژەڵی نەخۆش، شلەکانی منداڵبوون یان تەرم دەست بشۆ. منداڵان و ژنانی دووگیان و کەسانی نەخۆش لە مادەی مەترسیدار دوور بهێڵەرەوە.',
      languageContentNote: 'وەسفە کلینیکییەکان بە ئینگلیزی نیشان دراون. ناوی نەخۆشی و نیشانەکانی ڕووکار بە سێ زمان بەردەستن.',
      updatedNote: 'نوێکردنەوەی سەرچاوە: ٣٠ی تشرینی یەکەمی ٢٠٢٦', animalLabel: 'ئاژەڵ',
      compareTitle: 'بەراوردکردنی دوو نەخۆشی', compareIntro: 'دوو حاڵەت هەڵبژێرە بۆ بینینی هۆکار، نیشانە، دۆزینەوەی دوای مردن، سەلامەتی گۆشت، چارەسەر و خۆپارێزی بە شێوەیەکی بەراورد.',
      firstDisease: 'نەخۆشی یەکەم', secondDisease: 'نەخۆشی دووەم', chooseDisease: 'نەخۆشییەک هەڵبژێرە…',
      swapSides: 'جێگۆڕینی لایەکان', comparePromptTitle: 'دوو نەخۆشی هەڵبژێرە بۆ دەستپێکردن',
      comparePromptBody: 'دوو لیستی سەرەوە بەکاربهێنە. دەتوانیت نەخۆشییەکانی مانگا و مەڕیش بەراورد بکەیت.',
      compareDisclaimer: 'ئەم بەراوردە تەنها بۆ فێربوونە. جێگەی پشکنینی کلینیکی، ڕێنمایی ڤێتەرینەری ناوچە یان یاساکانی ڕاپۆرتکردن ناگرێتەوە.',
      sharedSigns: 'نیشانەکانی هاوبەش', noSharedSigns: 'هیچ نیشانەیەکی هاوبەش نییە.',
      compareClear: 'سڕینەوەی بەراورد', sameDisease: 'تکایە دوو نەخۆشی جیاواز هەڵبژێرە.',
      overviewLabel: 'کورتە', diagnosisLabel: 'دەستنیشانکردن', treatmentLabel: 'چارەسەر', preventionLabel: 'خۆپارێزی',
      fullEntry: 'تۆمارە تەواوەکە بکەرەوە',
      checkerTitle: 'پشکنینی نیشانە', checkerIntro: 'تەنها بۆ فێربوون. ئەو نیشانانەی دەیبینیت هەڵبژێرە، ئێمە نەخۆشییەکانی پەیوەندیدار پیشان دەدەین. هەمیشە لەگەڵ ڤێتەرینەر دڵنیابەرەوە.',
      checkerWarning: 'ئەم ئامرازە بۆ بڕیاردان لە چارەسەر، دواکردنی پەیوەندیکردن بە ڤێتەرینەر یان دەستنیشانکردن بەکارمەهێنە. زۆر نەخۆشی نیشانەی هاوبەشيان هەیە.',
      animalScope: 'ئاژەڵ', allAnimals: 'هەموو', selectSignsTitle: 'نیشانەکانی بەرچاوت هەڵبژێرە',
      selectSignsHint: 'یەک یان زیاتر نیشانە هەڵبژێرە. لیستی نەخۆشییە گەرمەکان دەستبەجێ نوێ دەبێتەوە.',
      clearSymptoms: 'سڕینەوەی نیشانەکان', signsSelected: '{count} هەڵبژێردراو',
      possibleResults: 'نەخۆشییە گەرمەکان', possibleResultsHint: 'بەپێی ئەوەی چەند نیشانەی هاوبەش هەیە ڕیزکراون. ئەمە دەستنیشانکردن نییە.',
      checkerPlaceholderTitle: 'لە نیشانەکانەوە دەست پێبکە', checkerPlaceholderBody: 'لانیکەم یەک نیشانە هەڵبژێرە بۆ بینینی حاڵەتەکان. فلتەری ئاژەڵ بەکاربهێنە بۆ تەسککردنەوە.',
      matchLabel: 'لێکچوونی {percent}٪', signsMatched: '{matched} لە {selected} نیشانەی هەڵبژێردراو',
      showAllResults: 'هەموو {count} ئەنجام پیشان بدە', showFewerResults: 'کەمتر پیشان بدە',
      noMatchTitle: 'هیچ حاڵەتێکی گونجاو نییە', noMatchBody: 'هیچ تۆمارێک هەموو نیشانەکان پێکەوە ناگرێتەوە. نیشانەیەک لابەرە یان ئاژەڵێکی دیکە هەڵبژێرە.',
      clearAndStart: 'هەموو نیشانەکان بسڕەوە', groupGeneral: 'نیشانە گشتییەکان',
      checkerDisclaimer: 'تەنها بۆ فێربوون. پرسیار لە ڤێتەرینەرێکی مۆڵەتدار بکە. لە حاڵەتی فریاکەوتن — سەختێی هەناسەدان، مردنی لەناکاو، ئاوسانی توند یان گومانی ئەنتراکس — دەستبەجێ یارمەتی ڤێتەرینەری بەدەستبهێنە.',

      addEyebrow: 'بەشداریکردن لە ڕێنماییەکە',
      addTitle: 'زیادکردنی تۆمارێکی نەخۆشی',
      addIntro: 'خانەکانی خوارەوە پڕبکەرەوە بۆ دروستکردنی تۆمارێکی نوێ. سێرڤەری ناوخۆیی تۆمارەکە لە data.json پاشەکەوت دەکات و وێنەکە لە فۆڵدەری images دادەنێت.',
      addServerChecking: 'پشکنینی سێرڤەری ناوخۆیی…',
      addServerOk: 'سێرڤەری ناوخۆیی پەیوەستە. تۆمارەکەت لە data.json پاشەکەوت دەکرێت.',
      addServerDown: 'بیرگەی وێبگەڕ بەردەست نییە. بڕۆکۆڵی ناوچەی وێبگەڕ چالاک بکە و دووبارە باربکەرەوە.',
      addSectionBasics: 'زانیاری بنەڕەتی',
      addSectionClinical: 'وردەکاری کلینیکی',
      addSectionSafety: 'سەلامەتی و ڕاپۆرتکردن',
      addSectionPhoto: 'وێنە',
      addNameEn: 'ناو (ئینگلیزی)', addNameKu: 'ناو (کوردی)', addNameAr: 'ناو (عەرەبی)',
      addSummaryEn: 'پوختە (ئینگلیزی)', addSummaryKu: 'پوختە (کوردی)', addSummaryAr: 'پوختە (عەرەبی)',
      addAliases: 'ناوەکانی تر', addAliasesHint: 'ناوەکان بە کۆما جیاکەرەوە.',
      addAnimal: 'ئاژەڵ', addAnimalNew: 'زیادکردنی ئاژەڵ', addAnimalEn: 'ناوی ئاژەڵ (ئینگلیزی)', addAnimalKu: 'ناوی ئاژەڵ (کوردی)', addAnimalAr: 'ناوی ئاژەڵ (عەرەبی)', addAnimalSave: 'زیادکردنی ئاژەڵ', addAnimalSaved: 'ئاژەڵ زیادکرا.', addType: 'جۆری نەخۆشی', addSeverity: 'ئاستی مەترسی',
      addSystems: 'کۆئەندامەکانی لەش', addSystemsHint: 'هەموو ئەو کۆئەندامانە هەڵبژێرە کە نەخۆشیەکە کاریگەری لێدەکات.',
      addCausative: 'هۆکاری نەخۆشی', addAffected: 'ئاژەڵە تووشبووەکان و تەمەن',
      addSymptoms: 'نیشانەکان', addSymptomsHint: 'هەر نیشانەیەک لە دێرێکی نوێ.',
      addSymptomTags: 'تاگەکانی پشکنینی نیشانە', addSymptomTagsHint: 'ئەو نیشانانە هەڵبژێرە کە پشکنینی نیشانە بەکاریدەهێنێت.',
      addTagFilter: 'فلتەری نیشانەکان…', addTagsSelected: '{count} هەڵبژێردراو',
      addDiagnosis: 'دەستنیشانکردن', addPostMortem: 'پشکنینی دوای مردن', addTreatment: 'چارەسەر', addPrevention: 'خۆپارێزی و ڤاکسین',
      addZoonotic: 'مەترسی بۆ مرۆڤ', addZoonoticNote: 'تێبینی مەترسی بۆ مرۆڤ',
      addNotifiable: 'ڕاپۆرتکردن', addNotifiableNote: 'تێبینی ڕاپۆرتکردن',
      addMeatSafe: 'سەلامەتی گۆشت دوای پشکنین', addMeatNote: 'تێبینی سەلامەتی گۆشت',
      addImage: 'وێنە', addImageHint: 'JPG، PNG، WebP یان GIF، تا ٥ مێگابایت. ئارەزوومەندانە.',
      addImageChoose: 'وێنەیەک هەڵبژێرە', addImageRemove: 'وێنە لابەرە',
      addImageAlt: 'وەسفی وێنە (دەقی جێگرەوە)', addImageAltHint: 'وەسفی بکە چی لە وێنەکەدا دەبینرێت، بۆ خوێنەرەکانی شاشە.',
      addRequiredNote: 'خانەکانی نیشانەکراو بە * پێویستن.',
      addSubmit: 'پاشەکەوتکردنی تۆمار', addSaving: 'پاشەکەوت دەکرێت…',
      addCancel: 'پاشگەزبوونەوە', addSuccess: 'تۆماری نەخۆشی پاشەکەوت کرا.',
      addError: 'نەتوانرا تۆمارەکە پاشەکەوت بکرێت.',
      addErrorValidation: 'خانە نیشانکراوەکان بپشکنە و دووبارە هەوڵبدە.',
      addNeedSystems: 'لانیکەم یەک کۆئەندام هەڵبژێرە.',
      addNeedSymptoms: 'لانیکەم یەک نیشانە زیاد بکە.',
      addNeedTags: 'لانیکەم یەک تاگی پشکنینی نیشانە هەڵبژێرە.',
      addNeedMeat: 'هەڵبژێرە ئایا گۆشت دوای پشکنین سەلامەتە.',
      addImageTooLarge: 'وێنەکە لە ٥ مێگابایت گەورەترە.',
      addImageBadType: 'وێنەی JPG، PNG، WebP یان GIF بەکاربهێنە.',
      addServerRequired: 'بۆ پاشەکەوتکردنی تۆمار سێرڤەری ناوخۆیی پێویستە.',
      addChoose: 'هەڵبژێرە…',
      addNoTags: 'هیچ نیشانەیەک لەگەڵ ئەم فلتەرە ناگونجێت.',
      addFieldRequired: '{field} پێویستە.',

      navAccount: 'چوونەژوورەوە', navAccountAdmin: 'هەژمار',
      loginEyebrow: 'دەستگەیشتنی بەڕێوەبەر',
      loginTitle: 'بچۆ ژوورەوە بۆ بەڕێوەبردنی نەخۆشیەکان',
      loginIntro: 'تەنها بەڕێوەبەر دەتوانێت تۆماری نەخۆشی زیاد بکات یان دەستکاری بکات. باقی ڕێنماییەکە بۆ هەمووان کراوەیە.',
      loginUser: 'ناوی بەکارهێنەر', loginPassword: 'وشەی نهێنی',
      loginSubmit: 'چوونەژوورەوە', loginSaving: 'دەچێتە ژوورەوە…',
      loginEmpty: 'ناوی بەکارهێنەر و وشەی نهێنی بنووسە.',
      loginError: 'داواکاری چوونەژوورەوە سەرکەوتوو نەبوو. ئایا سێرڤەری ناوخۆیی کاردەکات؟',
      loginInvalid: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە.',
      loginLocked: 'هەوڵی زۆر شکستخواردوو. خولەکێک چاوەڕوان بە و دووبارە هەوڵبدە.',
      loginNote: 'گۆڕانکاریەکانی بەڕێوەبەر لە ئەم وێبگەڕەدا بە شێوەی ناوخۆیی پاشەکەوت دەکرێن. هیچ شتێک بۆ ئینتەرنێت نانێردرێت.',
      loginNeeded: 'بۆ زیادکردن یان دەستکاریکردنی نەخۆشی، وەک بەڕێوەبەر بچۆ ژوورەوە.',
      loginWelcome: 'وەک بەڕێوەبەر چوویتە ژوورەوە.',
      loginSignOut: 'چوونەدەرەوە', loginSignedOut: 'چوویتە دەرەوە.',
      accountTitle: 'هەژماری بەڕێوەبەر',
      accountSignedIn: 'چوویتە ژوورەوە وەک',
      accountBody: 'دەتوانیت تۆماری نوێی نەخۆشی زیاد بکەیت و هەر تۆمارێکی هەبوو دەستکاری بکەیت، لەگەڵ وێنەکەی.',
      authExpired: 'دانیشتنەکەت بەسەرچوو. بۆ بەردەوامبوون دووبارە بچۆ ژوورەوە.',
      editDisease: 'دەستکاریکردنی نەخۆشی',
      editTitle: 'دەستکاریکردنی تۆماری نەخۆشی',
      editEyebrow: 'دەستکاری بەڕێوەبەر',
      editIntro: 'هەر خانەیەک نوێ بکەرەوە، وێنەکە بگۆڕە یان لابەرە، پاشان پاشەکەوت بکە. تۆمارەکە ناسنامە و بەستەرەکانی خۆی دەپارێزێت.',
      editSubmit: 'پاشەکەوتکردنی گۆڕانکاریەکان',
      editSaving: 'پاشەکەوت دەکرێت…',
      editSuccess: 'تۆماری نەخۆشی نوێکرایەوە.',
      addCurrentPhoto: 'وێنەی ئێستا',
      comparison: 'بەراورد', compareNow: 'بەراورد بکە', clear: 'سڕینەوە',
      compareTrayPrompt: 'تا دوو نەخۆشی هەڵبژێرە بۆ بەراورد.',
      toastAdded: 'زیادکرا بۆ بەراورد', toastRemoved: 'لە بەراورد لابردرا',
      toastMax: 'تەنها دوو نەخۆشی دەتوانیت بەراورد بکەیت. یەکێک لابەرە.',
      toastNeedTwo: 'دوو نەخۆشی هەڵبژێرە بۆ بەراورد.', toastSame: 'دوو نەخۆشی جیاواز هەڵبژێرە.',
      toastCleared: 'بەراورد سڕایەوە.', toastNoFile: 'نەتوانرا ئەو فایلە بخوێنرێتەوە.',
      invalidData: 'ئەمە فایلێکی زانیاری دروستی VetAtlas نییە.',
      errorTitle: 'ڕێنماییەکە نەتوانرا بارکرێت',
      errorBody: 'نەتوانرا data.json بخوێنرێتەوە. ئەگەر index.html ڕاستەوخۆ لە دیسکەوە کردووەتەوە، ڕەنگە وێبگەڕەکەت فایلی JSONی ناوخۆیی بەهۆی پاراستنەوە بلۆک بکات.',
      errorServer: 'ئەم فۆڵدەرە لەسەر هەر سێرڤەرێکی ستاتیک بڵاو بکەرەوە، پاشان لاپەڕەکە نوێ بکەرەوە.',
      errorChoose: 'data.json لە خوارەوە هەڵبژێرە بۆ کردنەوەی ڕێنماییەکە بە ڕاستەوخۆ:',
      chooseDataFile: 'data.json هەڵبژێرە',
      notFoundTitle: 'ئەم لاپەڕە لە ڕێنماییەکەدا نییە',
      notFoundBody: 'لەوانەیە بەستەرەکە کۆن یان هەڵە بێت. بگەڕێوە بۆ سەرەتا یان بەشەکانی مانگا و مەڕ ببینە.',
      notFoundBack: 'گەڕانەوە بۆ سەرەتا'
    },
    ar: {
      skipLink: 'تخطَّ إلى المحتوى',
      eduStrip: 'للتعليم فقط. استشر طبيباً بيطرياً مرخّصاً.',
      brandTagline: 'دليل ميداني للأبقار والأغنام',
      navHome: 'الرئيسية', navCattle: 'الأبقار', navSheep: 'الأغنام', navCompare: 'مقارنة', navChecker: 'فاحص الأعراض', navAdd: 'إضافة مرض',
      language: 'اللغة', themeToggle: 'تبديل المظهر', themeDark: 'استخدام الوضع الداكن', themeLight: 'استخدام الوضع الفاتح',
      menuOpen: 'فتح القائمة', menuClose: 'إغلاق القائمة',
      footerAlertTitle: 'رفيق ميداني، وليس تشخيصاً',
      footerAlertBody: 'تتشابه علامات الأمراض، وتعتمد المعالجة على القوانين المحلية وتوافر الأدوية وحالة الحيوان. استشر طبيباً بيطرياً مرخّصاً دائماً قبل العلاج أو النقل أو الإعدام. في حال الاشتباه بمرض يجب الإبلاغ عنه، اتصل بالجهة البيطرية المختصة فوراً.',
      footerTagline: 'معلومات مرضية واضحة وعملية لرعاية أفضل للحيوانات.',
      retry: 'إعادة المحاولة', backHome: 'العودة إلى الرئيسية',
      heroEyebrow: 'مرجع بيطري جاهز للميدان',
      heroTitleTop: 'اعرف العلامات.',
      heroTitleBottom: 'احمِ القطيع.',
      heroLede: 'دليل واضح وعملي لأمراض الأبقار والأغنام لطلاب الطب البيطري والمزارعين والعاملين في الميدان — من أول علامة إلى الوقاية.',
      heroSearchLabel: 'ابحث في الدليل',
      heroSearchPlaceholder: 'ابحث عن مرض أو علامة أو عرض…',
      heroQuickLabel: 'جرّب البحث:',
      heroQuickFever: 'حمى', heroQuickMastitis: 'التهاب الضرع', heroQuickBloat: 'انتفاخ الكرش',
      statDiseases: 'مدخلات مرضية', statSpecies: 'نوع حيوان', statLanguages: 'لغات',
      browseEyebrow: 'تصفح المرجع', browseTitle: 'اختر حيوانك',
      browseLead: 'يقدم كل مدخل العامل المسبب والعلامات والتشخيص ونتائج فحص ما بعد الوفاة والعلاج والوقاية وحالة سلامة اللحم ومعلومات الإبلاغ.',
      cattleDesc: 'من حمى الحليب والتهاب الضرع إلى أمراض القراد وإسهال العجول والحالات الطارئة الواجب الإبلاغ عنها.',
      sheepDesc: 'من تعفن القدم وإصابة الذباب إلى تسمم الحمل وطاعون المجترات الصغيرة وأمراض القطيع الخطيرة.',
      conditionsCount: '{count} حالة', exploreCattle: 'استكشف أمراض الأبقار', exploreSheep: 'استكشف أمراض الأغنام',
      featuresEyebrow: 'أدوات عملية', featuresTitle: 'أكثر من مجرد قائمة', featuresLead: 'ابحث حسب العلامة، وقارن مرضين جنباً إلى جنب، أو ابدأ من العلامات التي تراها.',
      compareFeatureTitle: 'مقارنة الأمراض', compareFeatureDesc: 'قارن مرضين للأبقار أو الأغنام واعرف الفروق في العلامات والسبب والسيطرة.',
      checkerFeatureTitle: 'فاحص الأعراض', checkerFeatureDesc: 'حدد العلامات التي تراها لاستكشاف أمراض محتملة. للتعليم فقط — وليس تشخيصاً.',
      guideFeatureTitle: 'مصمم للميدان', guideFeatureDesc: 'سريع وسهل بلوحة المفاتيح ويعمل دون إنترنت بالكامل. مناسب للهاتف داخل الحظيرة.',
      ctaEyebrow: 'ابدأ مما تراه', ctaTitle: 'لست متأكداً من أين تبدأ؟',
      ctaBody: 'استخدم فاحص الأعراض التعليمي لاستكشاف الحالات المحتملة، ثم افتح مدخلاً كاملاً وتأكد مع الطبيب البيطري.',
      ctaButton: 'افتح فاحص الأعراض',
      searchMatches: '{count} نتيجة', searchNoResults: 'لا توجد أمراض تطابق هذا البحث. جرّب اسماً أو علامة أخرى.',
      searchResultsLabel: 'نتائج البحث',
      cattleListTitle: 'أمراض الأبقار', sheepListTitle: 'أمراض الأغنام',
      cattleListIntro: 'تصفح حالات الأبقار حسب الاسم والنوع والجهاز والخطورة. ابحث بالأسماء أو العلامات بالإنجليزية أو الكردية أو العربية.',
      sheepListIntro: 'تصفح حالات الأغنام حسب الاسم والنوع والجهاز والخطورة. ابحث بالأسماء أو العلامات بالإنجليزية أو الكردية أو العربية.',
      searchDiseases: 'ابحث بالمرض أو العلامة', searchPlaceholder: 'مثال: التهاب الضرع، حمى، عرج…',
      typeFilter: 'نوع المرض', systemFilter: 'جهاز الجسم', severityFilter: 'الخطورة',
      allTypes: 'كل الأنواع', allSystems: 'كل الأجهزة', allSeverities: 'كل المستويات',
      sortBy: 'ترتيب', sortAz: 'الاسم أ–ي', sortZa: 'الاسم ي–أ',
      clearAllFilters: 'مسح كل عوامل التصفية', filterResults: 'تصفية النتائج',
      showingCount: '{visible} من {total} حالة', activeFilters: 'عوامل التصفية النشطة',
      typeShort: 'النوع', systemShort: 'الجهاز', severityShort: 'الخطورة', searchShort: 'بحث',
      noDiseasesTitle: 'لا توجد حالات مطابقة',
      noDiseasesBody: 'جرّب بحثاً أوسع أو احذف عامل تصفية أو تحقق من تهجئة المرض أو العلامة.',
      resetFilters: 'إعادة ضبط التصفية', compareShort: 'مقارنة', comparedShort: 'في المقارنة',
      viewDetails: 'عرض المدخل كاملاً', zoonoticShort: 'ممرض للإنسان', reportableShort: 'واجب الإبلاغ',
      animalCattle: 'الأبقار', animalSheep: 'الأغنام', removeFilter: 'إزالة عامل التصفية {name}',
      backToCattle: 'كل أمراض الأبقار', backToSheep: 'كل أمراض الأغنام',
      quickFacts: 'نظرة سريعة', causativeAgent: 'العامل المسبب', affectedAnimals: 'الحيوانات والفئة العمرية المصابة',
      bodySystems: 'أجهزة الجسم', diseaseType: 'نوع المرض', severityLabel: 'الخطورة',
      zoonoticRisk: 'خطر حيواني المنشأ', meatSafety: 'سلامة اللحم للأكل بعد الفحص', meatSafetyShort: 'سلامة اللحم', reportingStatus: 'الإبلاغ / الإشعار', yes: 'نعم', no: 'لا',
      reportable: 'واجب الإبلاغ', notUsuallyReportable: 'لا يُبلَّغ عنه عادةً',
      symptomsHeading: 'الأعراض التي يجب ملاحظتها', diagnosisHeading: 'التشخيص', treatmentHeading: 'العلاج',
      preventionHeading: 'الوقاية والتطعيم', aliasesLabel: 'يُعرف أيضاً بـ',
      postMortemHeading: 'فحص ما بعد الوفاة',
      postMortemNote: 'تدعم نتائج فحص ما بعد الوفاة التشخيص لكنها لا تغني عن الفحوص المخبرية. استخدم معدات الحماية واتبع القواعد المحلية؛ لا تفتح جثة يُشتبه في إصابتها بالجمرة الخبيثة.',
      addToCompare: 'أضف إلى المقارنة', inComparison: 'في المقارنة',
      reportAlert: 'مرض واجب الإبلاغ. لا تنقل الحيوانات أو العينات. اتصل بالجهة البيطرية المختصة فوراً.',
      fieldSafetyTitle: 'سلامة الميدان', fieldSafetyBody: 'ارتدِ قفازات نظيفة واغسل يديك بعد التعامل مع الحيوانات المريضة أو سوائل الولادة أو الجثث. أبعِد الأطفال والحوامل ومضعفي المناعة عن المواد عالية الخطورة.',
      languageContentNote: 'الوصف السريري معروض بالإنجليزية. واجهة الموقع وأسماء الأمراض متاحة باللغات الثلاث.',
      updatedNote: 'آخر تحديث للمرجع: 30 أكتوبر 2026', animalLabel: 'الحيوان',
      compareTitle: 'قارن بين مرضين', compareIntro: 'اختر حالتين لعرض الأسباب والعلامات ونتائج فحص ما بعد الوفاة وسلامة اللحم والعلاج والوقاية جنباً إلى جنب.',
      firstDisease: 'المرض الأول', secondDisease: 'المرض الثاني', chooseDisease: 'اختر مرضاً…',
      swapSides: 'تبديل الجانبين', comparePromptTitle: 'اختر مرضين للبدء',
      comparePromptBody: 'استخدم القائمتين أعلاه. يمكنك مقارنة أمراض الأبقار والأغنام، حتى بين الأنواع.',
      compareDisclaimer: 'هذه المقارنة للتعليم فقط. لا تغني عن الفحص السريري أو المشورة البيطرية المحلية أو قواعد الإبلاغ الرسمية.',
      sharedSigns: 'علامات مشتركة بين المرضين', noSharedSigns: 'لا توجد علامات مشتركة في هذا المرجع.',
      compareClear: 'مسح المقارنة', sameDisease: 'يرجى اختيار مرضين مختلفين.',
      overviewLabel: 'نظرة عامة', diagnosisLabel: 'التشخيص', treatmentLabel: 'العلاج', preventionLabel: 'الوقاية',
      fullEntry: 'فتح المدخل الكامل',
      checkerTitle: 'فاحص الأعراض', checkerIntro: 'للاستكشاف التعليمي فقط. حدد العلامات التي تراها وسنعرض الأمراض التي تذكرها. تأكد دائماً مع الطبيب البيطري.',
      checkerWarning: 'لا تستخدم هذه الأداة لاتخاذ قرار علاج أو لتأخير الاتصال بالطبيب البيطري أو كتشخيص. تتشارك أمراض كثيرة العلامات، وبعضها حالات طارئة.',
      animalScope: 'الحيوان', allAnimals: 'الكل', selectSignsTitle: 'حدد العلامات التي تراها',
      selectSignsHint: 'اختر علامة أو أكثر. تتحدث قائمة الأمراض المحتملة فوراً.',
      clearSymptoms: 'مسح العلامات', signsSelected: '{count} محدد',
      possibleResults: 'أمراض محتملة', possibleResultsHint: 'مرتبة حسب عدد العلامات المختارة المشتركة. هذا ليس تشخيصاً.',
      checkerPlaceholderTitle: 'ابدأ من العلامات', checkerPlaceholderBody: 'حدد عرضاً واحداً على الأقل لرؤية الحالات المحتملة. استخدم مرشح الحيوان لتضييق المرجع.',
      matchLabel: 'تطابق العلامات {percent}٪', signsMatched: '{matched} من {selected} علامة مختارة',
      showAllResults: 'عرض كل النتائج ({count})', showFewerResults: 'عرض نتائج أقل',
      noMatchTitle: 'لا توجد حالات مطابقة', noMatchBody: 'لا يوجد مدخل يجمع كل هذه العلامات. جرّب إزالة علامة أو اختيار حيوان آخر.',
      clearAndStart: 'مسح كل العلامات', groupGeneral: 'علامات عامة',
      checkerDisclaimer: 'للتعليم فقط. استشر طبيباً بيطرياً مرخّصاً. في الحالات الطارئة — صعوبة تنفس شديدة أو موت مفاجئ أو انتفاخ شديد أو اشتباه بالجمرة الخبيثة — اطلب المساعدة البيطرية فوراً.',

      addEyebrow: 'ساهم في المرجع',
      addTitle: 'إضافة مدخل مرض جديد',
      addIntro: 'املأ الحقول أدناه لإنشاء مدخل جديد. يحفظه الخادم المحلي في data.json ويضع الصورة في مجلد images.',
      addServerChecking: 'جارٍ التحقق من الخادم المحلي…',
      addServerOk: 'الخادم المحلي متصل. سيُحفظ المدخل في data.json.',
      addServerDown: 'التخزين المحلي غير متاح. فعّل التخزين في المتصفح ثم أعد تحميل الصفحة.',
      addSectionBasics: 'الأساسيات',
      addSectionClinical: 'التفاصيل السريرية',
      addSectionSafety: 'السلامة والإبلاغ',
      addSectionPhoto: 'صورة',
      addNameEn: 'الاسم (الإنجليزية)', addNameKu: 'الاسم (الكردية)', addNameAr: 'الاسم (العربية)',
      addSummaryEn: 'الملخص (الإنجليزية)', addSummaryKu: 'الملخص (الكردية)', addSummaryAr: 'الملخص (العربية)',
      addAliases: 'أسماء أخرى', addAliasesHint: 'افصل الأسماء بفواصل.',
      addAnimal: 'الحيوان', addAnimalNew: 'إضافة حيوان', addAnimalEn: 'اسم الحيوان (الإنجليزية)', addAnimalKu: 'اسم الحيوان (الكردية)', addAnimalAr: 'اسم الحيوان (العربية)', addAnimalSave: 'إضافة الحيوان', addAnimalSaved: 'تمت إضافة الحيوان.', addType: 'نوع المرض', addSeverity: 'الخطورة',
      addSystems: 'أجهزة الجسم', addSystemsHint: 'اختر كل جهاز يتأثر بالمرض.',
      addCausative: 'العامل المسبب', addAffected: 'الحيوانات المصابة والفئة العمرية',
      addSymptoms: 'العلامات', addSymptomsHint: 'علامة واحدة في كل سطر.',
      addSymptomTags: 'وسوم فاحص الأعراض', addSymptomTagsHint: 'اختر العلامات التي يستخدمها فاحص الأعراض.',
      addTagFilter: 'تصفية العلامات…', addTagsSelected: '{count} محدد',
      addDiagnosis: 'التشخيص', addPostMortem: 'فحص ما بعد الوفاة', addTreatment: 'العلاج', addPrevention: 'الوقاية والتحصين',
      addZoonotic: 'خطر حيواني المنشأ', addZoonoticNote: 'ملاحظة الخطر الحيواني المنشأ',
      addNotifiable: 'واجب الإبلاغ', addNotifiableNote: 'ملاحظة الإبلاغ',
      addMeatSafe: 'سلامة اللحم بعد الفحص', addMeatNote: 'ملاحظة سلامة اللحم',
      addImage: 'صورة', addImageHint: 'JPG أو PNG أو WebP أو GIF، حتى 5 ميغابايت. اختياري.',
      addImageChoose: 'اختر صورة', addImageRemove: 'إزالة الصورة',
      addImageAlt: 'وصف الصورة (نص بديل)', addImageAltHint: 'صف ما تظهره الصورة لقارئات الشاشة.',
      addRequiredNote: 'الحقول المعلّمة بـ * مطلوبة.',
      addSubmit: 'حفظ مدخل المرض', addSaving: 'جارٍ الحفظ…',
      addCancel: 'إلغاء', addSuccess: 'تم حفظ مدخل المرض.',
      addError: 'تعذر حفظ المدخل.',
      addErrorValidation: 'تحقق من الحقول المعلّمة وحاول مرة أخرى.',
      addNeedSystems: 'اختر جهازاً واحداً على الأقل.',
      addNeedSymptoms: 'أضف علامة واحدة على الأقل.',
      addNeedTags: 'اختر وسماً واحداً على الأقل لفاحص الأعراض.',
      addNeedMeat: 'اختر ما إذا كان اللحم سليماً بعد الفحص.',
      addImageTooLarge: 'الصورة أكبر من 5 ميغابايت.',
      addImageBadType: 'استخدم صورة JPG أو PNG أو WebP أو GIF.',
      addServerRequired: 'يلزم الخادم المحلي لحفظ المدخلات.',
      addChoose: 'اختر…',
      addNoTags: 'لا توجد علامات تطابق هذا التصفية.',
      addFieldRequired: '{field} مطلوب.',

      navAccount: 'تسجيل الدخول', navAccountAdmin: 'الحساب',
      loginEyebrow: 'وصول المسؤول',
      loginTitle: 'سجّل الدخول لإدارة الأمراض',
      loginIntro: 'يمكن للمسؤول فقط إضافة مداخل الأمراض أو تعديلها. يبقى بقية المرجع متاحاً للجميع.',
      loginUser: 'اسم المستخدم', loginPassword: 'كلمة المرور',
      loginSubmit: 'تسجيل الدخول', loginSaving: 'جارٍ تسجيل الدخول…',
      loginEmpty: 'أدخل اسم المستخدم وكلمة المرور.',
      loginError: 'فشل طلب تسجيل الدخول. هل الخادم المحلي يعمل؟',
      loginInvalid: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
      loginLocked: 'محاولات فاشلة كثيرة. انتظر دقيقة ثم حاول مرة أخرى.',
      loginNote: 'تُحفظ تغييرات المسؤول في هذا المتصفح محلياً ولا تُرسل إلى الإنترنت.',
      loginNeeded: 'سجّل الدخول كمسؤول لإضافة الأمراض أو تعديلها.',
      loginWelcome: 'تم تسجيل الدخول كمسؤول.',
      loginSignOut: 'تسجيل الخروج', loginSignedOut: 'تم تسجيل الخروج.',
      accountTitle: 'حساب المسؤول',
      accountSignedIn: 'مسجّل الدخول باسم',
      accountBody: 'يمكنك إضافة مداخل أمراض جديدة وتعديل أي مدخل موجود، بما في ذلك صورته.',
      authExpired: 'انتهت جلستك. سجّل الدخول مرة أخرى للمتابعة.',
      editDisease: 'تعديل المرض',
      editTitle: 'تعديل مدخل المرض',
      editEyebrow: 'تعديل المسؤول',
      editIntro: 'حدّث أي حقل، واستبدل الصورة أو أزلها، ثم احفظ. يحتفظ المدخل بمعرّفه وروابطه.',
      editSubmit: 'حفظ التغييرات',
      editSaving: 'جارٍ الحفظ…',
      editSuccess: 'تم تحديث مدخل المرض.',
      addCurrentPhoto: 'الصورة الحالية',
      comparison: 'مقارنة', compareNow: 'قارن الآن', clear: 'مسح',
      compareTrayPrompt: 'اختر حتى مرضين للمقارنة.',
      toastAdded: 'أضيف إلى المقارنة', toastRemoved: 'أزيل من المقارنة',
      toastMax: 'يمكنك مقارنة مرضين فقط. احذف واحداً أولاً.',
      toastNeedTwo: 'اختر مرضين للمقارنة.', toastSame: 'اختر مرضين مختلفين.',
      toastCleared: 'تم مسح المقارنة.', toastNoFile: 'تعذر تحميل الملف.',
      invalidData: 'هذا لا يبدو ملف بيانات VetAtlas صالحاً.',
      errorTitle: 'تعذر تحميل الدليل',
      errorBody: 'تعذرت قراءة data.json. إذا فتحت index.html مباشرة من القرص، فقد يحظر المتصفح ملفات JSON المحلية لأسباب أمنية.',
      errorServer: 'استضف هذا المجلد على أي خادم استاتيكي ثم أعد تحميل الصفحة.',
      errorChoose: 'اختر data.json أدناه لتحميل الدليل مباشرة:',
      chooseDataFile: 'اختر data.json',
      notFoundTitle: 'هذه الصفحة غير موجودة في الدليل',
      notFoundBody: 'قد يكون الرابط قديماً أو غير صحيح. عد إلى الرئيسية أو تصفح أقسام الأبقار والأغنام.',
      notFoundBack: 'العودة إلى الرئيسية'
    }
  };

  /* ---------- App state ---------- */
  const state = {
    lang: ['en', 'ku', 'ar'].includes(PREF.get('vetatlas.lang', 'en')) ? PREF.get('vetatlas.lang', 'en') : 'en',
    theme: document.documentElement.dataset.theme,
    data: null,
    route: null,
    listFilters: {
      cattle: { q: '', type: 'all', system: 'all', severity: 'all', sort: 'az' },
      sheep: { q: '', type: 'all', system: 'all', severity: 'all', sort: 'az' }
    },
    compareKeys: [],
    compareLeft: '',
    compareRight: '',
    checker: { animal: 'all', selected: new Set(), showAll: false },
    homeQuery: '',
    loadingError: false
  };

  const SYSTEM_ICONS = {
    respiratory: 'lungs', digestive: 'stomach', skin: 'skin', musculoskeletal: 'bone',
    reproductive: 'reproductive', nervous: 'brain', mammary: 'udder', urinary: 'kidney',
    circulatory: 'heart', systemic: 'pulse', general: 'pulse'
  };
  const SYMPTOM_GROUP_ORDER = ['general', 'digestive', 'respiratory', 'skin', 'musculoskeletal', 'reproductive', 'mammary', 'nervous', 'urinary', 'circulatory', 'systemic'];
  const RTL_LANGS = ['ku', 'ar'];

  let toastTimer = null;

  /* ---------- Tiny helpers ---------- */
  function t(key, vars = {}) {
    const dict = STRINGS[state.lang] || STRINGS.en;
    const value = dict[key] ?? STRINGS.en[key] ?? key;
    return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
  }

  function repairText(value) {
    let text = String(value ?? '');
    if (!/[\u00c2-\u00c3\u00d8-\u00da]/.test(text)) return text;
    for (let pass = 0; pass < 6; pass++) {
      try {
        const bytes = Uint8Array.from(text, character => character.charCodeAt(0) & 0xff);
        const candidate = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        if (!candidate || candidate === text) break;
        text = candidate;
      } catch {
        break;
      }
      if (!/[\u00c2-\u00c3\u00d8-\u00da]/.test(text)) break;
    }
    return text;
  }

  function esc(value) {
    return repairText(value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function icon(name, className = '') {
    return `<svg class="icon${className ? ' ' + className : ''}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
  }

  function langDir(lang) {
    return RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  }

  function localeName() {
    return state.lang === 'ar' ? 'ar' : state.lang === 'ku' ? 'ckb' : 'en-GB';
  }

  function formatNumber(value) {
    try { return new Intl.NumberFormat(localeName()).format(value); } catch { return String(value); }
  }

  function normalized(value) {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u064b-\u065f\u0670]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tr(obj) {
    if (!obj) return '';
    return repairText(obj[state.lang] || obj.en || '');
  }

  function byKey(key) {
    if (!state.data || !key) return null;
    return state.data.diseases.find(d => `${d.animal}:${d.id}` === key) || null;
  }

  function typeMeta(id) { return state.data?.types.find(x => x.id === id) || { en: id, ku: id, ar: id }; }
  function systemMeta(id) { return state.data?.systems.find(x => x.id === id) || { en: id, ku: id, ar: id }; }
  function severityMeta(id) { return state.data?.severities.find(x => x.id === id) || { en: id, ku: id, ar: id }; }
  function animalMeta(id) { return state.data?.animals.find(x => x.id === id) || { id, en: id, ku: id, ar: id }; }
  function symptomMeta(id) { return state.data?.symptomCatalog.find(x => x.id === id) || { id, en: id, ku: id, ar: id }; }

  function localizedName(d) { return tr(d.name); }
  function localizedSummary(d) { return tr(d.summary); }
  function altName(d) {
    const otherLang = state.lang === 'en' ? 'ku' : 'en';
    if (!d.name[otherLang] || d.name[otherLang] === d.name[state.lang]) return '';
    return d.name[otherLang];
  }

  function systemChip(id) {
    return `<span class="system-chip">${icon(SYSTEM_ICONS[id] || 'pulse')}${esc(tr(systemMeta(id)))}</span>`;
  }

  function severityBadge(d) {
    return `<span class="severity severity--${esc(d.severity)}">${esc(tr(severityMeta(d.severity)))}</span>`;
  }

  function typePill(d, large = false) {
    return `<span class="pill pill--type${large ? ' pill--large' : ''}">${esc(tr(typeMeta(d.type)))}</span>`;
  }

  function meatBadge(d, large = false) {
    if (typeof d.meatSafe !== 'boolean') return '';
    const size = large ? ' pill--large' : '';
    return d.meatSafe
      ? `<span class="pill${size} pill--safe">${icon('shield')} ${esc(t('meatSafetyShort'))}: ${esc(t('yes'))}</span>`
      : `<span class="pill${size} pill--zoonotic">${icon('alert')} ${esc(t('meatSafetyShort'))}: ${esc(t('no'))}</span>`;
  }

  function imageSrc(d) {
    if (!d || typeof d.image !== 'string') return '';
    const value = d.image.trim();
    if (!value) return '';
    return /^(https?:)?\/\//i.test(value) || value.startsWith('/') ? value : value.replace(/^\.\//, '');
  }

  /* ---------- Browser-only administrator storage ---------- */
  const ADMIN_USER = 'admin';
  const ADMIN_PASSWORD = '@Hunar2005';
  const ADMIN_SESSION_TOKEN = 'vetatlas-local-admin-session';
  const LOCAL_DATA_KEY = 'vetatlas.localData';

  function getLocalData() {
    try { return JSON.parse(localStorage.getItem(LOCAL_DATA_KEY) || '{}') || {}; }
    catch { return {}; }
  }

  function saveLocalData(next) {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(next));
  }

  function mergeLocalData(baseData) {
    const local = getLocalData();
    const deletedAnimals = new Set(local.deletedAnimals || []);
    const deletedDiseases = new Set(local.deletedDiseases || []);
    const animalsById = new Map((baseData.animals || []).filter(animal => !deletedAnimals.has(animal.id)).map(animal => [animal.id, { ...animal }]));
    for (const animal of local.animals || []) {
      if (!deletedAnimals.has(animal.id)) animalsById.set(animal.id, { ...animal });
    }
    const diseaseByKey = new Map();
    for (const disease of baseData.diseases || []) {
      const key = `${disease.animal}:${disease.id}`;
      if (!deletedDiseases.has(key) && !deletedAnimals.has(disease.animal)) diseaseByKey.set(key, { ...disease });
    }
    for (const disease of local.diseases || []) {
      const key = `${disease.animal}:${disease.id}`;
      if (!deletedDiseases.has(key) && !deletedAnimals.has(disease.animal)) diseaseByKey.set(key, { ...disease });
    }
    return { ...baseData, animals: [...animalsById.values()], diseases: [...diseaseByKey.values()] };
  }

  function saveLocalDisease(disease) {
    const local = getLocalData();
    local.diseases = [...(local.diseases || []).filter(item => !(item.animal === disease.animal && item.id === disease.id)), { ...disease }];
    local.deletedDiseases = (local.deletedDiseases || []).filter(key => key !== `${disease.animal}:${disease.id}`);
    saveLocalData(local);
  }

  function deleteLocalDisease(animal, id) {
    const local = getLocalData();
    local.diseases = (local.diseases || []).filter(item => !(item.animal === animal && item.id === id));
    local.deletedDiseases = [...new Set([...(local.deletedDiseases || []), `${animal}:${id}`])];
    saveLocalData(local);
  }

  function saveLocalAnimal(animal) {
    const local = getLocalData();
    local.animals = [...(local.animals || []).filter(item => item.id !== animal.id), { ...animal }];
    local.deletedAnimals = (local.deletedAnimals || []).filter(id => id !== animal.id);
    saveLocalData(local);
  }

  function deleteLocalAnimal(id) {
    const local = getLocalData();
    local.animals = (local.animals || []).filter(item => item.id !== id);
    local.deletedAnimals = [...new Set([...(local.deletedAnimals || []), id])];
    local.deletedDiseases = [...new Set([...(local.deletedDiseases || []), ...(local.diseases || []).filter(disease => disease.animal === id).map(disease => `${disease.animal}:${disease.id}`)])];
    local.diseases = (local.diseases || []).filter(disease => disease.animal !== id);
    saveLocalData(local);
  }

  /* ---------- Administrator session helpers ---------- */
  function authHeaders(extra = {}) {
    return AUTH.token ? { ...extra, Authorization: `Bearer ${AUTH.token}` } : { ...extra };
  }

  function applyAuthUI() {
    const admin = Boolean(AUTH.user);
    document.querySelectorAll('[data-admin-only]').forEach(el => { el.hidden = !admin; });
    document.querySelectorAll('[data-nav="account"]').forEach(el => {
      el.textContent = t(admin ? 'navAccountAdmin' : 'navAccount');
    });
  }

  function saveSession(token, user) {
    AUTH.token = token || '';
    AUTH.user = user || 'admin';
    PREF.set(AUTH.key, AUTH.token);
    applyAuthUI();
  }

  function clearSession() {
    AUTH.token = '';
    AUTH.user = '';
    try { localStorage.removeItem(AUTH.key); } catch { /* private mode */ }
    applyAuthUI();
  }

  async function initAuth() {
    if (!AUTH.token) {
      AUTH.user = '';
      applyAuthUI();
      return;
    }
    try {
      if (AUTH.token !== ADMIN_SESSION_TOKEN) throw new Error('unauthorized');
      AUTH.user = ADMIN_USER;
    } catch {
      clearSession();
    }
    applyAuthUI();
  }

  async function signOut() {
    clearSession();
    showToast(t('loginSignedOut'));
    navigateTo('#/');
  }

  function compareKey(d) { return `${d.animal}:${d.id}`; }
  function isComparing(d) { return state.compareKeys.includes(compareKey(d)); }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  function sortCollator() {
    try { return new Intl.Collator(localeName(), { sensitivity: 'base' }); }
    catch { return new Intl.Collator('en', { sensitivity: 'base' }); }
  }

  function findAnimalInRoute(route) {
    if (!route) return null;
    if (route.view === 'list') return route.animal;
    if (route.view === 'detail') return route.disease?.animal;
    return null;
  }

  /* ---------- Static chrome, theme, language ---------- */
  function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = t(key);
      if (value) el.textContent = value;
    });
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
      langSelect.value = state.lang;
      langSelect.setAttribute('aria-label', t('language'));
    }
    const skip = document.querySelector('.skip-link');
    if (skip) skip.textContent = t('skipLink');
    updateThemeButton();
    updateMenuButton();
    const nav = document.getElementById('primary-nav');
    if (nav) nav.setAttribute('aria-label', state.lang === 'ar' ? 'التنقل الرئيسي' : state.lang === 'ku' ? 'گەشتکردنی سەرەکی' : 'Primary navigation');
    applyAuthUI();
  }

  function updateThemeButton() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const isDark = document.documentElement.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', t(isDark ? 'themeLight' : 'themeDark'));
    button.title = t(isDark ? 'themeLight' : 'themeDark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#07130f' : '#0d3b2e');
  }

  function updateMenuButton() {
    const button = document.getElementById('menu-toggle');
    if (!button) return;
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-label', t(open ? 'menuClose' : 'menuOpen'));
  }

  function setTheme(theme, persist = true) {
    const next = theme === 'dark' ? 'dark' : 'light';
    state.theme = next;
    document.documentElement.dataset.theme = next;
    if (persist) PREF.set('vetatlas.theme', next);
    updateThemeButton();
  }

  function setLanguage(lang, persist = true) {
    if (!['en', 'ku', 'ar'].includes(lang)) lang = 'en';
    state.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = langDir(lang);
    if (persist) PREF.set('vetatlas.lang', lang);
    applyStaticTranslations();
    if (state.data) renderCurrentRoute({ focus: false, scroll: false });
  }

  function setActiveNav(route) {
    const section = route?.view === 'list' ? route.animal
      : route?.view === 'detail' ? route.disease?.animal
      : route?.view === 'home' ? 'home'
      : route?.view === 'compare' ? 'compare'
      : route?.view === 'checker' ? 'checker'
      : route?.view === 'add' ? 'add'
      : route?.view === 'edit' ? 'add'
      : route?.view === 'account' ? 'account'
      : '';
    document.querySelectorAll('.primary-nav a[data-nav]').forEach(link => {
      const active = link.dataset.nav === section;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function setMenu(open) {
    const nav = document.getElementById('primary-nav');
    const button = document.getElementById('menu-toggle');
    if (!nav || !button) return;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    updateMenuButton();
  }

  /* ---------- Data loading ---------- */
  async function loadData() {
    try {
      const response = await fetch('data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      acceptData(mergeLocalData(json));
    } catch (error) {
      state.loadingError = true;
      renderLoadError(error);
    }
  }

  function acceptData(json) {
    if (!json || !Array.isArray(json.diseases) || !Array.isArray(json.symptomCatalog) || !Array.isArray(json.types)) {
      renderLoadError(new Error(t('invalidData')));
      return;
    }
    state.data = json;
    (state.data.animals || []).forEach(animal => {
      if (!state.listFilters[animal.id]) {
        state.listFilters[animal.id] = { q: '', type: 'all', system: 'all', severity: 'all', sort: 'az' };
      }
    });
    state.loadingError = false;
    try {
      const saved = JSON.parse(PREF.sessionGet('vetatlas.compare', '[]'));
      if (Array.isArray(saved)) state.compareKeys = saved.filter(k => byKey(k)).slice(0, 2);
    } catch { state.compareKeys = []; }
    applyStaticTranslations();
    renderCurrentRoute({ focus: true, scroll: true });
    renderCompareTray();
  }

  function renderLoadError(error) {
    const isFile = location.protocol === 'file:';
    const main = document.getElementById('main');
    if (!main) return;
    document.title = `${t('errorTitle')} — VetAtlas`;
    main.innerHTML = `
      <div class="container error-panel">
        <p class="eyebrow">VetAtlas</p>
        <h1>${esc(t('errorTitle'))}</h1>
        <p>${esc(t('errorBody'))}</p>
        ${isFile ? `<p>Open this site through a static web server, such as Vercel, Netlify, or GitHub Pages.</p><pre><code>python -m http.server 8000
# or, if Python is installed:
python -m http.server 8000</code></pre>` : `<p class="muted">${esc(error?.message || '')}</p>`}
        <label class="btn btn--secondary" for="data-file-input">${icon('book')} ${esc(t('chooseDataFile'))}</label>
        <input id="data-file-input" type="file" accept=".json,application/json" hidden>
        <p class="muted" style="margin-top:.8rem;font-size:.8rem">${esc(t('errorChoose'))}</p>
        <button class="btn btn--primary" type="button" id="retry-data">${icon('pulse')} ${esc(t('retry'))}</button>
        <div class="info-callout info-callout--warning" style="margin-top:1.2rem">${icon('alert')} <span lang="en" dir="ltr">For education only. Consult a licensed veterinarian.</span></div>
      </div>`;
    const retry = document.getElementById('retry-data');
    if (retry) retry.addEventListener('click', () => {
      retry.disabled = true;
      loadData();
    });
    const picker = document.getElementById('data-file-input');
    if (picker) picker.addEventListener('change', async () => {
      const file = picker.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        acceptData(JSON.parse(text));
      } catch {
        showToast(t('invalidData'));
      }
    });
  }

  /* ---------- Routing ---------- */
  function parseRoute() {
    let raw = location.hash.replace(/^#/, '');
    if (!raw) raw = '/';
    const [pathPart, queryPart = ''] = raw.split('?');
    const segments = pathPart.split('/').filter(Boolean).map(segment => {
      try { return decodeURIComponent(segment); } catch { return segment; }
    });
    const params = new URLSearchParams(queryPart);
    if (segments.length === 0) return { view: 'home', params };
    const animalIds = state.data?.animals.map(animal => animal.id) || [];
    if (animalIds.includes(segments[0])) return { view: 'list', animal: segments[0], params };
    if (segments[0] === 'disease' && segments.length >= 3) {
      const animal = segments[1];
      const disease = state.data?.diseases.find(d => d.animal === animal && d.id === segments[2]);
      return { view: 'detail', animal, disease: disease || null, params };
    }
    if (segments[0] === 'compare') return { view: 'compare', params };
    if (segments[0] === 'checker') return { view: 'checker', params };
    if (segments[0] === 'add') return { view: 'add', params };
    if (segments[0] === 'account') return { view: 'account', params };
    if (segments[0] === 'edit' && segments.length >= 3) {
      const animal = segments[1];
      const disease = state.data?.diseases.find(d => d.animal === animal && d.id === segments[2]);
      return { view: 'edit', animal, id: segments[2], disease: disease || null, params };
    }
    return { view: 'notfound', params };
  }

  function navigateTo(hash) {
    if (location.hash === hash) renderCurrentRoute({ focus: true, scroll: true });
    else location.hash = hash;
  }

  function renderCurrentRoute({ focus = true, scroll = true } = {}) {
    if (!state.data) return;
    const route = parseRoute();
    state.route = route;
    setActiveNav(route);
    setMenu(false);
    closeHomeResults();
    const main = document.getElementById('main');
    if (!main) return;

    switch (route.view) {
      case 'home': renderHome(main); break;
      case 'list': renderListPage(main, route.animal); break;
      case 'detail':
        if (route.disease) renderDetailPage(main, route.disease);
        else renderNotFound(main);
        break;
      case 'compare': renderComparePage(main, route.params); break;
      case 'checker': renderCheckerPage(main, route.params); break;
      case 'add': renderAddPage(main); break;
      case 'edit':
        if (route.disease) renderEditPage(main, route.disease);
        else renderNotFound(main);
        break;
      case 'account': renderAccountPage(main); break;
      default: renderNotFound(main);
    }

    renderCompareTray();
    if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
    if (focus) {
      requestAnimationFrame(() => {
        const heading = main.querySelector('h1');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
      });
    }
  }

  function renderNotFound(main) {
    document.title = `${t('notFoundTitle')} — VetAtlas`;
    main.innerHTML = `
      <div class="container">
        <section class="not-found inner-page">
          ${icon('alert')}
          <h1>${esc(t('notFoundTitle'))}</h1>
          <p>${esc(t('notFoundBody'))}</p>
          <a class="btn btn--primary" href="#/">${icon('arrow-left')} ${esc(t('notFoundBack'))}</a>
        </section>
      </div>`;
  }

  function closeHomeResults() {
    const results = document.getElementById('home-search-results');
    if (results) results.hidden = true;
  }

/* =========================================================
   VetAtlas — search, comparison selection and floating tray
   ========================================================= */

function searchBlob(d) {
  const parts = [
    d.id,
    ...Object.values(d.name || {}),
    ...Object.values(d.summary || {}),
    ...(d.aliases || []),
    d.causativeAgent || '',
    d.affected || '',
    ...(d.symptoms || []),
    ...(d.symptomTags || []).flatMap(tag => Object.values(symptomMeta(tag))),
    ...Object.values(typeMeta(d.type)),
    ...(d.systems || []).flatMap(system => Object.values(systemMeta(system))),
    ...Object.values(animalMeta(d.animal))
  ];
  return normalized(parts.join(' '));
}

function searchDiseases(query, animal = 'all') {
  const terms = normalized(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  return state.data.diseases
    .filter(d => animal === 'all' || d.animal === animal)
    .filter(d => {
      const blob = searchBlob(d);
      return terms.every(term => blob.includes(term));
    });
}

function persistCompare() {
  PREF.sessionSet('vetatlas.compare', JSON.stringify(state.compareKeys));
}

function toggleCompare(key) {
  const existing = state.compareKeys.indexOf(key);
  if (existing !== -1) {
    state.compareKeys.splice(existing, 1);
    showToast(t('toastRemoved'));
  } else {
    if (state.compareKeys.length >= 2) {
      showToast(t('toastMax'));
      return;
    }
    state.compareKeys.push(key);
    showToast(t('toastAdded'));
  }
  persistCompare();
  renderCompareTray();
  refreshCompareButtons();
  syncDetailCompareButton();
}

function removeFromCompare(key) {
  state.compareKeys = state.compareKeys.filter(k => k !== key);
  persistCompare();
  renderCompareTray();
  refreshCompareButtons();
  syncDetailCompareButton();
  if (state.route?.view === 'compare') {
    if (state.compareLeft === key) state.compareLeft = '';
    if (state.compareRight === key) state.compareRight = '';
    updateCompareQuery();
    renderCurrentRoute({ focus: false, scroll: false });
  }
}

function refreshCompareButtons() {
  document.querySelectorAll('[data-compare-key]').forEach(button => {
    const key = button.getAttribute('data-compare-key');
    const selected = state.compareKeys.includes(key);
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    const label = selected ? t('comparedShort') : t('compareShort');
    button.innerHTML = `${icon(selected ? 'check' : 'compare')} <span>${esc(label)}</span>`;
  });
}

function renderCompareTray() {
  const tray = document.getElementById('compare-tray');
  if (!tray) return;
  const show = state.compareKeys.length > 0 && state.route?.view !== 'compare';
  tray.hidden = !show;
  document.body.classList.toggle('has-tray', show);
  if (!show) return;
  const count = document.getElementById('compare-count');
  if (count) count.textContent = `${state.compareKeys.length}/2`;
  const items = document.getElementById('compare-tray-items');
  if (!items) return;
  items.innerHTML = state.compareKeys.map(key => {
    const d = byKey(key);
    if (!d) return '';
    const label = `${localizedName(d)} · ${tr(animalMeta(d.animal))}`;
    return `<span class="tray-item"><span>${esc(label)}</span><button type="button" data-tray-remove="${esc(key)}" aria-label="${esc(t('clear'))}: ${esc(label)}">${icon('x')}</button></span>`;
  }).join('');
  const go = document.getElementById('compare-go');
  if (go) go.setAttribute('aria-disabled', String(state.compareKeys.length < 2));
}


/* =========================================================
   VetAtlas — home page
   ========================================================= */

function renderHome(main) {
  document.title = `VetAtlas — ${t('brandTagline')}`;
  const total = state.data.diseases.length;
  const animalCards = state.data.animals.map((animal, index) => {
    const count = state.data.diseases.filter(disease => disease.animal === animal.id).length;
    const evenTheme = index % 2 === 0;
    const isDefaultCattle = animal.id === 'cattle';
    const isDefaultSheep = animal.id === 'sheep';
    const iconName = 'stethoscope';
    const description = isDefaultCattle ? t('cattleDesc') : isDefaultSheep ? t('sheepDesc') : `${tr(animal)} ${t('conditionsCount', { count })}`;
    const cardClass = evenTheme ? 'animal-card--cattle' : 'animal-card--sheep';
    return `<a class="animal-card ${cardClass}" href="#/${esc(animal.id)}">
      <span class="animal-card__count">${formatNumber(count)}</span>
      <div class="animal-card__copy">
        <span class="animal-card__kicker">${icon(iconName)} ${esc(tr(animal))}</span>
        <h3>${esc(tr(animal))}</h3>
        <p>${esc(description)}</p>
      </div>
      <span class="animal-card__cta">${esc(t('viewDetails'))}<span>${icon('arrow-right')}</span></span>
    </a>`;
  }).join('');

  main.innerHTML = `
    <section class="home-hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">${esc(t('heroEyebrow'))}</p>
          <h1>${esc(t('heroTitleTop'))}<br><em>${esc(t('heroTitleBottom'))}</em></h1>
          <p class="lede">${esc(t('heroLede'))}</p>
          <div class="hero-search">
            <form role="search" id="home-search-form" class="search-control" autocomplete="off">
              <label class="sr-only" for="home-search">${esc(t('heroSearchLabel'))}</label>
              ${icon('search')}
              <input class="input" id="home-search" type="search" placeholder="${esc(t('heroSearchPlaceholder'))}"
                aria-controls="home-search-results" autocomplete="off" spellcheck="false">
              <button class="clear-search" id="home-search-clear" type="button" hidden aria-label="${esc(t('clear'))}">${icon('x')}</button>
              <span class="hero-search__kbd" aria-hidden="true">/</span>
            </form>
            <div class="home-search-results" id="home-search-results" aria-live="polite" hidden></div>
          </div>
          <div class="hero-quick">
            <span>${esc(t('heroQuickLabel'))}</span>
            <button class="quick-tag" type="button" data-quick-search="${esc(t('heroQuickMastitis'))}">${esc(t('heroQuickMastitis'))}</button>
            <button class="quick-tag" type="button" data-quick-search="${esc(t('heroQuickFever'))}">${esc(t('heroQuickFever'))}</button>
            <button class="quick-tag" type="button" data-quick-search="${esc(t('heroQuickBloat'))}">${esc(t('heroQuickBloat'))}</button>
          </div>
          <div class="hero-stats" aria-label="Reference statistics">
            <div class="hero-stat"><strong>${formatNumber(total)}</strong><span>${esc(t('statDiseases'))}</span></div>
            <div class="hero-stat"><strong>${formatNumber(state.data.animals.length)}</strong><span>${esc(t('statSpecies'))}</span></div>
            <div class="hero-stat"><strong>3</strong><span>${esc(t('statLanguages'))}</span></div>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="hero-art__frame">
            <div class="hero-art__label"><span>VetAtlas field guide</span><strong>Cattle &amp; sheep<br>disease reference</strong></div>
            <svg class="hero-art__cow"><use href="#i-cow"></use></svg>
            <svg class="hero-art__sheep"><use href="#i-sheep"></use></svg>
            <div class="hero-art__grass"></div>
          </div>
          <div class="hero-float hero-float--one">${icon('stethoscope')}<span>${esc(t('navChecker'))}</span></div>
          <div class="hero-float hero-float--two">${icon('book')}<span>${formatNumber(total)} ${esc(t('statDiseases'))}</span></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <div>
            <p class="eyebrow">${esc(t('browseEyebrow'))}</p>
            <h2>${esc(t('browseTitle'))}</h2>
          </div>
          <p>${esc(t('browseLead'))}</p>
        </div>
        <div class="animal-grid">
          ${animalCards}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <div>
            <p class="eyebrow">${esc(t('featuresEyebrow'))}</p>
            <h2>${esc(t('featuresTitle'))}</h2>
          </div>
          <p>${esc(t('featuresLead'))}</p>
        </div>
        <div class="feature-strip">
          <a class="feature-strip__item" href="#/compare">
            <span class="feature-strip__icon">${icon('compare')}</span>
            <span><h3>${esc(t('compareFeatureTitle'))}</h3><p>${esc(t('compareFeatureDesc'))}</p></span>
            <span class="feature-strip__arrow">${icon('arrow-right')}</span>
          </a>
          <a class="feature-strip__item" href="#/checker">
            <span class="feature-strip__icon">${icon('stethoscope')}</span>
            <span><h3>${esc(t('checkerFeatureTitle'))}</h3><p>${esc(t('checkerFeatureDesc'))}</p></span>
            <span class="feature-strip__arrow">${icon('arrow-right')}</span>
          </a>
          <div class="feature-strip__item">
            <span class="feature-strip__icon">${icon('book')}</span>
            <span><h3>${esc(t('guideFeatureTitle'))}</h3><p>${esc(t('guideFeatureDesc'))}</p></span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="home-banner">
          <div>
            <p class="eyebrow" style="color:var(--lime)">${esc(t('ctaEyebrow'))}</p>
            <h2>${esc(t('ctaTitle'))}</h2>
            <p>${esc(t('ctaBody'))}</p>
          </div>
          <a class="btn btn--light" href="#/checker">${icon('stethoscope')} ${esc(t('ctaButton'))}</a>
        </div>
      </div>
    </section>`;

  setupHomeSearch();
}

function setupHomeSearch() {
  const form = document.getElementById('home-search-form');
  const input = document.getElementById('home-search');
  const clear = document.getElementById('home-search-clear');
  const results = document.getElementById('home-search-results');
  if (!form || !input || !results) return;

  const run = () => {
    const query = input.value.trim();
    state.homeQuery = query;
    if (clear) clear.hidden = query.length === 0;
    if (query.length < 2) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    const matches = searchDiseases(query).sort((a, b) => sortCollator().compare(localizedName(a), localizedName(b)));
    results.hidden = false;
    if (!matches.length) {
      results.innerHTML = `<div class="home-search-results__empty">${esc(t('searchNoResults'))}</div>`;
      return;
    }
    const shown = matches.slice(0, 7);
    results.innerHTML = `
      <div class="home-search-results__meta">
        <span>${esc(t('searchResultsLabel'))}</span>
        <span>${esc(t('searchMatches', { count: formatNumber(matches.length) }))}</span>
      </div>
      ${shown.map(d => {
        const meta = `${tr(animalMeta(d.animal))} · ${tr(typeMeta(d.type))}`;
        return `<a class="result-link" href="#/disease/${esc(d.animal)}/${esc(d.id)}">
          <span class="result-link__icon">${icon(d.animal === 'cattle' ? 'cow' : 'sheep')}</span>
          <span class="result-link__main"><strong>${esc(localizedName(d))}</strong><small>${esc(meta)}</small></span>
          ${icon('arrow-right')}
        </a>`;
      }).join('')}`;
  };

  input.addEventListener('input', run);
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      const first = results.querySelector('.result-link');
      if (first) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'Escape') {
      results.hidden = true;
    }
  });
  results.addEventListener('keydown', event => {
    const links = [...results.querySelectorAll('.result-link')];
    const index = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && index > -1) {
      event.preventDefault();
      (links[index + 1] || links[0]).focus();
    }
    if (event.key === 'ArrowUp' && index > -1) {
      event.preventDefault();
      if (index === 0) input.focus();
      else links[index - 1].focus();
    }
    if (event.key === 'Escape') {
      results.hidden = true;
      input.focus();
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) { input.focus(); return; }
    const first = results.querySelector('.result-link');
    if (first) first.focus();
    else showToast(t('searchNoResults'));
  });
  clear?.addEventListener('click', () => {
    input.value = '';
    clear.hidden = true;
    results.hidden = true;
    results.innerHTML = '';
    input.focus();
  });
  document.querySelectorAll('[data-quick-search]').forEach(button => {
    button.addEventListener('click', () => {
      input.value = button.getAttribute('data-quick-search') || '';
      run();
      input.focus();
    });
  });
  run();
}


/* =========================================================
   VetAtlas — cattle / sheep list pages
   ========================================================= */

function renderListPage(main, animal) {
  const animalData = animalMeta(animal);
  const isCattle = animal === 'cattle';
  const total = state.data.diseases.filter(d => d.animal === animal).length;
  const filters = state.listFilters[animal];
  document.title = `${isCattle ? t('cattleListTitle') : t('sheepListTitle')} — VetAtlas`;

  const typeOptions = state.data.types
    .filter(type => state.data.diseases.some(d => d.animal === animal && d.type === type.id))
    .map(type => `<option value="${esc(type.id)}"${filters.type === type.id ? ' selected' : ''}>${esc(tr(type))}</option>`).join('');
  const systemOptions = state.data.systems
    .filter(system => state.data.diseases.some(d => d.animal === animal && d.systems?.includes(system.id)))
    .map(system => `<option value="${esc(system.id)}"${filters.system === system.id ? ' selected' : ''}>${esc(tr(system))}</option>`).join('');
  const severityOptions = state.data.severities
    .map(severity => `<option value="${esc(severity.id)}"${filters.severity === severity.id ? ' selected' : ''}>${esc(tr(severity))}</option>`).join('');

  main.innerHTML = `
    <div class="container inner-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/">${esc(t('navHome'))}</a>
        ${icon('chevron-down')}
        <span aria-current="page">${esc(tr(animalData))}</span>
      </nav>
      <header class="page-head">
        <p class="eyebrow">${icon(isCattle ? 'cow' : 'sheep')} ${esc(tr(animalData))}</p>
        <h1>${esc(isCattle ? t('cattleListTitle') : t('sheepListTitle'))}</h1>
        <p>${esc(isCattle ? t('cattleListIntro') : t('sheepListIntro'))}</p>
        <div class="page-head__meta">
          <span class="pill">${icon(isCattle ? 'cow' : 'sheep')} ${esc(t('conditionsCount', { count: formatNumber(total) }))}</span>
        </div>
      </header>

      <section class="filter-panel" aria-label="${esc(t('filterResults'))}">
        <div class="filter-grid">
          <div class="field filter-grid__search">
            <label for="list-search">${esc(t('searchDiseases'))}</label>
            <div class="search-control">
              ${icon('search')}
              <input class="input" id="list-search" type="search" value="${esc(filters.q)}" placeholder="${esc(t('searchPlaceholder'))}" autocomplete="off">
              <button class="clear-search" id="list-search-clear" type="button" ${filters.q ? '' : 'hidden'} aria-label="${esc(t('clear'))}">${icon('x')}</button>
            </div>
          </div>
          <div class="field">
            <label for="filter-type">${esc(t('typeFilter'))}</label>
            <select class="select" id="filter-type">
              <option value="all">${esc(t('allTypes'))}</option>
              ${typeOptions}
            </select>
          </div>
          <div class="field">
            <label for="filter-system">${esc(t('systemFilter'))}</label>
            <select class="select" id="filter-system">
              <option value="all">${esc(t('allSystems'))}</option>
              ${systemOptions}
            </select>
          </div>
          <div class="field">
            <label for="filter-severity">${esc(t('severityFilter'))}</label>
            <select class="select" id="filter-severity">
              <option value="all">${esc(t('allSeverities'))}</option>
              ${severityOptions}
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <p class="filter-actions__summary" id="filter-summary"></p>
          <div class="filter-actions__right">
            <button class="link-button" id="clear-filters" type="button">${icon('x')} ${esc(t('clearAllFilters'))}</button>
          </div>
        </div>
      </section>
      <p class="sr-only" id="list-live" role="status" aria-live="polite"></p>
      <section id="disease-results" aria-labelledby="list-results-heading"></section>
    </div>`;

  setupListPage(animal);
}

function setupListPage(animal) {
  const filters = state.listFilters[animal];
  const search = document.getElementById('list-search');
  const clearSearch = document.getElementById('list-search-clear');
  const type = document.getElementById('filter-type');
  const system = document.getElementById('filter-system');
  const severity = document.getElementById('filter-severity');
  const clearAll = document.getElementById('clear-filters');

  const update = ({ sync = false } = {}) => {
    if (sync) {
      if (search) search.value = filters.q;
      if (type) type.value = filters.type;
      if (system) system.value = filters.system;
      if (severity) severity.value = filters.severity;
    }
    if (clearSearch) clearSearch.hidden = !filters.q;
    if (clearAll) clearAll.disabled = !hasActiveFilters(filters);
    refreshListResults(animal);
  };

  search?.addEventListener('input', () => {
    filters.q = search.value;
    if (clearSearch) clearSearch.hidden = !filters.q;
    if (clearAll) clearAll.disabled = !hasActiveFilters(filters);
    refreshListResults(animal);
  });
  type?.addEventListener('change', () => { filters.type = type.value; update(); });
  system?.addEventListener('change', () => { filters.system = system.value; update(); });
  severity?.addEventListener('change', () => { filters.severity = severity.value; update(); });
  clearSearch?.addEventListener('click', () => {
    filters.q = '';
    update({ sync: true });
    search?.focus();
  });
  clearAll?.addEventListener('click', () => {
    resetListFilters(animal);
    update({ sync: true });
    search?.focus();
  });

  const results = document.getElementById('disease-results');
  results?.addEventListener('click', event => {
    const compareButton = event.target.closest('[data-compare-key]');
    if (compareButton) {
      event.preventDefault();
      toggleCompare(compareButton.getAttribute('data-compare-key'));
      return;
    }
    const remove = event.target.closest('[data-remove-filter]');
    if (remove) {
      const key = remove.getAttribute('data-remove-filter');
      filters[key] = key === 'q' ? '' : 'all';
      update({ sync: true });
      return;
    }
    const reset = event.target.closest('[data-reset-list]');
    if (reset) {
      resetListFilters(animal);
      update({ sync: true });
      search?.focus();
    }
  });
  results?.addEventListener('change', event => {
    if (event.target.id === 'list-sort') {
      filters.sort = event.target.value;
      refreshListResults(animal);
    }
  });

  update();
}

function hasActiveFilters(filters) {
  return Boolean(filters.q || filters.type !== 'all' || filters.system !== 'all' || filters.severity !== 'all');
}

function resetListFilters(animal) {
  state.listFilters[animal] = {
    q: '', type: 'all', system: 'all', severity: 'all',
    sort: state.listFilters[animal].sort || 'az'
  };
}

function refreshListResults(animal) {
  const container = document.getElementById('disease-results');
  if (!container) return;
  const filters = state.listFilters[animal];
  const all = state.data.diseases.filter(d => d.animal === animal);
  const searchMatchIds = filters.q
    ? new Set(searchDiseases(filters.q, animal).map(d => d.id))
    : null;
  const filtered = all.filter(d =>
    (!searchMatchIds || searchMatchIds.has(d.id)) &&
    (filters.type === 'all' || d.type === filters.type) &&
    (filters.system === 'all' || d.systems?.includes(filters.system)) &&
    (filters.severity === 'all' || d.severity === filters.severity)
  ).sort((a, b) => {
    const result = sortCollator().compare(localizedName(a), localizedName(b));
    return filters.sort === 'za' ? -result : result;
  });

  const summary = document.getElementById('filter-summary');
  if (summary) summary.textContent = t('showingCount', { visible: formatNumber(filtered.length), total: formatNumber(all.length) });
  const live = document.getElementById('list-live');
  if (live) live.textContent = t('showingCount', { visible: formatNumber(filtered.length), total: formatNumber(all.length) });

  const active = [];
  if (filters.q) active.push({ key: 'q', label: `${t('searchShort')}: ${filters.q}` });
  if (filters.type !== 'all') active.push({ key: 'type', label: `${t('typeShort')}: ${tr(typeMeta(filters.type))}` });
  if (filters.system !== 'all') active.push({ key: 'system', label: `${t('systemShort')}: ${tr(systemMeta(filters.system))}` });
  if (filters.severity !== 'all') active.push({ key: 'severity', label: `${t('severityShort')}: ${tr(severityMeta(filters.severity))}` });

  container.innerHTML = `
    <div class="results-bar">
      <h2 id="list-results-heading">${esc(t('showingCount', { visible: formatNumber(filtered.length), total: formatNumber(all.length) }))}</h2>
      <label class="results-bar__sort">${icon('sort')} <span>${esc(t('sortBy'))}</span>
        <select id="list-sort" aria-label="${esc(t('sortBy'))}">
          <option value="az"${filters.sort === 'az' ? ' selected' : ''}>${esc(t('sortAz'))}</option>
          <option value="za"${filters.sort === 'za' ? ' selected' : ''}>${esc(t('sortZa'))}</option>
        </select>
      </label>
    </div>
    ${active.length ? `<div class="active-filters" aria-label="${esc(t('activeFilters'))}">${active.map(item => `
      <span class="filter-chip">${esc(item.label)} <button type="button" data-remove-filter="${esc(item.key)}" aria-label="${esc(t('removeFilter', { name: item.label }))}">${icon('x')}</button></span>
    `).join('')}</div>` : ''}
    ${filtered.length ? `<ul class="disease-grid">${filtered.map(d => renderDiseaseCard(d)).join('')}</ul>` : `
      <div class="empty-state">
        <span class="empty-state__icon">${icon('search')}</span>
        <h3>${esc(t('noDiseasesTitle'))}</h3>
        <p>${esc(t('noDiseasesBody'))}</p>
        <button class="btn btn--secondary btn--small" type="button" data-reset-list>${esc(t('resetFilters'))}</button>
      </div>`}`;

  refreshCompareButtons();
}

function renderDiseaseCard(d) {
  const other = altName(d);
  const href = `#/disease/${esc(d.animal)}/${esc(d.id)}`;
  const primarySystem = d.systems?.[0] || 'systemic';
  const systems = (d.systems || []).slice(0, 3).map(systemChip).join('');
  const image = imageSrc(d);
  return `<li class="disease-card card-focus">
    ${image ? `<div class="disease-card__media"><img src="${esc(image)}" alt="" loading="lazy" decoding="async"></div>` : ''}
    <div class="disease-card__top">
      <span class="disease-card__icon">${icon(SYSTEM_ICONS[primarySystem] || 'pulse')}</span>
      <div class="disease-card__badges">
        ${typePill(d)}
        ${meatBadge(d)}
        ${d.zoonotic ? `<span class="pill pill--zoonotic">${icon('alert')} ${esc(t('zoonoticShort'))}</span>` : ''}
        ${d.notifiable ? `<span class="pill pill--reportable">${icon('alert')} ${esc(t('reportableShort'))}</span>` : ''}
      </div>
    </div>
    <h3><a href="${href}">${esc(localizedName(d))}</a></h3>
    ${other ? `<p class="disease-card__alt-name" lang="${state.lang === 'en' ? 'ku' : 'en'}" dir="${state.lang === 'en' ? 'rtl' : 'ltr'}">${esc(other)}</p>` : '<span class="disease-card__alt-name"></span>'}
    <p class="disease-card__summary">${esc(localizedSummary(d))}</p>
    <div class="disease-card__systems">${systems}</div>
    <div class="disease-card__footer">
      <span class="severity severity--${esc(d.severity)}">${esc(tr(severityMeta(d.severity)))}</span>
      <div class="disease-card__footer-actions">
        <button class="disease-card__compare" type="button" data-compare-key="${esc(compareKey(d))}" aria-pressed="${isComparing(d)}">${icon(isComparing(d) ? 'check' : 'compare')} <span>${esc(isComparing(d) ? t('comparedShort') : t('compareShort'))}</span></button>
        <a class="disease-card__view" href="${href}">${esc(t('viewDetails'))} ${icon('arrow-right')}</a>
      </div>
    </div>
  </li>`;
}


/* =========================================================
   VetAtlas — disease detail page
   ========================================================= */

function renderDetailPage(main, d) {
  const animal = animalMeta(d.animal);
  const isCattle = d.animal === 'cattle';
  const en = state.lang === 'en' ? '' : ' lang="en" dir="ltr"';
  const otherNames = ['en', 'ku', 'ar']
    .filter(lang => lang !== state.lang && d.name?.[lang])
    .map(lang => `<span lang="${lang}" dir="${langDir(lang)}"><bdi>${esc(d.name[lang])}</bdi></span>`)
    .join('');
  const systems = (d.systems || []).map(systemChip).join('');
  const aliases = (d.aliases || []).join(', ');
  const key = compareKey(d);
  const image = imageSrc(d);
  document.title = `${localizedName(d)} — VetAtlas`;

  main.innerHTML = `
    <div class="container inner-page">
      <header class="detail-hero">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="#/">${esc(t('navHome'))}</a>
          ${icon('chevron-down')}
          <a href="#/${esc(d.animal)}">${esc(tr(animal))}</a>
          ${icon('chevron-down')}
          <span aria-current="page">${esc(localizedName(d))}</span>
        </nav>
        <div class="detail-hero__badges">
          ${typePill(d, true)}
          ${severityBadge(d)}
          ${d.zoonotic
            ? `<span class="pill pill--large pill--zoonotic">${icon('alert')} ${esc(t('zoonoticRisk'))}: ${esc(t('yes'))}</span>`
            : `<span class="pill pill--large pill--safe">${icon('shield')} ${esc(t('zoonoticRisk'))}: ${esc(t('no'))}</span>`}
          ${meatBadge(d, true)}
          ${d.notifiable ? `<span class="pill pill--large pill--reportable">${icon('alert')} ${esc(t('reportable'))}</span>` : ''}
        </div>
        <h1>${esc(localizedName(d))}</h1>
        ${otherNames ? `<div class="detail-hero__alt">${otherNames}</div>` : ''}
        <p class="detail-hero__summary">${esc(localizedSummary(d))}</p>
        <div class="detail-hero__foot">
          <div class="detail-hero__systems">${systems}</div>
          <div class="detail-hero__actions">
            <button class="btn btn--secondary btn--small" type="button" data-detail-compare="${esc(key)}" aria-pressed="${isComparing(d)}">
              ${icon(isComparing(d) ? 'check' : 'compare')} <span>${esc(isComparing(d) ? t('inComparison') : t('addToCompare'))}</span>
            </button>
            ${AUTH.user ? `<a class="btn btn--ghost btn--small" href="#/edit/${esc(d.animal)}/${esc(d.id)}">${icon('edit')} ${esc(t('editDisease'))}</a>` : ''}

          </div>
        </div>
      </header>

      <div class="detail-layout">
        <div class="detail-main">
          ${image ? `
          <figure class="detail-figure">
            <img src="${esc(image)}" alt="${esc(d.imageAlt || localizedName(d))}" loading="lazy" decoding="async">
          </figure>` : ''}

          <section class="detail-card" aria-labelledby="symptoms-title">
            <div class="detail-card__head">
              <span class="detail-card__icon">${icon('stethoscope')}</span>
              <h2 id="symptoms-title">${esc(t('symptomsHeading'))}</h2>
            </div>
            <ul class="symptom-list"${en}>
              ${(d.symptoms || []).map(symptom => `<li>${esc(symptom)}</li>`).join('')}
            </ul>
          </section>

          ${d.zoonotic ? `
          <div class="info-callout info-callout--danger">
            ${icon('alert')}
            <div><strong>${esc(t('zoonoticRisk'))}: ${esc(t('yes'))}.</strong> <span${en}>${esc(d.zoonoticNote || '')}</span></div>
          </div>` : ''}

          <section class="detail-card" aria-labelledby="diagnosis-title">
            <div class="detail-card__head">
              <span class="detail-card__icon">${icon('search')}</span>
              <h2 id="diagnosis-title">${esc(t('diagnosisHeading'))}</h2>
            </div>
            <p class="detail-card__lead"${en}>${esc(d.diagnosis)}</p>
          </section>

          ${d.postMortem ? `
          <section class="detail-card" aria-labelledby="postmortem-title">
            <div class="detail-card__head">
              <span class="detail-card__icon">${icon('microscope')}</span>
              <h2 id="postmortem-title">${esc(t('postMortemHeading'))}</h2>
            </div>
            <p class="detail-card__lead"${en}>${esc(d.postMortem)}</p>
            <p class="detail-card__note muted">${esc(t('postMortemNote'))}</p>
          </section>` : ''}

          <section class="detail-card" aria-labelledby="treatment-title">
            <div class="detail-card__head">
              <span class="detail-card__icon">${icon('pill')}</span>
              <h2 id="treatment-title">${esc(t('treatmentHeading'))}</h2>
            </div>
            <p class="detail-card__lead"${en}>${esc(d.treatment)}</p>
          </section>

          <section class="detail-card" aria-labelledby="prevention-title">
            <div class="detail-card__head">
              <span class="detail-card__icon">${icon('syringe')}</span>
              <h2 id="prevention-title">${esc(t('preventionHeading'))}</h2>
            </div>
            <p class="detail-card__lead"${en}>${esc(d.prevention)}</p>
          </section>

          ${d.notifiable ? `
          <div class="info-callout info-callout--warning">
            ${icon('alert')}
            <div><strong>${esc(t('reportable'))}.</strong> ${esc(t('reportAlert'))}</div>
          </div>` : ''}

          ${state.lang !== 'en' ? `
          <div class="info-callout info-callout--info language-content-note">
            ${icon('info')} <span>${esc(t('languageContentNote'))}</span>
          </div>` : ''}

          <p class="print-disclaimer" lang="en" dir="ltr">For education only. Consult a licensed veterinarian. — VetAtlas</p>
        </div>

        <aside class="detail-aside" aria-label="${esc(t('quickFacts'))}">
          <section class="quick-facts">
            <div class="quick-facts__head">${icon('book')} ${esc(t('quickFacts'))}</div>
            <dl>
              <div class="quick-fact">
                <dt>${esc(t('animalLabel'))}</dt>
                <dd><span class="pill">${icon(isCattle ? 'cow' : 'sheep')} ${esc(tr(animal))}</span></dd>
              </div>
              <div class="quick-fact">
                <dt>${esc(t('causativeAgent'))}</dt>
                <dd${en}>${esc(d.causativeAgent)}</dd>
              </div>
              <div class="quick-fact">
                <dt>${esc(t('affectedAnimals'))}</dt>
                <dd${en}>${esc(d.affected)}</dd>
              </div>
              <div class="quick-fact">
                <dt>${esc(t('bodySystems'))}</dt>
                <dd>${systems}</dd>
              </div>
              <div class="quick-fact">
                <dt>${esc(t('diseaseType'))}</dt>
                <dd>${esc(tr(typeMeta(d.type)))}</dd>
              </div>
              <div class="quick-fact">
                <dt>${esc(t('severityLabel'))}</dt>
                <dd>${severityBadge(d)}</dd>
              </div>
              <div class="quick-fact">
                <dt>${esc(t('zoonoticRisk'))}</dt>
                <dd>
                  ${d.zoonotic
                    ? `<span class="pill pill--zoonotic">${icon('alert')} ${esc(t('yes'))}</span>`
                    : `<span class="pill pill--safe">${icon('shield')} ${esc(t('no'))}</span>`}
                  ${d.zoonoticNote ? `<p class="muted"${en} style="margin:.45rem 0 0;font-size:.76rem">${esc(d.zoonoticNote)}</p>` : ''}
                </dd>
              </div>
              ${typeof d.meatSafe === 'boolean' ? `
              <div class="quick-fact">
                <dt>${esc(t('meatSafety'))}</dt>
                <dd>
                  ${meatBadge(d)}
                  ${d.meatNote ? `<p class="muted"${en} style="margin:.45rem 0 0;font-size:.76rem">${esc(d.meatNote)}</p>` : ''}
                </dd>
              </div>` : ''}
              <div class="quick-fact">
                <dt>${esc(t('reportingStatus'))}</dt>
                <dd>
                  <span class="pill ${d.notifiable ? 'pill--reportable' : 'pill--safe'}">${icon(d.notifiable ? 'alert' : 'shield')} ${esc(d.notifiable ? t('reportable') : t('notUsuallyReportable'))}</span>
                  ${d.notifiableNote ? `<p class="muted"${en} style="margin:.45rem 0 0;font-size:.76rem">${esc(d.notifiableNote)}</p>` : ''}
                </dd>
              </div>
              ${aliases ? `<div class="quick-fact"><dt>${esc(t('aliasesLabel'))}</dt><dd${en}>${esc(aliases)}</dd></div>` : ''}
            </dl>
          </section>

          <section class="safety-note">
            <h2>${icon('shield')} ${esc(t('fieldSafetyTitle'))}</h2>
            <p>${esc(t('fieldSafetyBody'))}</p>
            <p class="disclaimer-english" lang="en" dir="ltr" style="font-size:.82rem;font-weight:750;color:var(--ink)">For education only. Consult a licensed veterinarian.</p>
            <p class="muted" style="font-size:.7rem">${esc(t('updatedNote'))}</p>
          </section>
        </aside>
      </div>
    </div>`;

  const compareButton = main.querySelector('[data-detail-compare]');
  compareButton?.addEventListener('click', () => {
    toggleCompare(compareButton.getAttribute('data-detail-compare'));
  });
  syncDetailCompareButton();
}

function syncDetailCompareButton() {
  const button = document.querySelector('[data-detail-compare]');
  if (!button) return;
  const key = button.getAttribute('data-detail-compare');
  const selected = state.compareKeys.includes(key);
  button.classList.toggle('is-selected', selected);
  button.setAttribute('aria-pressed', String(selected));
  button.innerHTML = `${icon(selected ? 'check' : 'compare')} <span>${esc(selected ? t('inComparison') : t('addToCompare'))}</span>`;
}


/* =========================================================
   VetAtlas — side-by-side disease comparison
   ========================================================= */

function renderComparePage(main, params) {
  const queryLeft = params?.get('left');
  const queryRight = params?.get('right');
  if (queryLeft && byKey(queryLeft)) state.compareLeft = queryLeft;
  if (queryRight && byKey(queryRight)) state.compareRight = queryRight;
  if (!state.compareLeft && state.compareKeys[0]) state.compareLeft = state.compareKeys[0];
  if (!state.compareRight && state.compareKeys[1]) state.compareRight = state.compareKeys[1];

  const initialKeys = [state.compareLeft, state.compareRight].filter(Boolean);
  if (initialKeys.length) {
    state.compareKeys = [...new Set(initialKeys)].slice(0, 2);
    persistCompare();
  }

  document.title = `${t('compareTitle')} — VetAtlas`;
  const optionGroups = state.data.animals.map(animal => `
    <optgroup label="${esc(tr(animal))}">
      ${state.data.diseases
        .filter(d => d.animal === animal.id)
        .sort((a, b) => sortCollator().compare(localizedName(a), localizedName(b)))
        .map(d => `<option value="${esc(compareKey(d))}"${state.compareLeft === compareKey(d) ? ' selected' : ''}>${esc(localizedName(d))} — ${esc(tr(typeMeta(d.type)))}</option>`)
        .join('')}
    </optgroup>`).join('');
  const optionGroupsRight = state.data.animals.map(animal => `
    <optgroup label="${esc(tr(animal))}">
      ${state.data.diseases
        .filter(d => d.animal === animal.id)
        .sort((a, b) => sortCollator().compare(localizedName(a), localizedName(b)))
        .map(d => `<option value="${esc(compareKey(d))}"${state.compareRight === compareKey(d) ? ' selected' : ''}>${esc(localizedName(d))} — ${esc(tr(typeMeta(d.type)))}</option>`)
        .join('')}
    </optgroup>`).join('');

  main.innerHTML = `
    <div class="container inner-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/">${esc(t('navHome'))}</a>
        ${icon('chevron-down')}
        <span aria-current="page">${esc(t('navCompare'))}</span>
      </nav>
      <header class="page-head">
        <p class="eyebrow">${icon('compare')} ${esc(t('navCompare'))}</p>
        <h1>${esc(t('compareTitle'))}</h1>
        <p>${esc(t('compareIntro'))}</p>
      </header>

      <section class="compare-controls" aria-label="${esc(t('compareTitle'))}">
        <div class="field">
          <label for="compare-left">${esc(t('firstDisease'))}</label>
          <select class="select" id="compare-left">
            <option value="">${esc(t('chooseDisease'))}</option>
            ${optionGroups}
          </select>
        </div>
        <button class="btn btn--secondary compare-swap" id="compare-swap" type="button" aria-label="${esc(t('swapSides'))}" title="${esc(t('swapSides'))}">${icon('compare')} <span class="sr-only">${esc(t('swapSides'))}</span></button>
        <div class="field">
          <label for="compare-right">${esc(t('secondDisease'))}</label>
          <select class="select" id="compare-right">
            <option value="">${esc(t('chooseDisease'))}</option>
            ${optionGroupsRight}
          </select>
        </div>
      </section>

      <div id="compare-output"></div>
    </div>`;

  const left = document.getElementById('compare-left');
  const right = document.getElementById('compare-right');
  const swap = document.getElementById('compare-swap');
  const output = document.getElementById('compare-output');

  const syncFromSelects = () => {
    state.compareLeft = left?.value || '';
    state.compareRight = right?.value || '';
    const keys = [state.compareLeft, state.compareRight].filter(Boolean);
    state.compareKeys = [...new Set(keys)].slice(0, 2);
    persistCompare();
    renderCompareTray();
    updateCompareQuery();
    refreshCompareOutput();
  };

  const refreshCompareOutput = () => {
    if (!output) return;
    const a = byKey(state.compareLeft);
    const b = byKey(state.compareRight);
    const same = state.compareLeft && state.compareLeft === state.compareRight;
    if (!a || !b || same) {
      output.innerHTML = `
        <div class="compare-empty">
          <span class="empty-state__icon">${icon('compare')}</span>
          <h2>${esc(t('comparePromptTitle'))}</h2>
          <p>${esc(same ? t('sameDisease') : t('comparePromptBody'))}</p>
        </div>`;
      return;
    }
    const sharedTags = (a.symptomTags || []).filter(tag => (b.symptomTags || []).includes(tag));
    output.innerHTML = `
      <div class="compare-grid">
        ${renderCompareColumn(a)}
        ${renderCompareColumn(b)}
      </div>
      <section class="shared-signs">
        <h2>${icon('check')} ${esc(t('sharedSigns'))}</h2>
        ${sharedTags.length
          ? `<div class="shared-signs__chips">${sharedTags.map(tag => `<span class="pill">${esc(tr(symptomMeta(tag)))}</span>`).join('')}</div>`
          : `<p class="muted" style="font-size:.8rem">${esc(t('noSharedSigns'))}</p>`}
        <p class="compare-note">${esc(t('compareDisclaimer'))}</p>
      </section>
      <div class="compare-actions">
        <button class="btn btn--ghost btn--small" type="button" data-clear-compare>${icon('x')} ${esc(t('compareClear'))}</button>
      </div>`;
  };

  left?.addEventListener('change', syncFromSelects);
  right?.addEventListener('change', syncFromSelects);
  swap?.addEventListener('click', () => {
    const oldLeft = left.value;
    left.value = right.value;
    right.value = oldLeft;
    syncFromSelects();
    left.focus();
  });
  output?.addEventListener('click', event => {
    if (event.target.closest('[data-clear-compare]')) {
      state.compareLeft = '';
      state.compareRight = '';
      state.compareKeys = [];
      if (left) left.value = '';
      if (right) right.value = '';
      persistCompare();
      updateCompareQuery();
      refreshCompareOutput();
      renderCompareTray();
      showToast(t('toastCleared'));
    }
  });

  renderCompareTray();
  refreshCompareOutput();
}

function updateCompareQuery() {
  if (state.route?.view !== 'compare') return;
  const params = new URLSearchParams();
  if (state.compareLeft) params.set('left', state.compareLeft);
  if (state.compareRight) params.set('right', state.compareRight);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  try { history.replaceState(null, '', `#/compare${suffix}`); } catch { /* ignore */ }
}

function renderCompareColumn(d) {
  const animal = animalMeta(d.animal);
  const en = state.lang === 'en' ? '' : ' lang="en" dir="ltr"';
  const otherNames = ['en', 'ku', 'ar']
    .filter(lang => lang !== state.lang && d.name?.[lang])
    .map(lang => `<span lang="${lang}" dir="${langDir(lang)}">${esc(d.name[lang])}</span>`)
    .join(' · ');
  const systems = (d.systems || []).map(systemChip).join('');
  const href = `#/disease/${esc(d.animal)}/${esc(d.id)}`;
  return `
    <article class="compare-column">
      <header class="compare-column__head">
        <p class="eyebrow">${icon(d.animal === 'cattle' ? 'cow' : 'sheep')} ${esc(tr(animal))}</p>
        <h2>${esc(localizedName(d))}</h2>
        ${otherNames ? `<p>${otherNames}</p>` : ''}
        <div class="compare-column__badges">
          ${typePill(d)}
          ${severityBadge(d)}
          ${d.zoonotic ? `<span class="pill pill--zoonotic">${icon('alert')} ${esc(t('zoonoticShort'))}</span>` : ''}
          ${meatBadge(d)}
        </div>
      </header>
      <div class="compare-body">
        <dl>
          <div class="compare-row"><dt>${esc(t('causativeAgent'))}</dt><dd${en}>${esc(d.causativeAgent)}</dd></div>
          <div class="compare-row"><dt>${esc(t('affectedAnimals'))}</dt><dd${en}>${esc(d.affected)}</dd></div>
          <div class="compare-row"><dt>${esc(t('bodySystems'))}</dt><dd>${systems}</dd></div>
          <div class="compare-row"><dt>${esc(t('diseaseType'))}</dt><dd>${esc(tr(typeMeta(d.type)))}</dd></div>
          <div class="compare-row"><dt>${esc(t('severityLabel'))}</dt><dd>${severityBadge(d)}</dd></div>
          <div class="compare-row"><dt>${esc(t('zoonoticRisk'))}</dt><dd>${esc(d.zoonotic ? t('yes') : t('no'))}${d.zoonotic && d.zoonoticNote ? ` <span${en}>— ${esc(d.zoonoticNote)}</span>` : ''}</dd></div>
          <div class="compare-row"><dt>${esc(t('meatSafety'))}</dt><dd>${typeof d.meatSafe === 'boolean' ? `${esc(d.meatSafe ? t('yes') : t('no'))}${d.meatNote ? ` <span${en}>— ${esc(d.meatNote)}</span>` : ''}` : '—'}</dd></div>
          <div class="compare-row"><dt>${esc(t('reportingStatus'))}</dt><dd>${esc(d.notifiable ? t('reportable') : t('notUsuallyReportable'))}</dd></div>
          <div class="compare-row"><dt>${esc(t('symptomsHeading'))}</dt><dd><ul class="symptom-list"${en}>${(d.symptoms || []).map(symptom => `<li>${esc(symptom)}</li>`).join('')}</ul></dd></div>
          <div class="compare-row"><dt>${esc(t('diagnosisHeading'))}</dt><dd${en}>${esc(d.diagnosis)}</dd></div>
          <div class="compare-row"><dt>${esc(t('postMortemHeading'))}</dt><dd${en}>${d.postMortem ? esc(d.postMortem) : '—'}</dd></div>
          <div class="compare-row"><dt>${esc(t('treatmentHeading'))}</dt><dd${en}>${esc(d.treatment)}</dd></div>
          <div class="compare-row"><dt>${esc(t('preventionHeading'))}</dt><dd${en}>${esc(d.prevention)}</dd></div>
        </dl>
        <a class="btn btn--secondary btn--small btn--wide" href="${href}" style="margin-top:.9rem">${esc(t('fullEntry'))} ${icon('arrow-right')}</a>
      </div>
    </article>`;
}


/* =========================================================
   VetAtlas — educational symptom checker
   ========================================================= */

function checkerAnimalList() {
  return [{ id: 'all', label: () => t('allAnimals') }].concat(
    state.data.animals.map(animal => ({ id: animal.id, label: () => tr(animal) }))
  );
}

function checkerSymptomGroups(animal) {
  const inScope = state.data.diseases.filter(d => animal === 'all' || d.animal === animal);
  const used = new Set();
  inScope.forEach(d => (d.symptomTags || []).forEach(tag => used.add(tag)));
  const groups = new Map();
  state.data.symptomCatalog.forEach(symptom => {
    if (!used.has(symptom.id)) return;
    if (!groups.has(symptom.group)) groups.set(symptom.group, []);
    groups.get(symptom.group).push(symptom);
  });
  const order = SYMPTOM_GROUP_ORDER.concat(
    [...groups.keys()].filter(group => !SYMPTOM_GROUP_ORDER.includes(group))
  );
  return order.filter(group => groups.has(group)).map(group => ({
    id: group,
    label: group === 'general' ? t('groupGeneral') : tr(systemMeta(group)),
    symptoms: groups.get(group)
  }));
}

function pruneCheckerSelection() {
  const visible = new Set(
    checkerSymptomGroups(state.checker.animal).flatMap(group => group.symptoms.map(symptom => symptom.id))
  );
  state.checker.selected = new Set([...state.checker.selected].filter(id => visible.has(id)));
}

function checkerMatches() {
  const selected = [...state.checker.selected];
  if (!selected.length) return [];
  return state.data.diseases
    .filter(d => state.checker.animal === 'all' || d.animal === state.checker.animal)
    .map(d => {
      const matched = (d.symptomTags || []).filter(tag => state.checker.selected.has(tag));
      return { disease: d, matched };
    })
    .filter(item => item.matched.length > 0)
    .sort((a, b) => {
      if (b.matched.length !== a.matched.length) return b.matched.length - a.matched.length;
      const severityA = state.data.severities.findIndex(severity => severity.id === a.disease.severity);
      const severityB = state.data.severities.findIndex(severity => severity.id === b.disease.severity);
      if (severityA !== severityB) return severityA - severityB;
      return sortCollator().compare(localizedName(a.disease), localizedName(b.disease));
    });
}

function renderCheckerPage(main, params) {
  const requested = params?.get('animal');
  if (requested === 'cattle' || requested === 'sheep' || requested === 'all') {
    state.checker.animal = requested;
  }
  pruneCheckerSelection();
  document.title = `${t('checkerTitle')} — VetAtlas`;

  main.innerHTML = `
    <div class="container inner-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/">${esc(t('navHome'))}</a>
        ${icon('chevron-down')}
        <span aria-current="page">${esc(t('navChecker'))}</span>
      </nav>
      <header class="page-head">
        <p class="eyebrow">${icon('stethoscope')} ${esc(t('navChecker'))}</p>
        <h1>${esc(t('checkerTitle'))}</h1>
        <p>${esc(t('checkerIntro'))}</p>
      </header>

      <div class="info-callout info-callout--warning checker-warning">
        ${icon('alert')}
        <div><strong>${esc(t('eduStrip'))}</strong> ${esc(t('checkerWarning'))}</div>
      </div>

      <div class="checker-layout">
        <section class="checker-panel" aria-labelledby="checker-signs-heading">
          <div class="checker-toolbar">
            <div class="segmented" role="group" aria-label="${esc(t('animalScope'))}">
              ${checkerAnimalList().map(animal => `
                <button type="button" data-checker-animal="${esc(animal.id)}" aria-pressed="${state.checker.animal === animal.id}">${esc(animal.label())}</button>
              `).join('')}
            </div>
            <div class="checker-actions">
              <span id="checker-selected-count" role="status" aria-live="polite">${esc(t('signsSelected', { count: formatNumber(state.checker.selected.size) }))}</span>
              <button class="link-button" id="checker-clear" type="button" ${state.checker.selected.size ? '' : 'disabled'}>${icon('x')} ${esc(t('clearSymptoms'))}</button>
            </div>
          </div>

          <h2 class="checker-signs-heading" id="checker-signs-heading">${esc(t('selectSignsTitle'))}</h2>
          <p class="checker-signs-hint">${esc(t('selectSignsHint'))}</p>

          <div class="symptom-groups" id="symptom-groups">
            ${checkerSymptomGroups(state.checker.animal).map(group => `
              <fieldset class="symptom-group">
                <legend>${icon(SYSTEM_ICONS[group.id] || 'pulse')} ${esc(group.label)}</legend>
                <div class="symptom-options">
                  ${group.symptoms.map(symptom => `
                    <label class="symptom-option">
                      <input type="checkbox" value="${esc(symptom.id)}" data-symptom="${esc(symptom.id)}" ${state.checker.selected.has(symptom.id) ? 'checked' : ''}>
                      <span>${esc(tr(symptom))}</span>
                    </label>
                  `).join('')}
                </div>
              </fieldset>
            `).join('')}
          </div>
        </section>

        <aside class="checker-results-wrap" aria-label="${esc(t('possibleResults'))}">
          <section class="checker-results">
            <div class="checker-results__head">
              <h2>${icon('pulse')} ${esc(t('possibleResults'))}</h2>
              <p>${esc(t('possibleResultsHint'))}</p>
            </div>
            <div class="checker-results__body" id="checker-results-body" aria-live="polite"></div>
          </section>
          <p class="checker-disclaimer">${esc(t('checkerDisclaimer'))}</p>
        </aside>
      </div>
    </div>`;

  setupCheckerPage();
}

function setupCheckerPage() {
  const panel = document.querySelector('.checker-panel');
  const resultBody = document.getElementById('checker-results-body');
  if (!panel || !resultBody) return;

  const updateCount = () => {
    const count = document.getElementById('checker-selected-count');
    if (count) count.textContent = t('signsSelected', { count: formatNumber(state.checker.selected.size) });
    const clear = document.getElementById('checker-clear');
    if (clear) clear.disabled = state.checker.selected.size === 0;
  };

  const redrawGroups = () => {
    const holder = document.getElementById('symptom-groups');
    if (!holder) return;
    holder.innerHTML = checkerSymptomGroups(state.checker.animal).map(group => `
      <fieldset class="symptom-group">
        <legend>${icon(SYSTEM_ICONS[group.id] || 'pulse')} ${esc(group.label)}</legend>
        <div class="symptom-options">
          ${group.symptoms.map(symptom => `
            <label class="symptom-option">
              <input type="checkbox" value="${esc(symptom.id)}" data-symptom="${esc(symptom.id)}" ${state.checker.selected.has(symptom.id) ? 'checked' : ''}>
              <span>${esc(tr(symptom))}</span>
            </label>
          `).join('')}
        </div>
      </fieldset>
    `).join('');
  };

  panel.addEventListener('change', event => {
    const input = event.target.closest('[data-symptom]');
    if (!input) return;
    if (input.checked) state.checker.selected.add(input.getAttribute('data-symptom'));
    else state.checker.selected.delete(input.getAttribute('data-symptom'));
    state.checker.showAll = false;
    updateCount();
    refreshCheckerResults();
  });

  panel.addEventListener('click', event => {
    const animalButton = event.target.closest('[data-checker-animal]');
    if (animalButton) {
      state.checker.animal = animalButton.getAttribute('data-checker-animal');
      panel.querySelectorAll('[data-checker-animal]').forEach(button => {
        button.setAttribute('aria-pressed', String(button === animalButton));
      });
      pruneCheckerSelection();
      updateCount();
      redrawGroups();
      state.checker.showAll = false;
      refreshCheckerResults();
      return;
    }
    if (event.target.closest('#checker-clear')) {
      state.checker.selected.clear();
      state.checker.showAll = false;
      panel.querySelectorAll('[data-symptom]').forEach(input => { input.checked = false; });
      updateCount();
      refreshCheckerResults();
    }
  });

  resultBody.addEventListener('click', event => {
    if (event.target.closest('[data-checker-show-all]')) {
      state.checker.showAll = true;
      refreshCheckerResults();
      return;
    }
    if (event.target.closest('[data-checker-show-less]')) {
      state.checker.showAll = false;
      refreshCheckerResults();
      return;
    }
    if (event.target.closest('[data-checker-clear]')) {
      state.checker.selected.clear();
      state.checker.showAll = false;
      panel.querySelectorAll('[data-symptom]').forEach(input => { input.checked = false; });
      updateCount();
      refreshCheckerResults();
    }
  });

  refreshCheckerResults();
}

function refreshCheckerResults() {
  const body = document.getElementById('checker-results-body');
  if (!body) return;
  const selected = state.checker.selected;
  if (!selected.size) {
    body.innerHTML = `
      <div class="checker-placeholder">
        ${icon('stethoscope')}
        <h3>${esc(t('checkerPlaceholderTitle'))}</h3>
        <p>${esc(t('checkerPlaceholderBody'))}</p>
      </div>`;
    return;
  }

  const matches = checkerMatches();
  if (!matches.length) {
    body.innerHTML = `
      <div class="match-empty">
        ${icon('search')}
        <h3>${esc(t('noMatchTitle'))}</h3>
        <p>${esc(t('noMatchBody'))}</p>
        <button class="btn btn--secondary btn--small" type="button" data-checker-clear>${icon('x')} ${esc(t('clearAndStart'))}</button>
      </div>`;
    return;
  }

  const limit = 6;
  const visible = state.checker.showAll ? matches : matches.slice(0, limit);
  const selectedCount = selected.size;
  body.innerHTML = `
    <div class="match-summary">
      <span>${esc(t('possibleResults'))}</span>
      <strong>${esc(t('searchMatches', { count: formatNumber(matches.length) }))}</strong>
    </div>
    <ul class="matching-list">
      ${visible.map(item => {
        const d = item.disease;
        const matched = item.matched;
        const percent = Math.round((matched.length / selectedCount) * 100);
        return `<li>
          <a class="match-card" href="#/disease/${esc(d.animal)}/${esc(d.id)}">
            <div class="match-card__top">
              <div>
                <span class="match-card__name">${esc(localizedName(d))}</span>
                <span class="match-card__animal">${icon(d.animal === 'cattle' ? 'cow' : 'sheep')} ${esc(tr(animalMeta(d.animal)))} · ${esc(tr(severityMeta(d.severity)))}</span>
              </div>
              <span class="match-score">
                <strong>${esc(t('matchLabel', { percent: formatNumber(percent) }))}</strong>
                <small>${esc(t('signsMatched', { matched: formatNumber(matched.length), selected: formatNumber(selectedCount) }))}</small>
              </span>
            </div>
            <span class="match-card__bar" aria-hidden="true"><span style="width:${Math.max(6, percent)}%"></span></span>
            <span class="match-card__signs">${matched.map(tag => `<span class="pill">${esc(tr(symptomMeta(tag)))}</span>`).join('')}</span>
          </a>
        </li>`;
      }).join('')}
    </ul>
    ${matches.length > limit
      ? `<button class="btn btn--secondary btn--small show-more-results" type="button" ${state.checker.showAll ? 'data-checker-show-less' : 'data-checker-show-all'}>
          ${icon(state.checker.showAll ? 'chevron-down' : 'plus')}
          ${esc(state.checker.showAll ? t('showFewerResults') : t('showAllResults', { count: formatNumber(matches.length) }))}
        </button>`
      : ''}`;
}


  /* =========================================================
   VetAtlas — add disease page (saved by the local server)
   ========================================================= */

function renderLoginPage(main, next = '#/add', notice = '') {
  document.title = `${t('loginTitle')} — VetAtlas`;
  const target = typeof next === 'string' && next.startsWith('#/') ? next : '#/add';
  main.innerHTML = `
    <div class="container inner-page auth-page">
      <p class="eyebrow">${icon('lock')} ${esc(t('loginEyebrow'))}</p>
      <h1>${esc(t('loginTitle'))}</h1>
      <p class="add-page__intro">${esc(t('loginIntro'))}</p>
      ${notice ? `<div class="info-callout info-callout--warning">${icon('alert')} <span>${esc(notice)}</span></div>` : ''}

      <form class="auth-card" id="login-form" novalidate>
        <div class="form-errors" id="login-errors" role="alert" tabindex="-1" hidden></div>
        <div class="field">
          <label for="login-user">${esc(t('loginUser'))}</label>
          <input class="input" id="login-user" type="text" autocomplete="username" maxlength="100" required dir="ltr" lang="en" spellcheck="false">
        </div>
        <div class="field">
          <label for="login-password">${esc(t('loginPassword'))}</label>
          <input class="input" id="login-password" type="password" autocomplete="current-password" maxlength="200" required dir="ltr" lang="en">
        </div>
        <div class="add-actions">
          <button class="btn btn--primary" type="submit" id="login-submit">
            ${icon('lock')} <span>${esc(t('loginSubmit'))}</span>
          </button>
          <a class="btn btn--ghost" href="#/">${esc(t('addCancel'))}</a>
        </div>
        <p class="field-hint">${esc(t('loginNote'))}</p>
      </form>
    </div>`;

  const form = document.getElementById('login-form');
  if (!form) return;
  const box = document.getElementById('login-errors');
  const button = document.getElementById('login-submit');
  const label = button?.querySelector('span');

  const showError = message => {
    if (!box) return;
    box.hidden = false;
    box.innerHTML = `<strong>${esc(message)}</strong>`;
    box.focus({ preventScroll: true });
    box.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const user = document.getElementById('login-user')?.value.trim() || '';
    const password = document.getElementById('login-password')?.value || '';
    if (!user || !password) {
      showError(t('loginEmpty'));
      return;
    }
    if (box) box.hidden = true;
    if (button) button.disabled = true;
    const originalLabel = label?.textContent || '';
    if (label) label.textContent = t('loginSaving');

    try {
      if (user !== ADMIN_USER || password !== ADMIN_PASSWORD) throw new Error(t('loginInvalid'));
      saveSession(ADMIN_SESSION_TOKEN, ADMIN_USER);
      showToast(t('loginWelcome'));
      navigateTo(target);
    } catch (error) {
      showError(error?.message || t('loginError'));
      if (button) button.disabled = false;
      if (label) label.textContent = originalLabel;
      const passwordField = document.getElementById('login-password');
      if (passwordField) { passwordField.value = ''; passwordField.focus(); }
    }
  });
}

function renderAccountPage(main) {
  if (!AUTH.user) {
    renderLoginPage(main, '#/add');
    return;
  }
  document.title = `${t('accountTitle')} — VetAtlas`;
  main.innerHTML = `
    <div class="container inner-page auth-page">
      <p class="eyebrow">${icon('user')} ${esc(t('navAccountAdmin'))}</p>
      <h1>${esc(t('accountTitle'))}</h1>
      <div class="detail-card auth-card">
        <p class="account-state">${icon('check')} ${esc(t('accountSignedIn'))} <strong>${esc(AUTH.user)}</strong></p>
        <p>${esc(t('accountBody'))}</p>
        <div class="animal-manager" style="margin-block:1rem">
          ${(state.data.animals || []).map(animal => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--line)">
              <strong>${esc(tr(animal))}</strong>
              <button class="btn btn--danger btn--small" type="button" data-delete-animal="${esc(animal.id)}">Delete</button>
            </div>`).join('')}
        </div>
        <div class="add-actions">
          <a class="btn btn--primary" href="#/add">${icon('plus')} ${esc(t('navAdd'))}</a>
          <button class="btn btn--ghost" type="button" id="logout">${icon('logout')} ${esc(t('loginSignOut'))}</button>
        </div>
      </div>
    </div>`;
  document.querySelectorAll('[data-delete-animal]').forEach(button => {
    button.addEventListener('click', async () => {
      const animalId = button.getAttribute('data-delete-animal');
      const animal = animalMeta(animalId);
      if (!window.confirm(`Delete ${tr(animal)} and all its diseases?`)) return;
      try {
        deleteLocalAnimal(animalId);
        state.data.animals = state.data.animals.filter(item => item.id !== animalId);
        state.data.diseases = state.data.diseases.filter(item => item.animal !== animalId);
        showToast('Animal deleted.');
        renderAccountPage(main);
      } catch (error) {
        showToast(error?.message || 'Animal delete failed');
      }
    });
  });
  document.getElementById('logout')?.addEventListener('click', signOut);
}

function renderAddPage(main) {
  if (!AUTH.user) {
    renderLoginPage(main, '#/add', t('loginNeeded'));
    return;
  }
  renderDiseaseForm(main, { mode: 'add' });
}

function renderEditPage(main, disease) {
  if (!AUTH.user) {
    renderLoginPage(main, `#/edit/${encodeURIComponent(disease.animal)}/${encodeURIComponent(disease.id)}`, t('loginNeeded'));
    return;
  }
  renderDiseaseForm(main, { mode: 'edit', disease });
}

function renderDiseaseForm(main, { mode = 'add', disease = null } = {}) {
  const isEdit = mode === 'edit' && Boolean(disease);
  document.title = `${t(isEdit ? 'editTitle' : 'addTitle')} — VetAtlas`;
  const animalOptions = state.data.animals
    .map(a => `<option value="${esc(a.id)}">${esc(tr(a))}</option>`).join('');
  const typeOptions = state.data.types
    .map(x => `<option value="${esc(x.id)}">${esc(tr(x))}</option>`).join('');
  const severityOptions = state.data.severities
    .map(x => `<option value="${esc(x.id)}">${esc(tr(x))}</option>`).join('');
  const systemChoices = state.data.systems.map(s => `
    <label class="check-chip">
      <input type="checkbox" name="systems" value="${esc(s.id)}">
      <span>${icon(SYSTEM_ICONS[s.id] || 'pulse')} ${esc(tr(s))}</span>
    </label>`).join('');

  const groups = new Map();
  state.data.symptomCatalog.forEach(sym => {
    if (!groups.has(sym.group)) groups.set(sym.group, []);
    groups.get(sym.group).push(sym);
  });
  const groupOrder = [
    ...SYMPTOM_GROUP_ORDER.filter(group => groups.has(group)),
    ...[...groups.keys()].filter(group => !SYMPTOM_GROUP_ORDER.includes(group))
  ];
  const tagGroups = groupOrder.map(group => `
    <div class="tag-group" data-tag-group>
      <p class="tag-group__title">${esc(group === 'general' ? t('groupGeneral') : tr(systemMeta(group)))}</p>
      <div class="tag-group__items">
        ${groups.get(group).map(sym => `
          <label class="check-chip check-chip--tag" data-tag-label data-search="${esc(normalized(`${sym.en} ${sym.ku || ''} ${sym.ar || ''}`))}">
            <input type="checkbox" name="symptomTags" value="${esc(sym.id)}">
            <span>${esc(tr(sym))}</span>
          </label>`).join('')}
      </div>
    </div>`).join('');

  main.innerHTML = `
    <div class="container inner-page add-page">
      <p class="eyebrow">${icon(isEdit ? 'edit' : 'plus')} ${esc(t(isEdit ? 'editEyebrow' : 'addEyebrow'))}</p>
      <h1>${esc(t(isEdit ? 'editTitle' : 'addTitle'))}</h1>
      <p class="add-page__intro">${esc(t(isEdit ? 'editIntro' : 'addIntro'))}</p>
      <div class="info-callout info-callout--info" id="add-server-status" role="status">
        ${icon('pulse')} <span>${esc(t('addServerChecking'))}</span>
      </div>

      <form id="add-form" class="add-form" novalidate>
        <div class="form-errors" id="add-errors" role="alert" tabindex="-1" hidden></div>

        <section class="detail-card add-section" aria-labelledby="add-basics-title">
          <div class="detail-card__head">
            <span class="detail-card__icon">${icon('book')}</span>
            <h2 id="add-basics-title">${esc(t('addSectionBasics'))}</h2>
          </div>
          <p class="add-section__note">${esc(t('addRequiredNote'))}</p>

          <div class="form-grid form-grid--3">
            <div class="field">
              <label for="add-animal">${esc(t('addAnimal'))} <span class="req" aria-hidden="true">*</span></label>
              <div style="display:flex; gap:8px; align-items:center;">
                <select class="select" id="add-animal" required style="flex:1;">
                  <option value="">${esc(t('addChoose'))}</option>
                  ${animalOptions}
                </select>
                <button class="btn btn--secondary btn--small" type="button" id="add-animal-toggle" aria-expanded="false" aria-controls="new-animal-panel" title="${esc(t('addAnimalNew'))}">+</button>
              </div>
              <div id="new-animal-panel" hidden style="margin-top:10px; display:grid; gap:8px;">
                <input class="input" id="new-animal-en" maxlength="80" placeholder="${esc(t('addAnimalEn'))}">
                <input class="input" id="new-animal-ku" maxlength="80" placeholder="${esc(t('addAnimalKu'))}">
                <input class="input" id="new-animal-ar" maxlength="80" placeholder="${esc(t('addAnimalAr'))}">
                <button class="btn btn--primary btn--small" type="button" id="add-animal-save">${esc(t('addAnimalSave'))}</button>
              </div>
            </div>
            <div class="field">
              <label for="add-type">${esc(t('addType'))} <span class="req" aria-hidden="true">*</span></label>
              <select class="select" id="add-type" required>
                <option value="">${esc(t('addChoose'))}</option>
                ${typeOptions}
              </select>
            </div>
            <div class="field">
              <label for="add-severity">${esc(t('addSeverity'))} <span class="req" aria-hidden="true">*</span></label>
              <select class="select" id="add-severity" required>
                <option value="">${esc(t('addChoose'))}</option>
                ${severityOptions}
              </select>
            </div>
          </div>

          <fieldset class="form-fieldset" id="add-systems">
            <legend>${esc(t('addSystems'))} <span class="req" aria-hidden="true">*</span></legend>
            <p class="field-hint">${esc(t('addSystemsHint'))}</p>
            <div class="check-grid">${systemChoices}</div>
          </fieldset>

          <div class="form-grid form-grid--3">
            <div class="field">
              <label for="add-name-en">${esc(t('addNameEn'))} <span class="req" aria-hidden="true">*</span></label>
              <input class="input" id="add-name-en" type="text" maxlength="160" required dir="ltr" lang="en">
            </div>
            <div class="field">
              <label for="add-name-ku">${esc(t('addNameKu'))}</label>
              <input class="input" id="add-name-ku" type="text" maxlength="160" dir="rtl" lang="ku">
            </div>
            <div class="field">
              <label for="add-name-ar">${esc(t('addNameAr'))}</label>
              <input class="input" id="add-name-ar" type="text" maxlength="160" dir="rtl" lang="ar">
            </div>
          </div>

          <div class="form-grid form-grid--3">
            <div class="field">
              <label for="add-summary-en">${esc(t('addSummaryEn'))} <span class="req" aria-hidden="true">*</span></label>
              <textarea class="input" id="add-summary-en" rows="3" maxlength="1200" required dir="ltr" lang="en"></textarea>
            </div>
            <div class="field">
              <label for="add-summary-ku">${esc(t('addSummaryKu'))}</label>
              <textarea class="input" id="add-summary-ku" rows="3" maxlength="1200" dir="rtl" lang="ku"></textarea>
            </div>
            <div class="field">
              <label for="add-summary-ar">${esc(t('addSummaryAr'))}</label>
              <textarea class="input" id="add-summary-ar" rows="3" maxlength="1200" dir="rtl" lang="ar"></textarea>
            </div>
          </div>

          <div class="field">
            <label for="add-aliases">${esc(t('addAliases'))}</label>
            <input class="input" id="add-aliases" type="text" dir="ltr" lang="en">
            <p class="field-hint">${esc(t('addAliasesHint'))}</p>
          </div>
        </section>

        <section class="detail-card add-section" aria-labelledby="add-clinical-title">
          <div class="detail-card__head">
            <span class="detail-card__icon">${icon('stethoscope')}</span>
            <h2 id="add-clinical-title">${esc(t('addSectionClinical'))}</h2>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="add-causative">${esc(t('addCausative'))} <span class="req" aria-hidden="true">*</span></label>
              <textarea class="input" id="add-causative" rows="3" required dir="ltr" lang="en"></textarea>
            </div>
            <div class="field">
              <label for="add-affected">${esc(t('addAffected'))} <span class="req" aria-hidden="true">*</span></label>
              <textarea class="input" id="add-affected" rows="3" required dir="ltr" lang="en"></textarea>
            </div>
          </div>

          <div class="field">
            <label for="add-symptoms">${esc(t('addSymptoms'))} <span class="req" aria-hidden="true">*</span></label>
            <textarea class="input" id="add-symptoms" rows="6" required dir="ltr" lang="en"></textarea>
            <p class="field-hint">${esc(t('addSymptomsHint'))}</p>
          </div>

          <details class="tag-picker" id="add-symptom-tags">
            <summary>
              ${icon('stethoscope')}
              <span>${esc(t('addSymptomTags'))} <span class="req" aria-hidden="true">*</span></span>
              <span class="tag-picker__count" id="tag-count"></span>
            </summary>
            <p class="field-hint">${esc(t('addSymptomTagsHint'))}</p>
            <label class="sr-only" for="add-tag-filter">${esc(t('addTagFilter'))}</label>
            <input class="input" id="add-tag-filter" type="search" placeholder="${esc(t('addTagFilter'))}">
            <div class="tag-groups" id="tag-groups">${tagGroups}</div>
            <p class="field-hint" id="tag-empty" hidden>${esc(t('addNoTags'))}</p>
          </details>

          <div class="field">
            <label for="add-diagnosis">${esc(t('addDiagnosis'))} <span class="req" aria-hidden="true">*</span></label>
            <textarea class="input" id="add-diagnosis" rows="4" required dir="ltr" lang="en"></textarea>
          </div>
          <div class="field">
            <label for="add-postmortem">${esc(t('addPostMortem'))} <span class="req" aria-hidden="true">*</span></label>
            <textarea class="input" id="add-postmortem" rows="4" required dir="ltr" lang="en"></textarea>
          </div>
          <div class="field">
            <label for="add-treatment">${esc(t('addTreatment'))} <span class="req" aria-hidden="true">*</span></label>
            <textarea class="input" id="add-treatment" rows="4" required dir="ltr" lang="en"></textarea>
          </div>
          <div class="field">
            <label for="add-prevention">${esc(t('addPrevention'))} <span class="req" aria-hidden="true">*</span></label>
            <textarea class="input" id="add-prevention" rows="4" required dir="ltr" lang="en"></textarea>
          </div>
        </section>

        <section class="detail-card add-section" aria-labelledby="add-safety-title">
          <div class="detail-card__head">
            <span class="detail-card__icon">${icon('shield')}</span>
            <h2 id="add-safety-title">${esc(t('addSectionSafety'))}</h2>
          </div>

          <div class="form-grid form-grid--3">
            <div class="field">
              <label for="add-zoonotic">${esc(t('addZoonotic'))} <span class="req" aria-hidden="true">*</span></label>
              <select class="select" id="add-zoonotic" required>
                <option value="">${esc(t('addChoose'))}</option>
                <option value="no">${esc(t('no'))}</option>
                <option value="yes">${esc(t('yes'))}</option>
              </select>
            </div>
            <div class="field">
              <label for="add-notifiable">${esc(t('addNotifiable'))} <span class="req" aria-hidden="true">*</span></label>
              <select class="select" id="add-notifiable" required>
                <option value="">${esc(t('addChoose'))}</option>
                <option value="no">${esc(t('no'))}</option>
                <option value="yes">${esc(t('yes'))}</option>
              </select>
            </div>
            <div class="field">
              <label for="add-meat">${esc(t('addMeatSafe'))} <span class="req" aria-hidden="true">*</span></label>
              <select class="select" id="add-meat" required>
                <option value="">${esc(t('addChoose'))}</option>
                <option value="yes">${esc(t('yes'))}</option>
                <option value="no">${esc(t('no'))}</option>
              </select>
            </div>
          </div>

          <div class="form-grid form-grid--3">
            <div class="field">
              <label for="add-zoonotic-note">${esc(t('addZoonoticNote'))}</label>
              <textarea class="input" id="add-zoonotic-note" rows="3" dir="ltr" lang="en"></textarea>
            </div>
            <div class="field">
              <label for="add-notifiable-note">${esc(t('addNotifiableNote'))}</label>
              <textarea class="input" id="add-notifiable-note" rows="3" dir="ltr" lang="en"></textarea>
            </div>
            <div class="field">
              <label for="add-meat-note">${esc(t('addMeatNote'))} <span class="req" aria-hidden="true">*</span></label>
              <textarea class="input" id="add-meat-note" rows="3" required dir="ltr" lang="en"></textarea>
            </div>
          </div>
        </section>

        <section class="detail-card add-section" aria-labelledby="add-photo-title">
          <div class="detail-card__head">
            <span class="detail-card__icon">${icon('search')}</span>
            <h2 id="add-photo-title">${esc(t('addSectionPhoto'))}</h2>
          </div>

          <div class="field">
            <label for="add-image">${esc(t('addImage'))}</label>
            <input class="input" id="add-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif">
            <p class="field-hint">${esc(t('addImageHint'))}</p>
          </div>

          <div class="image-preview" id="image-preview" hidden>
            <img id="image-preview-img" alt="">
            <div class="image-preview__meta">
              <span id="image-preview-name"></span>
              <button class="btn btn--ghost btn--small" type="button" id="image-remove">${icon('x')} ${esc(t('addImageRemove'))}</button>
            </div>
          </div>

          <div class="field" style="margin-top:.9rem">
            <label for="add-image-alt">${esc(t('addImageAlt'))}</label>
            <input class="input" id="add-image-alt" type="text" maxlength="300" dir="ltr" lang="en">
            <p class="field-hint">${esc(t('addImageAltHint'))}</p>
          </div>
        </section>

        <div class="add-actions">
          ${isEdit ? '<button class="btn btn--danger" type="button" id="delete-disease-button">Delete disease</button>' : ''}
          <button class="btn btn--primary" type="submit" id="add-submit" disabled>
            ${icon('check')} <span>${esc(t(isEdit ? 'editSubmit' : 'addSubmit'))}</span>
          </button>
          <a class="btn btn--ghost" href="${isEdit ? `#/disease/${esc(disease.animal)}/${esc(disease.id)}` : '#/'}">${esc(t('addCancel'))}</a>
        </div>
      </form>
    </div>`;

  setupDiseaseForm({ mode, disease });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function setupDiseaseForm({ mode = 'add', disease = null } = {}) {
  const isEdit = mode === 'edit' && Boolean(disease);
  const form = document.getElementById('add-form');
  document.getElementById('delete-disease-button')?.addEventListener('click', async () => {
    if (!window.confirm(`Delete ${disease.name?.en || 'this disease'}?`)) return;
    try {
      deleteLocalDisease(disease.animal, disease.id);
      showToast('Disease deleted.');
      await loadData();
      navigateTo('#/');
    } catch (error) {
      showErrors([error?.message || 'Delete failed']);
    }
  });
  if (!form) return;
  const status = document.getElementById('add-server-status');
  const submit = document.getElementById('add-submit');
  const errorsBox = document.getElementById('add-errors');
  const animalToggle = document.getElementById('add-animal-toggle');
  const animalPanel = document.getElementById('new-animal-panel');
  animalToggle?.addEventListener('click', () => {
    const opening = animalPanel.hidden;
    animalPanel.hidden = !opening;
    animalToggle.setAttribute('aria-expanded', String(opening));
    if (opening) document.getElementById('new-animal-en')?.focus();
  });
  document.getElementById('add-animal-save')?.addEventListener('click', async () => {
    const english = document.getElementById('new-animal-en').value.trim();
    if (!english) {
      document.getElementById('new-animal-en').focus();
      return;
    }
    const payload = {
      en: english,
      ku: document.getElementById('new-animal-ku').value.trim() || english,
      ar: document.getElementById('new-animal-ar').value.trim() || english
    };
    try {
      let json;
      const id = payload.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!id) throw new Error('Enter a valid animal name.');
      const animal = { id, en: payload.en, ku: payload.ku, ar: payload.ar };
      saveLocalAnimal(animal);
      json = { animal };
      state.data.animals.push(json.animal);
      const option = document.createElement('option');
      option.value = json.animal.id;
      option.textContent = tr(json.animal);
      document.getElementById('add-animal').appendChild(option);
      document.getElementById('add-animal').value = json.animal.id;
      animalPanel.hidden = true;
      animalToggle.setAttribute('aria-expanded', 'false');
      showToast(t('addAnimalSaved'));
    } catch (error) {
      showToast(error.message);
    }
  });
  const fileInput = document.getElementById('add-image');
  const preview = document.getElementById('image-preview');
  const previewImg = document.getElementById('image-preview-img');
  const previewName = document.getElementById('image-preview-name');
  const removeButton = document.getElementById('image-remove');
  const tagPicker = document.getElementById('add-symptom-tags');
  const tagFilter = document.getElementById('add-tag-filter');
  const tagEmpty = document.getElementById('tag-empty');
  const tagCount = document.getElementById('tag-count');
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxBytes = 5 * 1024 * 1024;
  let imageFile = null;
  let currentImage = isEdit ? (disease.image || '') : '';
  let previewUrl = '';
  let serverReady = false;

  const setServerState = ready => {
    serverReady = ready;
    if (status) {
      status.className = `info-callout ${ready ? 'info-callout--info' : 'info-callout--warning'}`;
      status.innerHTML = `${icon(ready ? 'pulse' : 'alert')} <span>${esc(ready ? t('addServerOk') : t('addServerDown'))}</span>`;
    }
    if (submit) submit.disabled = !ready;
  };

  setServerState(true);

  const updateTagCount = () => {
    if (!tagCount) return;
    const count = form.querySelectorAll('input[name="symptomTags"]:checked').length;
    tagCount.textContent = t('addTagsSelected', { count: formatNumber(count) });
  };
  updateTagCount();

  form.addEventListener('change', event => {
    if (event.target instanceof HTMLElement && event.target.name === 'symptomTags') updateTagCount();
  });

  const hidePreview = () => {
    if (preview) preview.hidden = true;
    if (previewImg) previewImg.removeAttribute('src');
    if (previewName) previewName.textContent = '';
  };

  const showPreview = (src, label, alt = '') => {
    if (previewImg) {
      previewImg.src = src;
      previewImg.alt = alt;
    }
    if (previewName) previewName.textContent = label;
    if (preview) preview.hidden = false;
  };

  const formatBytes = size => size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;

  const renderPreview = () => {
    if (imageFile && previewUrl) {
      showPreview(previewUrl, `${imageFile.name} · ${formatBytes(imageFile.size)}`);
    } else if (currentImage) {
      const name = currentImage.split('/').pop();
      showPreview(currentImage, `${t('addCurrentPhoto')} · ${name}`, disease?.imageAlt || '');
    } else {
      hidePreview();
    }
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    imageFile = null;
    currentImage = '';
    if (fileInput) fileInput.value = '';
    hidePreview();
  };

  const resetFileInput = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    imageFile = null;
    if (fileInput) fileInput.value = '';
    renderPreview();
  };

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) { resetFileInput(); return; }
    if (!allowedTypes.includes(file.type)) {
      showToast(t('addImageBadType'));
      resetFileInput();
      return;
    }
    if (file.size > maxBytes) {
      showToast(t('addImageTooLarge'));
      resetFileInput();
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    imageFile = file;
    previewUrl = URL.createObjectURL(file);
    renderPreview();
  });

  removeButton?.addEventListener('click', clearImage);

  if (isEdit && disease) {
    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value == null ? '' : String(value);
    };
    setValue('add-animal', disease.animal);
    setValue('add-type', disease.type);
    setValue('add-severity', disease.severity);
    setValue('add-name-en', disease.name?.en || '');
    setValue('add-name-ku', disease.name?.ku || '');
    setValue('add-name-ar', disease.name?.ar || '');
    setValue('add-summary-en', disease.summary?.en || '');
    setValue('add-summary-ku', disease.summary?.ku || '');
    setValue('add-summary-ar', disease.summary?.ar || '');
    setValue('add-aliases', (disease.aliases || []).join(', '));
    setValue('add-causative', disease.causativeAgent || '');
    setValue('add-affected', disease.affected || '');
    setValue('add-symptoms', (disease.symptoms || []).join('\n'));
    setValue('add-diagnosis', disease.diagnosis || '');
    setValue('add-postmortem', disease.postMortem || '');
    setValue('add-treatment', disease.treatment || '');
    setValue('add-prevention', disease.prevention || '');
    setValue('add-zoonotic-note', disease.zoonoticNote || '');
    setValue('add-notifiable-note', disease.notifiableNote || '');
    setValue('add-meat-note', disease.meatNote || '');
    setValue('add-image-alt', disease.imageAlt || '');
    const systems = new Set(disease.systems || []);
    form.querySelectorAll('input[name="systems"]').forEach(input => { input.checked = systems.has(input.value); });
    const tags = new Set(disease.symptomTags || []);
    form.querySelectorAll('input[name="symptomTags"]').forEach(input => { input.checked = tags.has(input.value); });
    setValue('add-zoonotic', disease.zoonotic ? 'yes' : 'no');
    setValue('add-notifiable', disease.notifiable ? 'yes' : 'no');
    setValue('add-meat', disease.meatSafe ? 'yes' : 'no');
    updateTagCount();
    renderPreview();
  }

  tagFilter?.addEventListener('input', () => {
    const query = normalized(tagFilter.value);
    let visible = 0;
    form.querySelectorAll('[data-tag-label]').forEach(label => {
      const show = !query || label.dataset.search.includes(query);
      label.hidden = !show;
      if (show) visible++;
    });
    form.querySelectorAll('[data-tag-group]').forEach(group => {
      const any = [...group.querySelectorAll('[data-tag-label]')].some(label => !label.hidden);
      group.hidden = !any;
    });
    if (tagEmpty) tagEmpty.hidden = visible > 0;
  });

  const value = id => (document.getElementById(id)?.value || '').trim();
  const checked = name => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);

  const collect = () => ({
    animal: value('add-animal'),
    type: value('add-type'),
    severity: value('add-severity'),
    systems: checked('systems'),
    name: { en: value('add-name-en'), ku: value('add-name-ku'), ar: value('add-name-ar') },
    summary: { en: value('add-summary-en'), ku: value('add-summary-ku'), ar: value('add-summary-ar') },
    aliases: value('add-aliases').split(',').map(item => item.trim()).filter(Boolean),
    causativeAgent: value('add-causative'),
    affected: value('add-affected'),
    symptoms: value('add-symptoms').split('\n').map(item => item.trim()).filter(Boolean),
    symptomTags: checked('symptomTags'),
    diagnosis: value('add-diagnosis'),
    postMortem: value('add-postmortem'),
    treatment: value('add-treatment'),
    prevention: value('add-prevention'),
    zoonotic: value('add-zoonotic'),
    zoonoticNote: value('add-zoonotic-note'),
    notifiable: value('add-notifiable'),
    notifiableNote: value('add-notifiable-note'),
    meatSafe: value('add-meat'),
    meatNote: value('add-meat-note')
  });

  const markInvalid = id => {
    const field = document.getElementById(id);
    if (!field) return;
    field.setAttribute('aria-invalid', 'true');
    const clear = () => field.removeAttribute('aria-invalid');
    field.addEventListener('input', clear, { once: true });
    field.addEventListener('change', clear, { once: true });
  };

  const showErrors = messages => {
    if (!errorsBox) return;
    errorsBox.hidden = false;
    errorsBox.innerHTML = `<strong>${esc(t('addErrorValidation'))}</strong><ul>${messages.map(message => `<li>${esc(message)}</li>`).join('')}</ul>`;
    errorsBox.focus({ preventScroll: true });
    errorsBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const validate = payload => {
    const problems = [];
    form.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
    const required = (id, ok, labelKey) => {
      if (ok) return;
      markInvalid(id);
      problems.push(t('addFieldRequired', { field: t(labelKey) }));
    };
    required('add-animal', payload.animal, 'addAnimal');
    required('add-type', payload.type, 'addType');
    required('add-severity', payload.severity, 'addSeverity');
    required('add-name-en', payload.name.en, 'addNameEn');
    required('add-summary-en', payload.summary.en, 'addSummaryEn');
    required('add-causative', payload.causativeAgent, 'addCausative');
    required('add-affected', payload.affected, 'addAffected');
    required('add-diagnosis', payload.diagnosis, 'addDiagnosis');
    required('add-postmortem', payload.postMortem, 'addPostMortem');
    required('add-treatment', payload.treatment, 'addTreatment');
    required('add-prevention', payload.prevention, 'addPrevention');
    required('add-zoonotic', payload.zoonotic, 'addZoonotic');
    required('add-notifiable', payload.notifiable, 'addNotifiable');
    required('add-meat', payload.meatSafe, 'addMeatSafe');
    required('add-meat-note', payload.meatNote, 'addMeatNote');
    if (!payload.systems.length) {
      markInvalid('add-systems');
      problems.push(t('addNeedSystems'));
    }
    if (!payload.symptoms.length) {
      markInvalid('add-symptoms');
      problems.push(t('addNeedSymptoms'));
    }
    if (!payload.symptomTags.length) {
      markInvalid('add-symptom-tags');
      if (tagPicker) tagPicker.open = true;
      problems.push(t('addNeedTags'));
    }
    return problems;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!serverReady) {
      showErrors([t('addServerRequired')]);
      return;
    }
    const payload = collect();
    const problems = validate(payload);
    if (problems.length) {
      showErrors(problems);
      return;
    }
    if (errorsBox) errorsBox.hidden = true;

    const label = submit?.querySelector('span');
    const originalLabel = label?.textContent || '';
    if (submit) submit.disabled = true;
    if (label) label.textContent = t(isEdit ? 'editSaving' : 'addSaving');

    try {
      let imagePath = currentImage;
      if (imageFile) {
        imagePath = await readFileAsDataURL(imageFile);
      }

      const body = {
        ...payload,
        zoonotic: payload.zoonotic === 'yes',
        notifiable: payload.notifiable === 'yes',
        meatSafe: payload.meatSafe === 'yes',
        image: imagePath,
        imageAlt: value('add-image-alt')
      };
      const { name, summary, ...diseaseData } = body;
      let diseaseId = isEdit ? disease.id : body.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/-+/g, '-');
      if (!diseaseId) throw new Error(t('addFieldRequired', { field: t('addNameEn') }));
      const localDisease = { ...diseaseData, name, summary, id: diseaseId, animal: body.animal };
      if (isEdit && disease.animal !== body.animal) deleteLocalDisease(disease.animal, disease.id);
      saveLocalDisease(localDisease);
      const saved = { animal: body.animal, id: diseaseId };

      showToast(t(isEdit ? 'editSuccess' : 'addSuccess'));
      await loadData();
      navigateTo(`#/disease/${encodeURIComponent(saved.animal)}/${encodeURIComponent(saved.id)}`);
    } catch (error) {
      showErrors([t('addError'), error?.message || ''].filter(Boolean));
      if (submit) submit.disabled = false;
      if (label) label.textContent = originalLabel;
      if (!AUTH.user) {
        renderLoginPage(document.getElementById('main'), location.hash, t('authExpired'));
      }
    }
  });
}

/* ---------- Global events and boot ---------- */
  function bindGlobalEvents() {
    document.querySelector('.skip-link')?.addEventListener('click', event => {
      event.preventDefault();
      const main = document.getElementById('main');
      if (!main) return;
      main.focus();
      main.scrollIntoView({ block: 'start' });
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('language-select')?.addEventListener('change', event => {
      setLanguage(event.target.value);
    });

    const menuButton = document.getElementById('menu-toggle');
    menuButton?.addEventListener('click', () => {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    document.querySelectorAll('.primary-nav a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setMenu(false);
        closeHomeResults();
      }
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target;
        const typing = target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
        if (!typing && state.route?.view === 'home') {
          const search = document.getElementById('home-search');
          if (search) {
            event.preventDefault();
            search.focus();
          }
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 880) setMenu(false);
    });

    window.addEventListener('hashchange', () => renderCurrentRoute({ focus: true, scroll: true }));

    document.getElementById('compare-clear')?.addEventListener('click', () => {
      state.compareKeys = [];
      persistCompare();
      renderCompareTray();
      showToast(t('toastCleared'));
      if (state.route?.view === 'list') refreshCompareButtons();
      if (state.route?.view === 'detail') syncDetailCompareButton();
    });

    document.getElementById('compare-go')?.addEventListener('click', () => {
      if (state.compareKeys.length < 2) {
        showToast(t('toastNeedTwo'));
        return;
      }
      const [left, right] = state.compareKeys;
      navigateTo(`#/compare?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}`);
    });

    document.getElementById('compare-tray')?.addEventListener('click', event => {
      const remove = event.target.closest('[data-tray-remove]');
      if (!remove) return;
      removeFromCompare(remove.getAttribute('data-tray-remove'));
    });
  }

  async function init() {
    setTheme(state.theme, false);
    setLanguage(state.lang, false);
    bindGlobalEvents();
    await initAuth();
    await loadData();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
