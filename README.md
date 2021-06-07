# DiscordSoundEffectBot
Discordでサウンドエフェクトを再生できるBotです。

# Docker版
Docker版をGitHubのリポジトリにアップロードしたので下記コマンドで直接使えます。  
```
docker pull ghcr.io/noriokun4649/discord-soundeffect-bot
```

# 必要なもの
Node.js v15以降

# Bot実行の準備
./src内にプログラムが入ってるためsrcフォルダ内で下記の通り実行します  
Node.jsで使うパッケージを準備  
```
npm install
```  

# 再生ファイルの保存先
filesフォルダをmain.jsと同じディレクトリに作成しその中に音声ファイルを入れます。

# Bot実行
```
npm start
```  

# Configについて
configフォルダ内のdefault.jsonがコンフィグファイルです。
```json
{
  "Api": {
    "discordToken": ""
  }
}
```

| 項目 | 内容・説明  |
| ------------ | ------------ |
| discordToken  |  Discordのトークンを記入 |

# Botのコマンドリスト

| 接頭語+α | 内容・説明  |
| ------------ | ------------ |
| joinw  |  ボイスチャンネルにBotを呼びます |
| killw  |  ボイスチャンネルから切断します |
| list  |  再生可能ファイル一覧を表示 |
| scan  |  files内のファイルを再読み込み |

# ライセンス
MIT License
