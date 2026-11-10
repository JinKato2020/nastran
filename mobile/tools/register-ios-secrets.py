"""Verify existing Apple signing material; optionally register Nastran GitHub secrets.

Secret values are read from the supplied directory, kept in memory, and sent on
stdin to gh. This script never logs keys, passwords, JWTs or profile contents.
Requires Python cryptography and an authenticated GitHub CLI.
"""
import argparse, base64, datetime, hashlib, json, plistlib, subprocess, time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlencode, urlparse
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils
from cryptography.hazmat.primitives.serialization import pkcs12

REPO='JinKato2020/nastran'
BUNDLE='com.safa.nastran'
APP_ID='6816586481'
API='https://api.appstoreconnect.apple.com'
NAMES=['IOS_DIST_CERT_BASE64','IOS_DIST_CERT_PASSWORD','IOS_TEAM_ID',
       'APP_STORE_CONNECT_KEY_ID','APP_STORE_CONNECT_ISSUER_ID','APP_STORE_CONNECT_API_KEY_BASE64']

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--secrets-dir',required=True,type=Path)
    parser.add_argument('--register',action='store_true',help='Create a matching profile if needed and register GitHub secrets.')
    args=parser.parse_args()
    secrets={name:(args.secrets_dir/(name+'.txt')).read_text(encoding='utf-8-sig').strip() for name in NAMES}
    if not all(secrets.values()):raise ValueError('A required secret file is empty.')
    decode=lambda s:base64.b64decode(''.join(s.split()),validate=True)
    private,cert,_=pkcs12.load_key_and_certificates(decode(secrets['IOS_DIST_CERT_BASE64']),secrets['IOS_DIST_CERT_PASSWORD'].encode())
    if private is None or cert is None:raise ValueError('The distribution certificate must include its private key.')
    now=datetime.datetime.now(datetime.timezone.utc)
    if not cert.not_valid_before_utc<=now<cert.not_valid_after_utc:raise ValueError('Distribution certificate is not currently valid.')
    fingerprint=cert.fingerprint(hashes.SHA256())
    key=serialization.load_pem_private_key(decode(secrets['APP_STORE_CONNECT_API_KEY_BASE64']),password=None)
    b64=lambda b:base64.urlsafe_b64encode(b).rstrip(b'=')
    head=b64(json.dumps({'alg':'ES256','kid':secrets['APP_STORE_CONNECT_KEY_ID'],'typ':'JWT'},separators=(',',':')).encode())
    body=b64(json.dumps({'iss':secrets['APP_STORE_CONNECT_ISSUER_ID'],'iat':int(time.time()),'exp':int(time.time())+900,'aud':'appstoreconnect-v1'},separators=(',',':')).encode())
    signing=head+b'.'+body
    r,s=utils.decode_dss_signature(key.sign(signing,ec.ECDSA(hashes.SHA256())))
    token=(signing+b'.'+b64(r.to_bytes(32,'big')+s.to_bytes(32,'big'))).decode()
    def api(path,payload=None):
        url=path if path.startswith('https://') else API+path
        if urlparse(url).netloc!='api.appstoreconnect.apple.com':raise ValueError('Unexpected Apple API host.')
        data=json.dumps(payload).encode() if payload is not None else None
        request=Request(url,data=data,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
        try:
            with urlopen(request,timeout=45) as response:return json.load(response)
        except HTTPError as e:
            # Do not include arbitrary server responses in a credential-handling log.
            raise RuntimeError(f'Apple API returned HTTP {e.code} for {urlparse(url).path}') from None
    def rows(path):
        result=[]
        while path:
            response=api(path);result.extend(response['data']);path=response.get('links',{}).get('next')
        return result
    app=api('/v1/apps/'+APP_ID)['data']
    if app['attributes']['bundleId']!=BUNDLE:raise ValueError('The App Store app ID belongs to a different bundle identifier.')
    bundles=rows('/v1/bundleIds?'+urlencode({'filter[identifier]':BUNDLE,'limit':200}))
    if len(bundles)!=1:raise ValueError('Expected exactly one registered Nastran bundle ID.')
    bundle_id=bundles[0]['id']
    certs=rows('/v1/certificates?limit=200')
    matching=[c for c in certs if hashlib.sha256(decode(c['attributes']['certificateContent'])).digest()==fingerprint]
    if len(matching)!=1:raise ValueError('The local distribution certificate is not active in this Apple account.')
    cert_id=matching[0]['id']
    profiles=rows('/v1/profiles?'+urlencode({'filter[profileType]':'IOS_APP_STORE','include':'bundleId,certificates','limit':200}))
    matching_profiles=[]
    for p in profiles:
        rel=p.get('relationships',{})
        if (rel.get('bundleId',{}).get('data',{}).get('id')==bundle_id and
            cert_id in [c['id'] for c in rel.get('certificates',{}).get('data',[])] and
            p['attributes']['profileState']=='ACTIVE' and
            datetime.datetime.fromisoformat(p['attributes']['expirationDate'].replace('Z','+00:00'))>now):
            matching_profiles.append(p)
    print('Verified: app '+APP_ID+' / '+BUNDLE+'; existing distribution certificate with private key.')
    print('Certificate expires: '+cert.not_valid_after_utc.date().isoformat())
    print('Matching active App Store profiles: '+str(len(matching_profiles)))
    if not args.register:
        print('Read-only verification complete. No secrets or profiles changed.');return
    if matching_profiles:
        profile=matching_profiles[0]
    else:
        profile=api('/v1/profiles',{'data':{'type':'profiles','attributes':{'name':'Nastran App Store','profileType':'IOS_APP_STORE'},'relationships':{'bundleId':{'data':{'type':'bundleIds','id':bundle_id}},'certificates':{'data':[{'type':'certificates','id':cert_id}]}}}})['data']
        print('Created Nastran App Store provisioning profile.')
    raw=decode(profile['attributes']['profileContent'])
    start=raw.find(b'<?xml');end=raw.find(b'</plist>',start)+len(b'</plist>')
    if start<0 or end<start:raise ValueError('Profile has no XML payload.')
    pl=plistlib.loads(raw[start:end]);ent=pl['Entitlements']
    expected=[prefix+'.'+BUNDLE for prefix in pl['ApplicationIdentifierPrefix']]
    if ent.get('application-identifier') not in expected or secrets['IOS_TEAM_ID'] not in pl['TeamIdentifier']:
        raise ValueError('The profile does not match the Nastran bundle and Apple team.')
    if ent.get('get-task-allow') or pl.get('ProvisionedDevices') or pl.get('ProvisionsAllDevices'):
        raise ValueError('Expected an App Store distribution profile.')
    if not any(hashlib.sha256(c).digest()==fingerprint for c in pl['DeveloperCertificates']):
        raise ValueError('Profile does not include the distribution certificate.')
    secrets['IOS_PROVISIONING_PROFILE_NASTRAN_BASE64']=base64.b64encode(raw).decode()
    for name,value in secrets.items():
        completed=subprocess.run(['gh','secret','set',name,'--repo',REPO],input=value.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        if completed.returncode:raise RuntimeError('GitHub rejected registration of '+name+'. No secret value was printed.')
        print('Registered: '+name)
    print('Registered all 7 repository secrets. No secret files were copied into the repository.')

if __name__=='__main__':
    try:main()
    except Exception as error:
        # Cryptographic libraries do not include key material in these errors.
        raise SystemExit(str(error))
