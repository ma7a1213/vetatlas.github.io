# VetAtlas local server (Windows PowerShell 5.1+)
# Usage: right-click > Run with PowerShell, or:
#   powershell -ExecutionPolicy Bypass -File .\serve.ps1
# Then open http://localhost:8000
#
# Besides the static files, the server exposes a few small local endpoints used
# by the "Account", "Add disease" and "Edit disease" pages:
#   GET  /api/health                 -> { ok: true }
#   POST /api/login                  -> admin sign-in, returns a session token
#   POST /api/logout                 -> ends the current session
#   GET  /api/session                -> current admin session
#   POST /api/upload                 -> saves an image (admin only)
#   POST /api/diseases               -> appends a disease entry (admin only)
#   PUT  /api/diseases/{animal}/{id} -> edits a disease entry (admin only)
#
# The administrator password is not stored in this file. Only a PBKDF2-SHA256
# hash is kept below; see README.md for how to change the password.

param([int]$Port = 8000)

$root = [IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$rootPrefix = $root.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$dataPath = Join-Path $root 'data.json'
$imagesDir = Join-Path $root 'images'
$backupPath = Join-Path $root 'data.bak.json'
$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$utf8 = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path -LiteralPath $imagesDir)) {
  New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
}

try {
  $listener.Start()
} catch {
  Write-Host "Could not start the server on port $Port." -ForegroundColor Red
  Write-Host "Try another port: powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 8080"
  Write-Host $_.Exception.Message
  exit 1
}

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.gif'  = 'image/gif'
  '.ico'  = 'image/x-icon'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
}

# ---------------------------------------------------------------- API helpers

