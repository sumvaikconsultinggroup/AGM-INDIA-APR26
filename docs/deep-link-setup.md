# Deep Link Setup Checklist

The repository now includes baseline deep-link configuration for:

1. User app (`swamiavdheshanand`) with `www.avdheshanandg.org`
2. Admin app (`swamijiadmin`) with `admin.avdheshanandg.org`

Before production launch, replace placeholders in:

1. `website/public/.well-known/assetlinks.json`
2. `website/public/.well-known/apple-app-site-association`
3. `dashboard-next/public/.well-known/assetlinks.json`
4. `dashboard-next/public/.well-known/apple-app-site-association`

Required values:

1. Android SHA-256 signing certificate fingerprint
2. Apple Team ID + final iOS bundle identifiers

Validation commands:

1. `curl https://www.avdheshanandg.org/.well-known/assetlinks.json`
2. `curl https://www.avdheshanandg.org/.well-known/apple-app-site-association`
3. `curl https://admin.avdheshanandg.org/.well-known/assetlinks.json`
4. `curl https://admin.avdheshanandg.org/.well-known/apple-app-site-association`
