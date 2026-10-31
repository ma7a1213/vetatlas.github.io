$salt = [Text.Encoding]::UTF8.GetBytes('VetAtlas-Admin-2026')
$kdf = New-Object System.Security.Cryptography.Rfc2898DeriveBytes('@Hunar2005', $salt, 120000)
$hash = [BitConverter]::ToString($kdf.GetBytes(32)).Replace('-', '').ToLowerInvariant()
Write-Output $hash
