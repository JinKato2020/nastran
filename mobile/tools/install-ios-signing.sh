#!/usr/bin/env bash
set -euo pipefail
umask 077
SIGNING_DIR="$RUNNER_TEMP/nastran-signing"
KEYCHAIN_PATH="$SIGNING_DIR/build.keychain-db"
mkdir -p "$SIGNING_DIR"
echo "SIGNING_DIR=$SIGNING_DIR" >> "$GITHUB_ENV"
echo "KEYCHAIN_PATH=$KEYCHAIN_PATH" >> "$GITHUB_ENV"
export SIGNING_DIR
python3 - <<'PY'
import base64,os
from pathlib import Path
for key,name in [('IOS_DIST_CERT_BASE64','cert.p12'),('IOS_PROVISIONING_PROFILE_NASTRAN_BASE64','profile.mobileprovision')]:
    raw=''.join(os.environ[key].split())
    Path(os.environ['SIGNING_DIR'],name).write_bytes(base64.b64decode(raw,validate=True))
PY
security cms -D -i "$SIGNING_DIR/profile.mobileprovision" > "$SIGNING_DIR/profile.plist"
python3 - <<'PY'
import os,plistlib,datetime
from pathlib import Path
folder=Path(os.environ['SIGNING_DIR']);p=plistlib.loads((folder/'profile.plist').read_bytes())
bundle='com.safa.nastran';team=os.environ['IOS_TEAM_ID'].strip();ent=p['Entitlements']
assert team in p['TeamIdentifier'],'Provisioning profile belongs to a different team'
assert ent['application-identifier'] in [prefix+'.'+bundle for prefix in p['ApplicationIdentifierPrefix']],'Wrong bundle ID in profile'
assert not ent.get('get-task-allow') and not p.get('ProvisionedDevices') and not p.get('ProvisionsAllDevices'),'App Store profile required'
assert p['ExpirationDate']>datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None),'Expired profile'
with open(os.environ['GITHUB_ENV'],'a') as f:f.write('PROFILE_UUID='+p['UUID']+'\n')
options={'method':'app-store-connect','teamID':team,'signingStyle':'manual','provisioningProfiles':{bundle:p['UUID']},'uploadSymbols':True,'stripSwiftSymbols':True,'manageAppVersionAndBuildNumber':False}
(folder/'ExportOptions.plist').write_bytes(plistlib.dumps(options))
PY
PROFILE_UUID=$(/usr/libexec/PlistBuddy -c 'Print UUID' "$SIGNING_DIR/profile.plist")
KEYCHAIN_PASSWORD=$(openssl rand -hex 24)
echo "::add-mask::$KEYCHAIN_PASSWORD"
security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security import "$SIGNING_DIR/cert.p12" -k "$KEYCHAIN_PATH" -P "$IOS_DIST_CERT_PASSWORD" -t cert -f pkcs12 -A
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security list-keychains -d user -s "$KEYCHAIN_PATH" "$HOME/Library/Keychains/login.keychain-db"
for location in "$HOME/Library/MobileDevice/Provisioning Profiles" "$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles"; do
  mkdir -p "$location"
  cp "$SIGNING_DIR/profile.mobileprovision" "$location/$PROFILE_UUID.mobileprovision"
done
rm "$SIGNING_DIR/cert.p12"
