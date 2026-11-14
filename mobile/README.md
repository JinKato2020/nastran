# FEM Guide for nas — 独立アプリ

既存のNastran教材を同梱した、Expo / React NativeのiOS向け学習アプリです。CAEアプリとは別のプロジェクトです。CAEフォルダのファイル・設定・依存関係は変更していません。

## 実装した内容

- 教材 → 共通の解析技術論 →「似たカードの使い分け」：CBAR／CBEAM、EIGRL／EIGR／EIGCを含む14テーマ。共通点・相違点・選択基準・結果への影響・注意点を整理し、Inputデータの詳細解説へ相互リンクします。図はカードの役割を示す模式図です。この追加に実行用モデルの新規作成・変更はありません。
- 入門6ステップ：目的と単位 → 点・要素・支え・力 → 入力ファイル → 棒の手計算 → 実行と結果 → 条件を変える演習。
- 常時表示の5タブ：ホーム／教材／解析／Inputデータ／設定。ホームはエラー検索としおり。教材はイントロダクション、共通の解析技術論、各解析技術理論の3分類。解析は15テーマの技術情報を収録し、理論教材へ相互リンクします。Inputデータはコンパクトな3段階選択で、カードをアルファベット順に表示します。
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

カード比較の本文は `../sites/nastran-learning/card-comparisons.json` です。変更時は同ディレクトリの `python build_comparisons.py` を先に実行します。

`src/generated/lessons.json` は17画面のHTML/CSS/JavaScriptと配布ファイルをまとめた生成物です。直接編集しません。`provenance.json` には元ファイルのSHA-256を記録します。公式マニュアルのPDFや全文テキストはアプリへ同梱していません。

2026-11-12時点で、既存のアシスタント作成・改変モデルは採用済みではなく、第三者原本への置換と公開範囲の見直しは未完了です。カード比較の追加は、既存モデルの実行品質や再配布条件の承認を意味しません。

Web版で使うコピー・Blobダウンロード・内部リンク・学習記録を、`tools/reader-bridge.js` からネイティブ側へ渡しています。外部文書にこのブリッジは提供しません。

## iOSのビルド・配布

iOSの識別子は `com.safa.nastran`、App Store ConnectのアプリIDは `6816586481` です。

[GitHub Actions](https://github.com/JinKato2020/nastran/actions/workflows/build-ios.yml)で `Nastran iOS Build` → `Run workflow` を実行すると、GitHubのMacで署名付きIPAを生成します。証明書とAPIキーは同じAppleチームのCAEと共通、プロビジョニングプロファイルはNastran専用です。詳細なSecret名と使い方はGitHubリポジトリのREADMEにあります。既定ではTestFlightへのアップロード成功で作業を完了します。Apple側の処理完了は待ちません（2026-11-10のユーザー指定）。App Storeの審査申請・公開は行いません。

`eas.json`はEASを使う場合の補助設定です。今回のGitHubビルドはEASを使いません。Androidの基本設定もありますが、Androidビルドは今回の対象外です。

## 確認済みの範囲

- TypeScript検査。
- 同梱した17画面の教材のオフライン表示、6ステップと旧11章の記録の橋渡し、旧しおりの移行、画面リンク、コピー、BDF/INC/BAT/ZIPのバイト列。
- 実際のApp.tsxをReact Native Webで描画する代替環境で、320・390・768pxのホーム、目次、戻る、しおり、再起動時の記録復元。ネイティブAPIは模擬サービスです。
- iOS向けJavaScriptバンドルの生成（`npm run export:ios:js`）。

Windowsのアプリケーション制御が付属のhermesc.exeをブロックしたため、通常のHermesバイトコード生成はこのPCでは完了していません。`export:ios:js` はExpoの `--no-bytecode` による検証用出力で、配布用IPAではありません。クラウド／Macでの本番ビルドは通常のHermes設定を使います。

iOS実機では、オフライン起動、共有メニューからのファイル保存、保存したBDFの8文字幅、バックグラウンド復帰、しおりの復元を確認してください。前版1.0.0 (1002)はユーザーが実機確認済みです。今回の入力データ学習の変更はブラウザー代替環境で検証し、実機での再確認は別途必要です。

## 表示検証の再実行

```powershell
node tools/preview-app.mjs
python -m http.server 8766 --bind 127.0.0.1 --directory .qa/app
```

別のターミナルで `python tools/check-app.py` を実行します。表示検証は開発用で、画面上の保存・共有は模擬動作です。通常のアプリ起動は前述の `npm start` を使います。

`node_modules`、`.qa`、`.build`、`.expo` は生成物です。`.gitignore` で管理対象から外しています。Expo SDK 58の依存関係はlockfileで固定しています。npm auditでは開発ツールのglob/minimatch経由のmoderate 5件が報告されています。Expoの互換性を崩す強制ダウングレードは行っていません。

仕様確認：[Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)、[Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/)、[FileSystem legacy](https://docs.expo.dev/versions/latest/sdk/filesystem-legacy/)、[React Native WebView](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md)。

入力データ学習は入力区分（Executive / Case / パラメータ / Bulk）→カテゴリー→カードの3段階。QRGに基づくカードと設定項目を掲載し、自由形式の制御文と8文字固定長のBulkを区別します。スマホでは上段に入力区分・カテゴリー、下段にカードを配置し、検索は折りたたみます。ネイティブのタイトルとの重複見出しを省き、通常文字サイズでカード見出しを教材領域の上端から230px以内に表示します。旧カード・フィールドしおりを維持し、旧入力規則のしおりは`input.html#rules`へ移行します。

2020 SP1 QRG Table 2（PDF187–188）の25 SOL番号を個別収録。用途・解法・参照カード・出力・注意点・他SOLとの違い・原典ページを統一して掲載。CMETHOD/EIGC、STATSUB、ANALYSIS、NLPARM、NLSTEP、TSTEPNL、温度入力・出力等の18項目を追加しています。SOLの制御例は未定義のモデルやBulkを要する抜粋であり、完成BDFとは明確に区別しています。新規の例はソルバー未実行です。

アプリアイコンは白地・黒文字の「FEM Guide / for nas」2段を上下左右中央に配置。`assets/icon.svg`から`assets/icon-fem-guide-for-nas.png`（1024px、不透明）に描画します。`tools/render-icon.py`はローカルでの再生成用で、iOSビルドでは同梱PNGを使用します。

解析タブの入力例は、リンク付きの固定長テキスト全文に集約しています。重複していた制御文・カード別のフィールド表・独自フィールド定義は削除。先頭コードからInputデータへ移動し、戻る操作で例題・全文の開閉状態・スクロール位置を復元します。CaseとBulkの同名カードやPARAMの設定名も区別してリンクし、コピー・BDF保存は元のCRLF/80列データを保持します。

`analysis.html`は15解析のモデル図、主要カードの参照関係、結果の読み方を収録します。SOL 101・103・107／110は自作例10件の8文字固定長DATと使用カードを掲載し、公式例題は出典PDFへのリンクと主要カード解説を表示します。複素固有値は減衰の有無と解法を別々に切り替えます。解析タブの図は模式図です。公式DATとF06は同梱しません。

大きい解析モデルも最初は6行だけ表示します。全文の展開は必要なときに行い、コピーとDAT保存は縮小表示中でも全文を対象にします。複数モデルのある解析は、選択に合わせて図・条件・結果の確認事項も切り替わります。MSC Nastran本体での実行は未検証です。
