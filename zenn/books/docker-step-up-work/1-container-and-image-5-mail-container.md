---
title: "🖥️ ｜ 🐳 ｜ Mail サーバを数分で用意しよう"
---

# 導入
## 目的・動機
このページでも公式イメージを使ってコンテナ起動をします。

今回はバックグラウンドで起動する方法を知っておきましょう。

## このページで初登場するコマンド
[`docker run [option] <image> [command] [arg...]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/run/)

オプション | 意味 | 用途  
:-- | :-- | :--
`-d, --detach`   | バックグラウンドで実行する   | ターミナルが固まるのを避ける

# Mail コンテナを起動しよう
## コンテナを起動する
Mail コンテナも Docker Hub のイメージを使います。

[MailHog](https://hub.docker.com/r/mailhog/mailhog) というモックのメールサーバを起動してくれるイメージがあるので、それを使います。

MySQL コンテナの起動と同じく、`docker run` の `[command]` はイメージが既に持っている命令に任せます。

今回は `-d` というバックグラウンドで実行するオプションをつけてみます。

```
$ docker run -d --platform=linux/amd64 mailhog/mailhog:v1.0.1
1b4cbbeb4f1909a179823fbb700543f06d9cf80ff21ce1ccf19169183f566374

$
```

バックグラウンドでコンテナを起動すると、ターミナルが MySQL コンテナのように固まらず、コンテナ ID が表示されるだけになります。

`docker run` の命令を `cat /etc/lsb-release` に上書きした時と雰囲気は似ていますが、意味は全く違います。

違いを確認しておきましょう。

:::details ワーク: ubuntu:20.04 を cat /etc/lsb-release で起動、コンテナ一覧の結果の予想、コンテナ一覧の確認
```
$ docker run ubuntu:20.04 cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"

$
```

```
$ docker ps

CONTAINER ID    IMAGE                     COMMAND      CREATED         STATUS          PORTS                 NAMES
2c70700cc16b    mailhog/mailhog:v1.0.1    "MailHog"    1 second ago    Up 1 minutes    1025/tcp, 8025/tcp    confident_fermat
```

Mail コンテナの起動も Ubuntu コンテナの起動も即 `$` になりターミナルは固まりませんでしたが、それがイコールコンテナの終了ではないということをちゃんと理解しましょう。

コンテナが終了するのは命令を完了した時です。
:::

`bash` のように対話操作する命令や `cat /lsb-release` のような結果が見たい命令を除き、コンテナを起動するときは `-d` をつけると固まるターミナルが多くなりすぎないので良いでしょう。

この Book では以降は基本的に `-d` を指定することにします。

Mail コンテナも動作確認は [コンテナに接続してみよう](#todo) のページで行います。

# まとめ
- `-d` オプションでバックグラウンド起動にできる
- ターミナルが固まるかどうかとコンテナが終了したかどうかは全く関係がない
- 命令したコマンドとバックグラウンド指定の有無をきっちり把握しておくのが大切である
