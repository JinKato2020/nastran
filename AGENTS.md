# Nastranアプリのビルド・提出ルール

- ユーザー指定（2026-11-10）：iOSの作業は、TestFlightへのアップロードが成功した時点で完了とする。
- アップロード後にApple側の処理完了、VALID、テスト開始可能状態を待機・ポーリングしない。ユーザーが別途確認を依頼した場合だけ確認する。
- GitHub ActionsにもAppleの処理完了を待つ工程を入れない。アップロードの成功・失敗の確認と一時署名ファイルの後片付けは行う。
- App Storeの審査申請・公開は行わない。TestFlightへの提出とストア申請を区別する。
- 対象：GitHub `JinKato2020/nastran`、iOSバンドルID `com.safa.nastran`、App Store ConnectアプリID `6816586481`。
- CAEとは独立したアプリ。CAEのファイル・設定は変更しない。
