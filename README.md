# PurRef_Preview

[Eagle](https://en.eagle.cool/) 向けの Eagle プラグインです。`.pur`（PureRef シーンファイル）のサムネイル生成・プレビュー表示に対応しています。

---

## 機能

- **PureRef (`.pur`) のサポート**
  - Eagle ライブラリ内の `.pur` ファイルのサムネイルを自動生成
  - オリジナルサイズのキャッシュ画像をバックグラウンドで生成・保存
  - インタラクティブビューアでシーンを閲覧（ズーム・パン対応）

---

## 必要要件

- [Eagle](https://en.eagle.cool/) （Eagle プラグイン実行環境）
- [PureRef](https://www.pureref.com/) （`.pur` ファイルのエクスポートに使用）
  - `PureRef.exe` がインストールされていること（Windows）
  - 環境変数 `PUREREF_PATH` でパスを指定することも可能

---

## インストール

1. このリポジトリをダウンロード（または ZIP を展開）します。
2. 依存パッケージをインストールします。

   ```bash
   npm install
   ```

3. Eagle を起動し、プラグインフォルダに本プラグインを配置します。  
   または、`PurRef_Preview.eagleplugin` ファイルをダブルクリックして Eagle にインストールします。

---

## 使い方

インストール後、Eagle のライブラリに `.pur` ファイルを追加すると、自動的にサムネイルが生成されます。  
UI 言語は Eagle の言語設定に従い、日本語・英語に自動で切り替わります。

### ビューア操作

| 操作 | 機能 |
|------|------|
| マウスホイール / Wheel | ズームイン / ズームアウト |
| ドラッグ / Drag | パン（移動） |
| ダブルクリック / Double-click | 画面にフィット |
| `+` / `=` | ズームイン |
| `-` | ズームアウト |
| `0` | ズームリセット |
| `F` | 画面にフィット |

### 右クリック コンテキストメニュー

| メニュー項目 | 動作 |
|---|---|
| オリジナルサイズで再生成 / Regenerate at Original Size | シーンのオリジナル解像度で再生成 |
| 2000×2000 で再生成 / Regenerate at 2000×2000 | 中解像度（2000×2000）で再生成 |
| 画面にフィット / Fit to Screen | 現在の画像を画面にフィット |

### PureRef のパス設定

`PureRef.exe` が標準の場所にインストールされていない場合は、環境変数 `PUREREF_PATH` に実行ファイルのフルパスを設定してください。

```
PUREREF_PATH=C:\MyApps\PureRef\PureRef.exe
```

デフォルトで検索されるパス：
- `C:\Program Files\PureRef\PureRef.exe`
- `C:\Program Files (x86)\PureRef\PureRef.exe`
- `%APPDATA%\..\Local\Programs\PureRef\PureRef.exe`
- `%USERPROFILE%\AppData\Local\Programs\PureRef\PureRef.exe`

---

## ファイル構成

```
PurRef_Preview/
├── manifest.json          # Eagle プラグイン設定
├── package.json           # npm パッケージ設定
├── logo.png               # プラグインロゴ
├── PurRef_Preview.eagleplugin
├── js/
│   ├── pureref-util.js    # PureRef CLI 呼び出しユーティリティ
│   └── image-size.js      # 画像サイズ取得ユーティリティ
├── thumbnail/
│   └── pureref.js         # PureRef サムネイル生成スクリプト
└── viewer/
    └── pureref.html       # PureRef インタラクティブビューア
```

---

## ログ

サムネイル生成時のログは以下のディレクトリに保存されます。

```
%TEMP%\pureref_logs\
```

問題が発生した場合は、このフォルダ内のログファイルを確認してください。

---

## 依存ライブラリ

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| [panzoom](https://github.com/anvaka/panzoom) | ^9.4.3 | ビューアのズーム・パン機能 |

---

## ライセンス

ISC







