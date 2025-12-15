# Outline Converter

[![GitHub Release](https://img.shields.io/github/v/release/masaki39/outline-converter?sort=semver&label=latest&logo=github&color=%237c3aed)](https://github.com/masaki39/outline-converter/releases/latest) [![Total Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&query=%24%5B%22outline-converter%22%5D.downloads&label=total%20downloads&color=%237c3aed)](https://obsidian.md/plugins?id=outline-converter)

📖 **[English README](./README.md)**

箇条書きのアウトラインを、見出しを自動検出して美しい連続テキストに変換するプラグインです。柔軟なカスタマイズオプションも用意されています。

## 機能

- **🤖 自動見出し変換**: アウトラインの構造を解析し、見出しと本文を自動判定して変換
- **⚙️ カスタム変換**: インデントレベル(1〜5)ごとに変換方法を細かく制御
- **🔄 置換機能**: 正規表現対応の検索・置換を最大5つまで適用可能
- **📝 セクション挿入**: `[[#セクション名]]`構文で他のセクションの内容を挿入
- **📤 柔軟な出力**: クリップボード、カーソル位置、ノート末尾、セクション置換から選択
- **📁 折りたたみコマンド**: インデントレベル(1〜5)ごとに一括折りたたみ
- **↕️ 賢い行交換**: Outlinerプラグインと連携した行の入れ替え機能

## インストール

1. **設定** → **コミュニティプラグイン**を開く
2. 必要に応じて**制限モード**を無効化
3. **閲覧**をクリックして「Outline Converter」を検索
4. **インストール**をクリックし、その後**有効化**

## 使い方

選択テキストまたはアクティブノート全体を処理対象とします。

### Auto-header Converter

アウトラインの構造に基づいて自動変換します。子項目を持つ項目は見出し、持たない項目は本文になります。

**例:**

```markdown
- 機能
	- このプラグインはアウトラインを変換します
	- 2つのコマンドが使えます
```

変換後:

```markdown
## 機能

このプラグインはアウトラインを変換します。2つのコマンドが使えます。
```

### Custom Converter

インデントレベル(1〜5)ごとにテキスト変換を制御できます。各レベルで、コンテンツの前後にテキストを追加したり、コンテンツを無視することが可能です。

//から始まる行はコンテンツを無視します。

### Replacement (Find & Replace)

正規表現対応の検索・置換を最大5つまで順次適用できます。

#### 設定で使える特殊文字
- 設定に `\n`(改行) / `\r`(CR) / `\t`(タブ) / `\\`(バックスラッシュ) を書くと、実行時に展開されます。
- それ以外のバックスラッシュ付きシーケンスはそのままなので、`\s` や `\d` といった正規表現のトークンは意図どおり動作します。
- 文字列としての `\n` を検索したい場合は、Regex ON なら `\\n`、Regex OFF ならそのまま `\n` を入力してください。

### Section Insertion

`[[#セクション名]]`構文で他のセクションのコンテンツを挿入できます。`[[#Section]]`と`![[#Section]]`の両方に対応しています。

### Export Methods

| 方法 | 説明 |
|--------|-------------|
| **Copy to clipboard** | 結果をクリップボードにコピー |
| **Append to cursor** | 現在のカーソル位置にテキストを挿入 |
| **Append to bottom** | アクティブノートの最後にテキストを追加 |
| **Replace section** | 特定のセクションを置換(存在しない場合は作成) |

## Additional Commands

### Fold Commands

コマンドパレットから特定のインデントレベル(1〜5)の項目を一括で折りたたみできます。

### Swap Lines Commands

行を上下に移動できます。[Outlinerプラグイン](https://github.com/vslinko/obsidian-outliner)と連携して、より高度なアウトライン操作が可能です。
