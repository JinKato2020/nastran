# FEMノート for nas

MSC Nastranの日本語学習アプリです。初学者向けの6ステップ、8文字フィールドの入力解説、静解析・動解析・減衰・モデル化、エラー検索をオフラインで利用できます。

入力データ学習は「入力区分 → カテゴリー → カード・設定名」の3段階で選択します。Executive Control / Case Control / パラメータ / Bulk Dataの120項目を対象とし、スマホでは選択欄を上段2つ・下段1つに集約。検索は必要時だけ開きます。入力規則は入門の「入力規則・BDF作成」に集約しています。

2020 SP1 QRG Table 2の25種類のSOLに、用途・解法・参照カード・結果の読み方・注意点・原典ページを追加。複素固有値、非線形制御、熱物性・温度条件等の18項目も追加しています。制御部の抜粋と完成BDFを区別しています。アイコンは白地・黒文字の「FEMノート / for nas」を上下左右中央に配置しています。

解析タブの重複入力表は削除し、固定長テキスト全文の先頭コードからInputデータのカードへリンクします。戻る操作で例題・全文の開いた状態・読んでいた位置を復元します。BDFのコピー・保存は元の固定長データを維持します。

アプリのボトムナビはホーム・教材・解析・Inputデータ・設定の5タブです。ホームは「はじめに」とエラー検索、教材は境界条件・減衰・並列計算等、解析は8種類の解析を収録。設定で本文文字サイズを変更できます。読了記録・しおりは引き継ぎます。

- iOSバンドルID: `com.safa.nastran`
- App Store ConnectのアプリID: `6816586481`
- アプリ本体: `mobile/`
- 教材の元データ: `sites/nastran-learning/dist/`
- 共通の学習順序: `sites/nastran-learning/learning-path.json`

## 教材・図をiOSへOTA配信

教材は `sites/nastran-learning/dist/` を更新し、対象ブランチから [Deploy Nastran Content (R2 / OTA)](https://github.com/JinKato2020/nastran/actions/workflows/deploy-content-nastran.yml) を手動実行します。教材の生成、型検査、教材の検証を通過したページを `https://content.safa-lang.com/nastran/` に掲載します。

- GitHub Repository Secrets に `R2_ENDPOINT`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET`（`safa-content`）を設定します。配信対象は `nastran/` 配下です。
- R2では `nastran/objects/` に内容のSHA-256で教材ファイルを保存し、`nastran/releases/<配信ID>.json` に各版の配信一覧を保持します。同じファイルは再利用し、過去版も復旧できるよう保持します。現在配信中の版は `nastran/_manifest.json` です。
- 復旧時は、対象版のActionsの実行概要に表示された配信IDを `restore_release` に指定します。保存済みの一覧と参照先のファイルをSHA-256で検証し、現在の配信一覧を切り替えます。R2のライフサイクル設定で `nastran/objects/` と `nastran/releases/` が期限切れ削除の対象に入っていないことを確認してください。
- 端末は起動後に変更ページだけを取得し、SHA-256と全ページの準備を確認してから同じ起動中に切り替えます。切り替え後に不要なダウンロードを削除し、通信や検証に失敗した場合は取得済みの有効な教材か同梱教材を読みます。
- OTAの対象は既存の教材ページ内の本文・図です。アプリ本体、ネイティブのタブ・目次、共有用の同梱ZIPなどを変更する場合は別途ビルドします。

ローカルで配信データを生成・検証できます。

```sh
cd mobile
npm ci
npm run content:ota
npm run typecheck
npm run test:core
```

OTA配信ではバージョン・ビルド番号を据え置きます。

1.2.10（1001）にはOTA受信機能が入っていません。最初のOTA対応版のインストール後にOTA配信を開始します。

## GitHubでiOSをビルド

1. [Actions → Nastran iOS Build](https://github.com/JinKato2020/nastran/actions/workflows/build-ios.yml)を開きます。
2. **Run workflow**で`main`を選び、実行します。
3. アップロード成功でこの作業は完了です。実行画面の**Artifacts**にある`nastran-ios-ipa-<番号>`から署名付きIPAを保存します。

GitHubのmacOSランナーでExpo Prebuild → CocoaPods → Xcode archive → IPA exportを実行します。EASやEXPO_TOKENは使用しません。Apple側のアプリIDとバンドルIDを実行前に照合し、既存の整数Build番号より大きな番号を選びます。

既定では署名付きIPAをTestFlightへアップロードし、アップロード成功で作業を完了します。Apple側の処理完了は待ちません（2026-11-10のユーザー指定）。**App Storeの審査申請・公開は行いません。** IPAだけ必要な場合は実行時の`testflight`チェックを外します。iPhoneでの確認にはTestFlightを使います。

## Repository secrets

[Settings → Secrets and variables → Actions](https://github.com/JinKato2020/nastran/settings/secrets/actions)に次の7件を登録します。値はソースに書きません。

| Secret名 | 内容 |
|---|---|
| `IOS_DIST_CERT_BASE64` | 秘密鍵を含むApple Distribution証明書（.p12）のBase64 |
| `IOS_DIST_CERT_PASSWORD` | .p12を書き出したときのパスワード |
| `IOS_TEAM_ID` | Apple DeveloperのTeam ID |
| `IOS_PROVISIONING_PROFILE_NASTRAN_BASE64` | **com.safa.nastran専用**のApp StoreプロファイルのBase64 |
| `APP_STORE_CONNECT_KEY_ID` | App Store Connect APIのKey ID |
| `APP_STORE_CONNECT_ISSUER_ID` | APIのIssuer ID |
| `APP_STORE_CONNECT_API_KEY_BASE64` | API秘密鍵（.p8）のBase64 |

証明書・Team ID・APIキーは同じAppleチームのCAEと共通です。プロビジョニングプロファイルはNastran専用です。Apple ID `6816586481`はアプリの番号で、Team IDやAPI Key IDとは別です。2026-11-10に7件の登録とApple側の対応関係を確認しました。

署名情報を更新する場合、`mobile/tools/register-ios-secrets.py --secrets-dir <元データのフォルダ>`で検証できます。各Secret名に`.txt`を付けたファイルを読み、秘密値は表示しません。`--register`を追加するとNastran用プロファイルを用意してGitHubへ登録します。Pythonの`cryptography`と、対象リポジトリを管理できる`gh`ログインが必要です。

## ローカル検証と教材更新

```sh
cd mobile
npm ci
npm run content
npm run typecheck
npm run test:core
npm start
```

教材を編集した後は`npm run content`で同梱データを再生成します。`src/generated/lessons.json`を直接編集しないでください。`main`へのpushとPRでは型・教材データの検証が動きます。署名ビルドとOTA配信は手動実行です。

原典PDF・抽出全文・秘密鍵は収録していません。詳しい教材一覧とアプリの仕様は[mobile/README.md](mobile/README.md)を参照してください。

参考: [GitHubのApple署名設定](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/sign-xcode-applications)、[Expo Prebuild](https://docs.expo.dev/workflow/continuous-native-generation/)、[AppleのApp Storeプロファイル](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile/)。