function Send-Json {
  param($response, [int]$status, $payload)
  try {
    $text = $payload | ConvertTo-Json -Depth 12 -Compress
  } catch {
    $text = '{"ok":false}'
  }
  $bytes = $utf8.GetBytes($text)
  $response.StatusCode = $status
  $response.ContentType = 'application/json; charset=utf-8'
  $response.Headers['Cache-Control'] = 'no-store'
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Send-Pdf {
  param($response, [byte[]]$bytes, [string]$filename)
  $response.StatusCode = 200
  $response.ContentType = 'application/pdf'
  $response.Headers['Cache-Control'] = 'no-store'
  $response.Headers['Content-Disposition'] = 'attachment; filename="' + $filename + '"'
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function ConvertTo-PdfText {
  param([string]$value)
  if ($null -eq $value) { return '' }
  $text = [string]$value
  $text = $text.Replace([char]0x2013, '-').Replace([char]0x2014, '-').Replace([char]0x2019, "'")
  $text = $text.Replace([char]0x00B0, '-').Replace([char]0x2022, '-').Replace([char]0x2026, '.')
  $normalized = $text.Normalize([Text.NormalizationForm]::FormD)
  $builder = New-Object Text.StringBuilder
  foreach ($character in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($character)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) { [void]$builder.Append($character) }
  }
  $ascii = $builder.ToString().Normalize([Text.NormalizationForm]::FormC)
  return [Regex]::Replace($ascii, '[^\x20-\x7E\r\n\t]', '?')
}

function Wrap-PdfLine {
  param([string]$value, [int]$width = 92)
  $value = ConvertTo-PdfText $value
  if ([string]::IsNullOrWhiteSpace($value)) { return @('') }
  $lines = New-Object Collections.Generic.List[string]
  foreach ($paragraph in $value.Replace("`r", '').Split("`n")) {
    $words = @([Regex]::Split($paragraph.Trim(), '\s+') | Where-Object { $_ })
    $current = ''
    foreach ($word in $words) {
      $candidate = if ($current) { $current + ' ' + $word } else { $word }
      if ($candidate.Length -le $width) {
        $current = $candidate
      } else {
        if ($current) { $lines.Add($current) }
        $current = $word
        while ($current.Length -gt $width) {
          $lines.Add($current.Substring(0, $width))
          $current = $current.Substring($width)
        }
      }
    }
    if ($current) { $lines.Add($current) }
    if ([string]::IsNullOrEmpty($current)) { $lines.Add('') }
  }
  return $lines
}

function New-DiseasePdf {
  param($disease)
  $lines = New-Object Collections.Generic.List[string]
  $addText = { param([string]$heading, $content)
    if ($heading) { $lines.Add($heading) }
    if ($content -is [System.Collections.IEnumerable] -and $content -isnot [string]) {
      foreach ($item in $content) { foreach ($line in (Wrap-PdfLine ('- ' + [string]$item))) { $lines.Add($line) } }
    } else {
      foreach ($line in (Wrap-PdfLine ([string]$content))) { $lines.Add($line) }
    }
    $lines.Add('')
  }
  $name = $disease.id
  if ($disease.name.en) { $name = $disease.name.en }
  $summary = ''
  if ($disease.summary.en) { $summary = $disease.summary.en }
  $lines.Add("VetAtlas - Disease Reference")
  $lines.Add('')
  & $addText $name $summary
  & $addText 'Animal' $disease.animal
  & $addText 'Disease type' $disease.type
  & $addText 'Severity' $disease.severity
  & $addText 'Causative agent' $disease.causativeAgent
  & $addText 'Affected animals and age' $disease.affected
  & $addText 'Symptoms' $disease.symptoms
  & $addText 'Diagnosis' $disease.diagnosis
  & $addText 'Post-mortem examination' $disease.postMortem
  & $addText 'Treatment' $disease.treatment
  & $addText 'Prevention and vaccination' $disease.prevention
  $zoonoticText = 'No.'
  if ($disease.zoonotic) { $zoonoticText = 'Yes. ' + $disease.zoonoticNote }
  & $addText 'Zoonotic risk' $zoonoticText
  $notifiableText = 'No.'
  if ($disease.notifiable) { $notifiableText = 'Yes. ' + $disease.notifiableNote }
  & $addText 'Notifiable / reportable' $notifiableText
  $meatText = 'Not safe without official approval. ' + $disease.meatNote
  if ($disease.meatSafe) { $meatText = 'Safe only after official inspection and applicable withdrawal periods. ' + $disease.meatNote }
  & $addText 'Meat safety' $meatText
  $lines.Add('Educational reference only. Consult a licensed veterinarian.')

  $pageSize = 46
  $pageLines = @()
  for ($i = 0; $i -lt $lines.Count; $i += $pageSize) {
    $pageLines += ,@($lines | Select-Object -Skip $i -First $pageSize)
  }
  if ($pageLines.Count -eq 0) { $pageLines = @(,@('VetAtlas')) }

  $objects = New-Object Collections.Generic.List[string]
  $objects.Add('<< /Type /Catalog /Pages 2 0 R >>')
  $kids = ($pageLines.Count | ForEach-Object { for ($p = 0; $p -lt $_; $p++) { (4 + ($p * 2)) } }) -join ' '
  $objects.Add(('<< /Type /Pages /Kids [' + $kids + '] /Count ' + $pageLines.Count + ' >>'))
  $objects.Add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

  foreach ($page in $pageLines) {
    $pageNumber = $pageLines.IndexOf($page) + 1
    $pageObject = 4 + (($pageNumber - 1) * 2)
    $contentObject = $pageObject + 1
    $objects.Add(('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' + $contentObject + ' 0 R >>'))
    $content = New-Object Text.StringBuilder
    [void]$content.Append("BT /F1 11 Tf 40 790 Td 16 TL\n")
    foreach ($line in $page) {
      $pdfLine = ([string]$line).Replace('\', '\\').Replace('(', '\(').Replace(')', '\)')
      [void]$content.Append("(").Append($pdfLine).Append(") Tj T*")
    }
    [void]$content.Append(" ET")
    $stream = $content.ToString()
    $objects.Add(('<< /Length ' + ([Text.Encoding]::ASCII.GetByteCount($stream)) + ' >>' + "`nstream`n" + $stream + "`nendstream"))
  }

  $newline = "`n"
  $pdf = New-Object Text.StringBuilder
  [void]$pdf.Append('%PDF-1.4').Append($newline)
  $offsets = New-Object Collections.Generic.List[int]
  for ($index = 0; $index -lt $objects.Count; $index++) {
    $offsets.Add([Text.Encoding]::ASCII.GetByteCount($pdf.ToString()))
    [void]$pdf.Append($index + 1).Append(' 0 obj').Append($newline)
    [void]$pdf.Append($objects[$index]).Append($newline).Append('endobj').Append($newline)
  }
  $xrefOffset = [Text.Encoding]::ASCII.GetByteCount($pdf.ToString())
  [void]$pdf.Append('xref').Append($newline).Append('0 ').Append($objects.Count + 1).Append($newline)
  [void]$pdf.Append('0000000000 65535 f ').Append($newline)
  foreach ($offset in $offsets) {
    [void]$pdf.Append(('{0:D10} 00000 n ' -f $offset)).Append($newline)
  }
  [void]$pdf.Append('trailer').Append($newline)
  [void]$pdf.Append('<< /Size ').Append($objects.Count + 1).Append(' /Root 1 0 R >>').Append($newline)
  [void]$pdf.Append('startxref').Append($newline).Append($xrefOffset).Append($newline).Append('%%EOF')
  return [Text.Encoding]::ASCII.GetBytes($pdf.ToString())
}

function Read-RequestBody {
  param($request, [int]$limitBytes)
  $length = [int]$request.ContentLength64
  if ($length -le 0) { throw 'VALIDATION:The request body is empty.' }
  if ($length -gt $limitBytes) { throw 'VALIDATION:The request body is too large.' }
  $buffer = New-Object byte[] $length
  $offset = 0
  while ($offset -lt $length) {
    $read = $request.InputStream.Read($buffer, $offset, $length - $offset)
    if ($read -le 0) { break }
    $offset += $read
  }
  if ($offset -eq 0) { throw 'VALIDATION:The request body is empty.' }
  return $utf8.GetString($buffer, 0, $offset)
}

# ---------------------------------------------------------------- Admin auth

# One administrator account. Only the PBKDF2 hash is stored here, never the
# password itself. To change it, run the snippet documented in README.md and
# replace $adminHash with the printed value.
$adminUser = 'admin'
$adminSalt = 'VetAtlas-Admin-2026'
$adminHash = 'eb1bc2ef448ddbd0fbab98f74871c525f3759f8040cba75c7a6e6f3afe654969'
$sessionHours = 8
$sessions = @{}
$loginAttempts = @{}

function Get-PasswordHash {
  param([string]$password)
  $salt = [Text.Encoding]::UTF8.GetBytes($adminSalt)
  $kdf = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($password, $salt, 120000)
  try {
    return [BitConverter]::ToString($kdf.GetBytes(32)).Replace('-', '').ToLowerInvariant()
  } finally {
    $kdf.Dispose()
  }
}

function Test-HashMatch {
  param([string]$left, [string]$right)
  if ($left.Length -ne $right.Length) { return $false }
  $diff = 0
  for ($i = 0; $i -lt $left.Length; $i++) {
    $diff = $diff -bor ([int]$left[$i] -bxor [int]$right[$i])
  }
  return ($diff -eq 0)
}

function New-AdminSession {
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  $token = ([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
  $sessions[$token] = [DateTime]::UtcNow.AddHours($sessionHours)
  return $token
}

function Get-BearerToken {
  param($request)
  $header = $request.Headers['Authorization']
  if ($header -and $header -match '^\s*Bearer\s+([A-Za-z0-9]+)\s*$') { return $Matches[1] }
  $alternate = $request.Headers['X-Admin-Token']
  if ($alternate) { return $alternate.Trim() }
  return ''
}

function Get-AdminSession {
  param($request)
  $token = Get-BearerToken $request
  if (-not $token) { return $null }
  if (-not $sessions.ContainsKey($token)) { return $null }
  if ($sessions[$token] -lt [DateTime]::UtcNow) {
    $sessions.Remove($token)
    return $null
  }
  # Sliding expiration: every authorised request extends the session.
  $sessions[$token] = [DateTime]::UtcNow.AddHours($sessionHours)
  return [pscustomobject]@{
    Token = $token
    User = $adminUser
    Expires = $sessions[$token]
  }
}

function Require-Admin {
  param($request)
  $session = Get-AdminSession $request
  if (-not $session) { throw 'AUTH:Sign in as the administrator to do that.' }
  return $session
}

function Test-LoginBlocked {
  param([string]$key)
  if (-not $loginAttempts.ContainsKey($key)) { return $false }
  return ($loginAttempts[$key].BlockedUntil -gt [DateTime]::UtcNow)
}

function Register-LoginFailure {
  param([string]$key)
  $now = [DateTime]::UtcNow
  $entry = if ($loginAttempts.ContainsKey($key)) {
    $loginAttempts[$key]
  } else {
    @{ Count = 0; WindowStart = $now; BlockedUntil = $now }
  }
  if (($now - $entry.WindowStart).TotalMinutes -ge 10) {
    $entry.Count = 0
    $entry.WindowStart = $now
  }
  $entry.Count = $entry.Count + 1
  if ($entry.Count -ge 5) {
    $entry.BlockedUntil = $now.AddSeconds(60)
    $entry.Count = 0
  }
  $loginAttempts[$key] = $entry
}

function Get-TextValue {
  param($obj, [string]$name)
  if ($null -eq $obj) { return '' }
  $prop = $obj.PSObject.Properties[$name]
  if ($null -eq $prop -or $null -eq $prop.Value) { return '' }
  return ([string]$prop.Value).Trim()
}

function Get-BoolValue {
  param($obj, [string]$name)
  if ($null -eq $obj) { return $null }
  $prop = $obj.PSObject.Properties[$name]
  if ($null -eq $prop -or $null -eq $prop.Value) { return $null }
  if ($prop.Value -is [bool]) { return $prop.Value }
  $text = ([string]$prop.Value).Trim().ToLowerInvariant()
  if ($text -eq 'true' -or $text -eq 'yes') { return $true }
  if ($text -eq 'false' -or $text -eq 'no') { return $false }
  return $null
}

function Get-ImageExtension {
  param([byte[]]$bytes)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) { return '.jpg' }
  if ($bytes.Length -ge 8 -and $bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) { return '.png' }
  if ($bytes.Length -ge 6 -and $bytes[0] -eq 0x47 -and $bytes[1] -eq 0x49 -and $bytes[2] -eq 0x46) { return '.gif' }
  if ($bytes.Length -ge 12 -and $bytes[0] -eq 0x52 -and $bytes[1] -eq 0x49 -and $bytes[2] -eq 0x46 -and $bytes[3] -eq 0x46 -and
      $bytes[8] -eq 0x57 -and $bytes[9] -eq 0x45 -and $bytes[10] -eq 0x42 -and $bytes[11] -eq 0x50) { return '.webp' }
  return $null
}

function ConvertTo-JsonString {
  param([string]$value)
  if ($null -eq $value) { return '""' }
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('"')
  foreach ($ch in $value.ToCharArray()) {
    $code = [int]$ch
    if ($ch -eq '"') { [void]$sb.Append('\"') }
    elseif ($ch -eq '\') { [void]$sb.Append('\\') }
    elseif ($code -eq 8) { [void]$sb.Append('\b') }
    elseif ($code -eq 9) { [void]$sb.Append('\t') }
    elseif ($code -eq 10) { [void]$sb.Append('\n') }
    elseif ($code -eq 12) { [void]$sb.Append('\f') }
    elseif ($code -eq 13) { [void]$sb.Append('\r') }
    elseif ($code -lt 32) { [void]$sb.Append(('\u{0:x4}' -f $code)) }
    else { [void]$sb.Append($ch) }
  }
  [void]$sb.Append('"')
  return $sb.ToString()
}

function Add-JsonArrayProperty {
  param($lines, [string]$key, $values, [int]$indent)
  $pad = ' ' * $indent
  $items = @($values)
  if ($items.Count -eq 0) {
    $lines.Add($pad + '"' + $key + '": [],')
    return
  }
  $lines.Add($pad + '"' + $key + '": [')
  for ($i = 0; $i -lt $items.Count; $i++) {
    $suffix = if ($i -lt $items.Count - 1) { ',' } else { '' }
    $lines.Add($pad + '  ' + (ConvertTo-JsonString ([string]$items[$i])) + $suffix)
  }
  $lines.Add($pad + '],')
}

function Get-JsonBool {
  param($value)
  if ($value) { return 'true' }
  return 'false'
}

function Get-Slug {
  param([string]$text)
  $slug = $text.ToLowerInvariant()
  $slug = [regex]::Replace($slug, '[^a-z0-9]+', '-').Trim('-')
  if ($slug.Length -gt 60) { $slug = $slug.Substring(0, 60).Trim('-') }
  if ([string]::IsNullOrWhiteSpace($slug)) { $slug = 'disease' }
  return $slug
}

function Save-UploadedImage {
  param($payload)
  $raw = Get-TextValue $payload 'data'
  if ([string]::IsNullOrWhiteSpace($raw)) { throw 'VALIDATION:No image data was received.' }
  if ($raw -match '^data:[^,]*;base64,') { $raw = $raw.Substring($raw.IndexOf(',') + 1) }
  $raw = $raw -replace '\s', ''
  $bytes = $null
  try { $bytes = [Convert]::FromBase64String($raw) } catch { throw 'VALIDATION:The image data is not valid base64.' }
  if ($bytes.Length -eq 0) { throw 'VALIDATION:The image file is empty.' }
  if ($bytes.Length -gt 5MB) { throw 'VALIDATION:The photo is larger than 5 MB.' }
  $extension = Get-ImageExtension $bytes
  if (-not $extension) { throw 'VALIDATION:Use a JPG, PNG, WebP or GIF image.' }
  if (-not (Test-Path -LiteralPath $imagesDir)) { New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null }
  $name = 'disease-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + (Get-Random -Minimum 1000 -Maximum 9999) + $extension
  $full = Join-Path $imagesDir $name
  [IO.File]::WriteAllBytes($full, $bytes)
  Write-Host ("  Saved image: images/" + $name) -ForegroundColor DarkGreen
  return [pscustomobject]@{ Path = "images/$name"; Bytes = $bytes.Length }
}

function Convert-DiseasePayload {
  param($body, $data)

  if ($null -eq $body) { throw 'VALIDATION:No disease data was received.' }
  $errors = New-Object System.Collections.Generic.List[string]

  $animal = (Get-TextValue $body 'animal').ToLowerInvariant()
  $animalIds = @($data.animals | ForEach-Object { $_.id })
  if ($animalIds -notcontains $animal) { $errors.Add('Choose a valid animal.') }

  $nameEn = Get-TextValue $body.name 'en'
  $nameKu = Get-TextValue $body.name 'ku'
  $nameAr = Get-TextValue $body.name 'ar'
  $summaryEn = Get-TextValue $body.summary 'en'
  $summaryKu = Get-TextValue $body.summary 'ku'
  $summaryAr = Get-TextValue $body.summary 'ar'
  if (-not $nameEn) { $errors.Add('The English disease name is required.') }
  if (-not $summaryEn) { $errors.Add('The English summary is required.') }
  if ($nameEn.Length -gt 160) { $errors.Add('The English name is too long.') }
  if (-not $nameKu) { $nameKu = $nameEn }
  if (-not $nameAr) { $nameAr = $nameEn }
  if (-not $summaryKu) { $summaryKu = $summaryEn }
  if (-not $summaryAr) { $summaryAr = $summaryEn }
  if ($summaryEn.Length -gt 1200) { $errors.Add('The summary is too long.') }

  $type = (Get-TextValue $body 'type').ToLowerInvariant()
  $typeIds = @($data.types | ForEach-Object { $_.id })
  if ($typeIds -notcontains $type) { $errors.Add('Choose a valid disease type.') }

  $severity = (Get-TextValue $body 'severity').ToLowerInvariant()
  $severityIds = @($data.severities | ForEach-Object { $_.id })
  if ($severityIds -notcontains $severity) { $errors.Add('Choose a valid severity.') }

  $systemIds = @($data.systems | ForEach-Object { $_.id })
  $systems = @($body.systems | ForEach-Object { ([string]$_).Trim() } | Where-Object { $_ } | Select-Object -Unique)
  if ($systems.Count -eq 0) { $errors.Add('Choose at least one body system.') }
  foreach ($system in $systems) {
    if ($systemIds -notcontains $system) { $errors.Add("Unknown body system: $system") }
  }

  $causativeAgent = Get-TextValue $body 'causativeAgent'
  $affected = Get-TextValue $body 'affected'
  $diagnosis = Get-TextValue $body 'diagnosis'
  $postMortem = Get-TextValue $body 'postMortem'
  $treatment = Get-TextValue $body 'treatment'
  $prevention = Get-TextValue $body 'prevention'
  if (-not $causativeAgent) { $errors.Add('The causative agent is required.') }
  if (-not $affected) { $errors.Add('The affected animals are required.') }
  if (-not $diagnosis) { $errors.Add('The diagnosis is required.') }
  if (-not $postMortem) { $errors.Add('The post-mortem findings are required.') }
  if (-not $treatment) { $errors.Add('The treatment is required.') }
  if (-not $prevention) { $errors.Add('The prevention is required.') }
  foreach ($pair in @(
    @('Causative agent', $causativeAgent), @('Affected animals', $affected), @('Diagnosis', $diagnosis),
    @('Post-mortem findings', $postMortem), @('Treatment', $treatment), @('Prevention', $prevention)
  )) {
    if ($pair[1].Length -gt 4000) { $errors.Add(($pair[0] + ' is too long.')) }
  }

  $symptoms = @($body.symptoms | ForEach-Object { ([string]$_).Trim() } | Where-Object { $_ })
  if ($symptoms.Count -eq 0) { $errors.Add('Add at least one symptom.') }
  if ($symptoms.Count -gt 40) { $errors.Add('Please list fewer than 40 symptoms.') }

  $catalogIds = @($data.symptomCatalog | ForEach-Object { $_.id })
  $symptomTags = @($body.symptomTags | ForEach-Object { ([string]$_).Trim() } | Where-Object { $_ } | Select-Object -Unique)
  if ($symptomTags.Count -eq 0) { $errors.Add('Choose at least one symptom-checker tag.') }
  foreach ($tag in $symptomTags) {
    if ($catalogIds -notcontains $tag) { $errors.Add("Unknown symptom tag: $tag") }
  }

  $zoonotic = Get-BoolValue $body 'zoonotic'
  $notifiable = Get-BoolValue $body 'notifiable'
  $meatSafe = Get-BoolValue $body 'meatSafe'
  if ($null -eq $zoonotic) { $errors.Add('Choose whether the disease is zoonotic.') }
  if ($null -eq $notifiable) { $errors.Add('Choose whether the disease is notifiable.') }
  if ($null -eq $meatSafe) { $errors.Add('Choose whether the meat is safe after inspection.') }

  $zoonoticNote = Get-TextValue $body 'zoonoticNote'
  $notifiableNote = Get-TextValue $body 'notifiableNote'
  $meatNote = Get-TextValue $body 'meatNote'
  if (-not $meatNote) { $errors.Add('The meat-safety note is required.') }
  foreach ($pair in @(
    @('Zoonotic note', $zoonoticNote), @('Reporting note', $notifiableNote), @('Meat-safety note', $meatNote)
  )) {
    if ($pair[1].Length -gt 2000) { $errors.Add(($pair[0] + ' is too long.')) }
  }

  $aliases = @($body.aliases | ForEach-Object { ([string]$_).Trim() } | Where-Object { $_ } | Select-Object -Unique)

  $image = Get-TextValue $body 'image'
  $imageAlt = Get-TextValue $body 'imageAlt'
  if ($image) {
    if ($image -notmatch '^images/[A-Za-z0-9._-]+$') { $errors.Add('The image path is invalid.') }
    elseif (-not (Test-Path -LiteralPath (Join-Path $root $image) -PathType Leaf)) { $errors.Add('The uploaded image could not be found.') }
  }
  if ($imageAlt.Length -gt 300) { $errors.Add('The photo description is too long.') }

  if ($errors.Count -gt 0) { throw ('VALIDATION:' + ($errors -join ' ')) }

  return [pscustomobject]@{
    Id = ''
    Animal = $animal
    NameEn = $nameEn
    NameKu = $nameKu
    NameAr = $nameAr
    SummaryEn = $summaryEn
    SummaryKu = $summaryKu
    SummaryAr = $summaryAr
    Aliases = $aliases
    Type = $type
    Systems = $systems
    Severity = $severity
    Zoonotic = $zoonotic
    ZoonoticNote = $zoonoticNote
    Notifiable = $notifiable
    NotifiableNote = $notifiableNote
    MeatSafe = $meatSafe
    MeatNote = $meatNote
    CausativeAgent = $causativeAgent
    Affected = $affected
    Symptoms = $symptoms
    SymptomTags = $symptomTags
    Diagnosis = $diagnosis
    PostMortem = $postMortem
    Treatment = $treatment
    Prevention = $prevention
    Image = $image
    ImageAlt = $imageAlt
  }
}

function Set-UpdatedDate {
  param([string]$raw)
  $pattern = New-Object System.Text.RegularExpressions.Regex('("updated"\s*:\s*")[^"]*(")')
  return $pattern.Replace($raw, '${1}' + (Get-Date -Format 'yyyy-MM-dd') + '${2}', 1)
}

function Save-DataJson {
  param([string]$newRaw, [int]$expectedCount)
  $tmp = Join-Path $root 'data.json.tmp'
  [IO.File]::WriteAllText($tmp, $newRaw, $utf8)
  try {
    $check = [IO.File]::ReadAllText($tmp) | ConvertFrom-Json
    if (@($check.diseases).Count -ne $expectedCount) {
      throw 'VALIDATION:The edited data file failed validation.'
    }
    try {
      [IO.File]::Replace($tmp, $dataPath, $backupPath)
    } catch {
      Copy-Item -LiteralPath $tmp -Destination $dataPath -Force
      Remove-Item -LiteralPath $tmp -Force
    }
    return $check
  } catch {
    if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }
    throw
  }
}

function Replace-DiseaseBlock {
  param([string]$raw, [string]$animal, [string]$id, [string]$entryText)

  $pattern = '(?m)^[ \t]*"id"[ \t]*:[ \t]*"' + [regex]::Escape($id) + '"[ \t]*,[ \t]*\r?\n[ \t]*"animal"[ \t]*:[ \t]*"' + [regex]::Escape($animal) + '"'
  $matches = [regex]::Matches($raw, $pattern)
  if ($matches.Count -eq 0) { throw 'NOTFOUND:That disease entry could not be found. It may have been removed.' }
  if ($matches.Count -gt 1) { throw 'VALIDATION:More than one entry matched that disease.' }

  $idIndex = $matches[0].Index
  $open = $raw.LastIndexOf('{', $idIndex)
  if ($open -lt 0) { throw 'data.json could not be parsed.' }
  $lineStart = $raw.LastIndexOf("`n", $open)
  $start = if ($lineStart -lt 0) { 0 } else { $lineStart + 1 }

  # Find the matching closing brace without being confused by strings.
  $depth = 0
  $inString = $false
  $escaped = $false
  $close = -1
  for ($i = $open; $i -lt $raw.Length; $i++) {
    $ch = $raw[$i]
    if ($inString) {
      if ($escaped) { $escaped = $false }
      elseif ($ch -eq '\') { $escaped = $true }
      elseif ($ch -eq '"') { $inString = $false }
      continue
    }
    if ($ch -eq '"') { $inString = $true }
    elseif ($ch -eq '{') { $depth = $depth + 1 }
    elseif ($ch -eq '}') {
      $depth = $depth - 1
      if ($depth -eq 0) { $close = $i; break }
    }
  }
  if ($close -lt 0) { throw 'data.json could not be parsed.' }

  return $raw.Substring(0, $start) + $entryText + $raw.Substring($close + 1)
}

function New-DiseaseEntryText {
  param($disease, [string]$nl)
  $entryLines = New-DiseaseEntryLines -body $null -id $disease.Id -nameEn $disease.NameEn -nameKu $disease.NameKu `
    -nameAr $disease.NameAr -summaryEn $disease.SummaryEn -summaryKu $disease.SummaryKu -summaryAr $disease.SummaryAr `
    -aliases $disease.Aliases -animal $disease.Animal -type $disease.Type -systems $disease.Systems `
    -severity $disease.Severity -zoonotic $disease.Zoonotic -zoonoticNote $disease.ZoonoticNote `
    -notifiable $disease.Notifiable -notifiableNote $disease.NotifiableNote -meatSafe $disease.MeatSafe `
    -meatNote $disease.MeatNote -causativeAgent $disease.CausativeAgent -affected $disease.Affected `
    -symptoms $disease.Symptoms -symptomTags $disease.SymptomTags -diagnosis $disease.Diagnosis `
    -postMortem $disease.PostMortem -treatment $disease.Treatment -prevention $disease.Prevention `
    -image $disease.Image -imageAlt $disease.ImageAlt
  return (($entryLines -join $nl).TrimEnd(',')) + $nl + '    }'
}

function Add-DiseaseEntry {
  param($body)

  $data = [IO.File]::ReadAllText($dataPath) | ConvertFrom-Json
  $disease = Convert-DiseasePayload $body $data

  # Unique id derived from the English name.
  $id = Get-Slug $disease.NameEn
  $used = @{}
  foreach ($existing in $data.diseases) { $used[$existing.id] = $true }
  if ($used.ContainsKey($id)) {
    $base = $id
    $counter = 2
    while ($used.ContainsKey($id)) { $id = "$base-$counter"; $counter++ }
  }
  $disease.Id = $id

  $raw = [IO.File]::ReadAllText($dataPath)
  $nl = if ($raw.Contains("`r`n")) { "`r`n" } else { "`n" }
  $entryText = New-DiseaseEntryText $disease $nl

  $close = $raw.LastIndexOf(']')
  if ($close -lt 0) { throw 'data.json does not contain a diseases array.' }
  $head = $raw.Substring(0, $close).TrimEnd()
  $tail = $raw.Substring($close)
  $comma = if ($head.EndsWith('[')) { '' } else { ',' }
  $newRaw = Set-UpdatedDate ($head + $comma + $nl + $entryText + $nl + '  ' + $tail)

  $saved = Save-DataJson $newRaw (@($data.diseases).Count + 1)
  $savedDisease = @($saved.diseases | Where-Object { $_.id -eq $id -and $_.animal -eq $disease.Animal }) | Select-Object -First 1

  Write-Host ("  Added disease: " + $id + " (" + $disease.Animal + ")") -ForegroundColor DarkGreen
  return [pscustomobject]@{
    Id = $id
    Animal = $disease.Animal
    Disease = $savedDisease
  }
}

function Update-DiseaseEntry {
  param([string]$animal, [string]$id, $body)

  $data = [IO.File]::ReadAllText($dataPath) | ConvertFrom-Json
  $existing = @($data.diseases | Where-Object { $_.animal -eq $animal -and $_.id -eq $id })
  if ($existing.Count -ne 1) {
    throw 'NOTFOUND:That disease entry could not be found. It may have been removed.'
  }

  $disease = Convert-DiseasePayload $body $data
  $disease.Id = $id

  if ($disease.Animal -ne $animal) {
    $conflict = @($data.diseases | Where-Object { $_.animal -eq $disease.Animal -and $_.id -eq $id })
    if ($conflict.Count -gt 0) {
      throw 'VALIDATION:Another entry already uses that ID for the selected animal.'
    }
  }

  $raw = [IO.File]::ReadAllText($dataPath)
  $nl = if ($raw.Contains("`r`n")) { "`r`n" } else { "`n" }
  $entryText = New-DiseaseEntryText $disease $nl
  $newRaw = Set-UpdatedDate (Replace-DiseaseBlock $raw $animal $id $entryText)

  $saved = Save-DataJson $newRaw (@($data.diseases).Count)
  $savedDisease = @($saved.diseases | Where-Object { $_.id -eq $id -and $_.animal -eq $disease.Animal }) | Select-Object -First 1

  Write-Host ("  Updated disease: " + $id + " (" + $animal + " -> " + $disease.Animal + ")") -ForegroundColor DarkGreen
  return [pscustomobject]@{
    Id = $id
    Animal = $disease.Animal
    Disease = $savedDisease
  }
}

function New-DiseaseEntryLines {
  param(
    $body, [string]$id, [string]$nameEn, [string]$nameKu, [string]$nameAr,
    [string]$summaryEn, [string]$summaryKu, [string]$summaryAr, $aliases,
    [string]$animal, [string]$type, $systems, [string]$severity,
    $zoonotic, [string]$zoonoticNote, $notifiable, [string]$notifiableNote,
    $meatSafe, [string]$meatNote, [string]$causativeAgent, [string]$affected,
    $symptoms, $symptomTags, [string]$diagnosis, [string]$postMortem,
    [string]$treatment, [string]$prevention, [string]$image, [string]$imageAlt
  )
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('    {')
  $lines.Add('      "id": ' + (ConvertTo-JsonString $id) + ',')
  $lines.Add('      "animal": ' + (ConvertTo-JsonString $animal) + ',')
  $lines.Add('      "name": {')
  $lines.Add('        "en": ' + (ConvertTo-JsonString $nameEn) + ',')
  $lines.Add('        "ku": ' + (ConvertTo-JsonString $nameKu) + ',')
  $lines.Add('        "ar": ' + (ConvertTo-JsonString $nameAr))
  $lines.Add('      },')
  $lines.Add('      "summary": {')
  $lines.Add('        "en": ' + (ConvertTo-JsonString $summaryEn) + ',')
  $lines.Add('        "ku": ' + (ConvertTo-JsonString $summaryKu) + ',')
  $lines.Add('        "ar": ' + (ConvertTo-JsonString $summaryAr))
  $lines.Add('      },')
  Add-JsonArrayProperty $lines 'aliases' $aliases 6
  $lines.Add('      "type": ' + (ConvertTo-JsonString $type) + ',')
  Add-JsonArrayProperty $lines 'systems' $systems 6
  $lines.Add('      "severity": ' + (ConvertTo-JsonString $severity) + ',')
  $lines.Add('      "zoonotic": ' + (Get-JsonBool $zoonotic) + ',')
  $lines.Add('      "zoonoticNote": ' + (ConvertTo-JsonString $zoonoticNote) + ',')
  $lines.Add('      "notifiable": ' + (Get-JsonBool $notifiable) + ',')
  $lines.Add('      "notifiableNote": ' + (ConvertTo-JsonString $notifiableNote) + ',')
  $lines.Add('      "meatSafe": ' + (Get-JsonBool $meatSafe) + ',')
  $lines.Add('      "meatNote": ' + (ConvertTo-JsonString $meatNote) + ',')
  $lines.Add('      "causativeAgent": ' + (ConvertTo-JsonString $causativeAgent) + ',')
  $lines.Add('      "affected": ' + (ConvertTo-JsonString $affected) + ',')
  Add-JsonArrayProperty $lines 'symptoms' $symptoms 6
  Add-JsonArrayProperty $lines 'symptomTags' $symptomTags 6
  $lines.Add('      "diagnosis": ' + (ConvertTo-JsonString $diagnosis) + ',')
  $lines.Add('      "postMortem": ' + (ConvertTo-JsonString $postMortem) + ',')
  $lines.Add('      "treatment": ' + (ConvertTo-JsonString $treatment) + ',')
  $lines.Add('      "prevention": ' + (ConvertTo-JsonString $prevention) + ',')
  if ($image) {
    $lines.Add('      "image": ' + (ConvertTo-JsonString $image) + ',')
    if ($imageAlt) { $lines.Add('      "imageAlt": ' + (ConvertTo-JsonString $imageAlt) + ',') }
  }
  return $lines
}

# ---------------------------------------------------------------- HTTP loop

Write-Host ""
Write-Host "  VetAtlas is running at $prefix" -ForegroundColor Green
Write-Host "  Admin sign-in at ${prefix}index.html#/account"
Write-Host "  Press Ctrl+C to stop."
Write-Host ""

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $localPath = [Uri]::UnescapeDataString($request.Url.LocalPath)
    $method = $request.HttpMethod.ToUpperInvariant()

    if ($localPath.StartsWith('/api/')) {
      try {
        if ($localPath -eq '/api/health') {
          if ($method -ne 'GET') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else { Send-Json $response 200 @{ ok = $true; service = 'vetatlas'; port = $Port; auth = 'admin' } }
        }
        elseif ($localPath -eq '/api/login') {
          if ($method -ne 'POST') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else {
            $client = [string]$request.RemoteEndPoint
            if (Test-LoginBlocked $client) {
              throw 'THROTTLE:Too many failed sign-in attempts. Wait a minute and try again.'
            }
            $bodyText = Read-RequestBody $request 8KB
            $payload = $bodyText | ConvertFrom-Json
            $user = Get-TextValue $payload 'username'
            $passProperty = $payload.PSObject.Properties['password']
            $pass = if ($passProperty -and $null -ne $passProperty.Value) { [string]$passProperty.Value } else { '' }
            $valid = ($user -eq $adminUser) -and ($pass.Length -le 200) -and (Test-HashMatch (Get-PasswordHash $pass) $adminHash)
            if (-not $valid) {
              Register-LoginFailure $client
              Start-Sleep -Milliseconds 350
              throw 'AUTH:Incorrect username or password.'
            }
            $loginAttempts.Remove($client)
            $token = New-AdminSession
            Write-Host ("  Admin signed in from " + $client) -ForegroundColor DarkGreen
            Send-Json $response 200 @{ ok = $true; token = $token; user = $adminUser; expiresAt = $sessions[$token].ToString('o') }
          }
        }
        elseif ($localPath -eq '/api/logout') {
          if ($method -ne 'POST') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else {
            $token = Get-BearerToken $request
            if ($token -and $sessions.ContainsKey($token)) { $sessions.Remove($token) }
            Send-Json $response 200 @{ ok = $true }
          }
        }
        elseif ($localPath -eq '/api/session') {
          if ($method -ne 'GET') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else {
            $session = Get-AdminSession $request
            if ($session) {
              Send-Json $response 200 @{ ok = $true; user = $session.User; expiresAt = $session.Expires.ToString('o') }
            } else {
              Send-Json $response 401 @{ error = 'Not signed in.'; code = 'unauthorized' }
            }
          }
        }
        elseif ($localPath -eq '/api/upload') {
          if ($method -ne 'POST') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else {
            Require-Admin $request | Out-Null
            $bodyText = Read-RequestBody $request 10MB
            $payload = $bodyText | ConvertFrom-Json
            $saved = Save-UploadedImage $payload
            Send-Json $response 200 @{ ok = $true; path = $saved.Path; bytes = $saved.Bytes }
          }
        }
        elseif ($localPath -eq '/api/animals') {
          if ($method -ne 'POST') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else {
            Require-Admin $request | Out-Null
            $bodyText = Read-RequestBody $request 8KB
            $payload = $bodyText | ConvertFrom-Json
            $en = Get-TextValue $payload 'en'
            $ku = Get-TextValue $payload 'ku'
            $ar = Get-TextValue $payload 'ar'
            if (-not $en) { throw 'VALIDATION:The English animal name is required.' }
            if ($en.Length -gt 80) { throw 'VALIDATION:The animal name is too long.' }
            if (-not $ku) { $ku = $en }
            if (-not $ar) { $ar = $en }
            $id = (($en.ToLowerInvariant() -replace '[^a-z0-9]+', '-') -replace '^-|-$', '')
            if (-not $id) { throw 'VALIDATION:The animal name must contain letters or numbers.' }
            $data = Get-Content -LiteralPath $dataPath -Raw | ConvertFrom-Json
            if (@($data.animals | Where-Object { $_.id -eq $id }).Count -gt 0) { throw 'VALIDATION:That animal already exists.' }
            $data.animals += [pscustomobject]@{ id = $id; en = $en; ku = $ku; ar = $ar }
            $jsonText = $data | ConvertTo-Json -Depth 100
            [IO.File]::Copy($dataPath, $backupPath, $true)
            [IO.File]::WriteAllText($dataPath, $jsonText + "`n", $utf8)
            Send-Json $response 201 @{ ok = $true; animal = [pscustomobject]@{ id = $id; en = $en; ku = $ku; ar = $ar } }
          }
        }
        elseif ($localPath -eq '/api/diseases') {
          if ($method -ne 'POST') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else {
            Require-Admin $request | Out-Null
            $bodyText = Read-RequestBody $request 2MB
            $payload = $bodyText | ConvertFrom-Json
            $created = Add-DiseaseEntry $payload
            Send-Json $response 201 @{ ok = $true; id = $created.Id; animal = $created.Animal; disease = $created.Disease }
          }
        }
        elseif ($localPath -match '^/api/diseases/(cattle|sheep)/([A-Za-z0-9._-]+)/pdf$') {
          $routeAnimal = $Matches[1]
          $routeId = $Matches[2]
          if ($method -ne 'GET') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else {
            $data = Get-Content -LiteralPath $dataPath -Raw | ConvertFrom-Json
            $disease = @($data.diseases | Where-Object { $_.animal -eq $routeAnimal -and $_.id -eq $routeId }) | Select-Object -First 1
            if (-not $disease) { throw 'NOTFOUND:Disease entry was not found.' }
            $pdfBytes = New-DiseasePdf $disease
            $filename = (($disease.name.en -replace '[^A-Za-z0-9]+', '-').Trim('-').ToLowerInvariant()) + '.pdf'
            Send-Pdf $response $pdfBytes $filename
          }
        }
        elseif ($localPath -match '^/api/diseases/([A-Za-z0-9._-]+)/([A-Za-z0-9._-]+)$') {
          $routeAnimal = $Matches[1]
          $routeId = $Matches[2]
          if ($method -ne 'PUT') { Send-Json $response 405 @{ error = 'Method not allowed.' } }
          else {
            Require-Admin $request | Out-Null
            $bodyText = Read-RequestBody $request 2MB
            $payload = $bodyText | ConvertFrom-Json
            $updated = Update-DiseaseEntry $routeAnimal $routeId $payload
            Send-Json $response 200 @{ ok = $true; id = $updated.Id; animal = $updated.Animal; disease = $updated.Disease }
          }
        }
        else {
          Send-Json $response 404 @{ error = 'Unknown API endpoint.' }
        }
      } catch {
        $message = $_.Exception.Message
        if ($message -like 'AUTH:*') {
          Send-Json $response 401 @{ error = $message.Substring(5); code = 'unauthorized' }
        } elseif ($message -like 'THROTTLE:*') {
          Send-Json $response 429 @{ error = $message.Substring(9); code = 'throttled' }
        } elseif ($message -like 'VALIDATION:*') {
          Send-Json $response 400 @{ error = $message.Substring(11) }
        } elseif ($message -like 'NOTFOUND:*') {
          Send-Json $response 404 @{ error = $message.Substring(9) }
        } else {
          Write-Host ("  API error: " + $message) -ForegroundColor Red
          Send-Json $response 500 @{ error = 'The server could not complete that request.' }
        }
      }
      try { $response.OutputStream.Close(); $response.Close() } catch { }
      continue
    }

    try {
      $relative = $localPath.TrimStart('/')
      if (-not $relative) { $relative = 'index.html' }
      $full = [IO.Path]::GetFullPath((Join-Path $root $relative))

      if (-not $full.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -or
          -not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $response.StatusCode = 404
        $body = [Text.Encoding]::UTF8.GetBytes('Not found')
        $response.ContentType = 'text/plain; charset=utf-8'
      } else {
        $response.StatusCode = 200
        $extension = [IO.Path]::GetExtension($full).ToLowerInvariant()
        $response.ContentType = if ($mime.ContainsKey($extension)) { $mime[$extension] } else { 'application/octet-stream' }
        $body = [IO.File]::ReadAllBytes($full)
      }

      $response.Headers['Cache-Control'] = 'no-store'
      $response.ContentLength64 = $body.Length
      $response.OutputStream.Write($body, 0, $body.Length)
    } catch {
      try { $response.StatusCode = 500 } catch { }
    } finally {
      $response.OutputStream.Close()
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
