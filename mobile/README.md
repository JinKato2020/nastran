# Nastran はじめの一歩 — 独立アプリ

既存のNastran教材を同梱した、Expo / React NativeのiOS向け学習アプリです。CAEアプリとは別のプロジェクトです。CAEフォルダのファイル・設定・依存関係は変更していません。

## 実装した内容

- 入門6ステップ：目的と単位 → 点・要素・支え・力 → 入力ファイル → 棒の手計算 → 実行と結果 → 条件を変える演習。
- ホームと目次を「入門」「次の学習」「調べる」に整理。全14ページの内容を保ち、入力規則とBDF作成を統合しています。発展は片持ち梁・座標・動解析・減衰・亀裂、辞書と実務はBulk図鑑・相関図・エラー検索・INCLUDE・バッチです。
- エラー検索は2025.1 Error Messages Guideの7,932掲載項目（枝番・書式6件・重複1件を含む）を索引化。番号・英語・日本語・F06貼り付け、49項目の個別日本語解説、種類別の共通確認手順、原典ページ、しおりとコピーに対応。全件の日本語訳や自動原因診断ではありません。検索はオフライン、原典リンクはオンラインです。
- 動解析はSOL 103・111・112の図解、周波数／時間応答の理論グラフ、14カードのフィールド解説、3つのBDFとZIPを同梱。動解析の場所もしおりに保存できます。
- 4解析（101・103・111・112）のカード相関図。参照元・参照先の説明、カード解説へのリンク、PNG/SVG画像ZIPの共有に対応。
- モデル化教材は片持ち梁の等価ばね・CBAR・CHEXA20の3段階、仮定と限界、手計算、カード相関図、8文字入力表と完成BDFを収録。ソルバー実行は未確認。
- 減衰教材は粘性・構造・モード・Rayleigh、係数換算、応答の比較、W3/W4、6つのBDF例題と全フィールド解説を収録。理論グラフであり、ソルバー実行は未確認。
- 亀裂教材はCRAC2Dの特異場とK評価、18節点の局所モデル、3カードの全欄、非ゼロSPC変位、出力S1〜S9の読み方を収録。ソルバーの実行は未確認。
- 教材の図解、実験室、フィールド別説明、8文字入力表をオフラインで表示。
- ネイティブのホーム・目次・戻る操作・しおり・「続きから読む」。入門6ステップの読了記録を端末内へ保存。旧11章の記録も残し、移動した教材のしおりは新しい説明先へ引き継ぎます。
- コピーはiOSのクリップボードへ、BDF・INC・BAT・ZIPはiOSの共有メニューへ接続。「ファイルに保存」を選んで持ち出せます。
- 原典PDFなどの外部リンクは端末のブラウザで開きます。教材WebView内では外部サイトを読み込みません。

このアプリは入力を学ぶ教材で、Nastranソルバーを実行するものではありません。Windows用BATをiPhone上で実行する機能もありません。

## 起動

Node.js 24で確認しています。

```powershell
cd C:\Users\jwpsa\Documents\desktop\claude\nastran\mobile
npm ci
npm start
```

対応するExpo Goまたは開発用ビルドで開きます。MacとXcodeがある場合は `npm run ios` でシミュレーターを起動できます。このWindows環境からiOSシミュレーターは起動できません。

## 教材を更新するとき

元の教材は `../sites/nastran-learning/dist/`、共通の目次は `../sites/nastran-learning/learning-path.json` です。目次変更時はWeb側の`python build_learning.py`を実行します。Web教材側の変更を済ませ、次を実行します。

```powershell
npm run content
npm run typecheck
npm run test:core
npm run test:reader
```

`src/generated/lessons.json` は14画面のHTML/CSS/JavaScriptと配布ファイルをまとめた生成物です。直接編集しません。`provenance.json` には元ファイルのSHA-256を記録します。公式マニュアルのPDFや全文テキストはアプリへ同梱していません。

Web版で使うコピー・Blobダウンロード・内部リンク・学習記録を、`tools/reader-bridge.js` からネイティブ側へ渡しています。外部文書にこのブリッジは提供しません。

## iOSのビルド・配布

iOSの識別子は `com.safa.nastran`、App Store ConnectのアプリIDは `6816586481` です。

[GitHub Actions](https://github.com/JinKato2020/nastran/actions/workflows/build-ios.yml)で `Nastran iOS Build` → `Run workflow` を実行すると、GitHubのMacで署名付きIPAを生成します。証明書とAPIキーは同じAppleチームのCAEと共通、プロビジョニングプロファイルはNastran専用です。詳細なSecret名と使い方はGitHubリポジトリのREADMEにあります。既定ではTestFlightへアップロードしてAppleの処理を確認します。App Storeの審査申請・公開は行いません。

`eas.json`はEASを使う場合の補助設定です。今回のGitHubビルドはEASを使いません。Androidの基本設定もありますが、Androidビルドは今回の対象外です。

## 確認済みの範囲

- TypeScript検査。
- 同梱した14教材のオフライン表示、6ステップと旧11章の記録の橋渡し、旧しおりの移行、画面リンク、コピー、BDF/INC/BAT/ZIPのバイト列。
- 実際のApp.tsxをReact Native Webで描画する代替環境で、320・390・768pxのホーム、目次、戻る、しおり、再起動時の記録復元。ネイティブAPIは模擬サービスです。
- iOS向けJavaScriptバンドルの生成（`npm run export:ios:js`）。

Windowsのアプリケーション制御が付属のhermesc.exeをブロックしたため、通常のHermesバイトコード生成はこのPCでは完了していません。`export:ios:js` はExpoの `--no-bytecode` による検証用出力で、配布用IPAではありません。クラウド／Macでの本番ビルドは通常のHermes設定を使います。

iOS実機では、オフライン起動、共有メニューからのファイル保存、保存したBDFの8文字幅、バックグラウンド復帰、しおりの復元を確認してください。端末の共有シートとWebKitの実機動作は未確認です。

## 表示検証の再実行

```powershell
node tools/preview-app.mjs
python -m http.server 8766 --bind 127.0.0.1 --directory .qa/app
```

別のターミナルで `python tools/check-app.py` を実行します。表示検証は開発用で、画面上の保存・共有は模擬動作です。通常のアプリ起動は前述の `npm start` を使います。

`node_modules`、`.qa`、`.build`、`.expo` は生成物です。`.gitignore` で管理対象から外しています。Expo SDK 58の依存関係はlockfileで固定しています。npm auditでは開発ツールのglob/minimatch経由のmoderate 5件が報告されています。Expoの互換性を崩す強制ダウングレードは行っていません。

仕様確認：[Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)、[Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/)、[FileSystem legacy](https://docs.expo.dev/versions/latest/sdk/filesystem-legacy/)、[React Native WebView](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md)。
