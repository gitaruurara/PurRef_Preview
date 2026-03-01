# ログファイルについて

PureRef プラグインのすべてのログは、**ファイルに自動的に書き出されます**。

## ログファイルの場所

```
%TEMP%\pureref_logs\
```

**具体的なパス**（コマンドプロンプトで確認）:
```batch
echo %TEMP%\pureref_logs\
```

または、直接開く：
```batch
explorer %TEMP%\pureref_logs\
```

## ログファイル一覧

| ファイル | 説明 | 生成される場所 |
|---------|------|------------|
| `pureref_*.log` | PureRef CLI 実行ログ | `js/pureref-util.js` |
| `thumbnail_*.log` | サムネイル生成ログ | `thumbnail/pureref.js` |

## ログの見方

1. **Windows エクスプローラーで開く**
   ```
   %TEMP%\pureref_logs\
   ```

2. **最新のログファイルを確認**
   - タイムスタンプが最新のファイルが、最後に実行したログです

3. **テキストエディタで確認**
   - ログファイルを Visual Studio Code やメモ帳で開く

## ログの内容

### サムネイル生成失敗時の例

```
[2026-03-01T10:30:45.123Z] [Thumbnail] Starting thumbnail generation
[2026-03-01T10:30:45.124Z] [Thumbnail] Source file: D:\Dropbox\PurRef.library\images\...\file.pur
[2026-03-01T10:30:45.125Z] [Thumbnail] Destination: C:\...cache\file_thumbnail.png
[2026-03-01T10:30:45.200Z] [PureRef] Found PureRef at: C:\Program Files\PureRef\PureRef.exe
[2026-03-01T10:30:45.201Z] [PureRef] Creating batch file: ...
[2026-03-01T10:30:47.500Z] [PureRef] Export successful! File size: 245632 bytes
```

## 主なエラーメッセージ

| エラー | 原因 | 対処法 |
|--------|------|--------|
| `PureRef.exe not found` | PureRef がインストールされていない | PureRef をインストール |
| `Input file not found` | .pur ファイルが見つからない | ファイルパスを確認 |
| `Output file not created` | PureRef 実行に失敗した | PureRef のインストールを確認 |
| `export failed` | コマンド実行エラー | ログの詳細を確認 |

## デバッグのコツ

1. **失敗したファイルの最新ログを確認**
   ```
   C:\Users\<ユーザー名>\AppData\Local\Temp\pureref_logs\
   ```

2. **ログに出力される情報**
   - PureRef.exe のパス
   - 入力ファイルのパス
   - 出力ファイルのパス
   - バッチファイルの内容
   - PureRef のエラーメッセージ

3. **バッチファイルを確認**
   - ログに「Batch file content」という行があれば、その下にコマンドが表示されます
   - これをコマンドプロンプトで直接実行してテストできます

## ログの自動削除

古いログファイルは定期的に手動で削除できます。ログディレクトリ内で、1 週間以上前のファイルを削除しても問題ありません。

---

**このドキュメントを参考に、失敗したサムネイル生成のログを確認してください！**

