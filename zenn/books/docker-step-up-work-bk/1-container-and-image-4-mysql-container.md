---
title: "🖥️ ｜ 🐳 ｜ MySQL データベースを数分で用意しよう"
---

# 導入
## 目的・動機
公式イメージを使ってコンテナを起動することもあります。

いくつかのパラメータを添えてコンテナを起動する方法を知っておきましょう。

## このページで初登場するコマンド
[`docker run [option] <image> [command] [arg...]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/run/)

オプション | 意味 | 用途  
:-- | :-- | :--
`-e, --env`   | 環境変数を設定する   | 意味の通り

# MySQL コンテナを起動しよう
## コンテナを起動する
MySQL は、最初から MySQL がインストールされているイメージを使ってみましょう。
( [Docker Hub - mysql](https://hub.docker.com/_/mysql) )

イメージにはデフォルトで命令が書き込まれており、基本的に公式イメージを使う時はイメージに含まれているデフォルト命令を使うことになります。
なので MySQL コンテナを起動する時は `bash` のような `[command]` の指定は行いません。

また `bash` のように対話操作をするつもりはないので `-it` も不要です。

起動コマンドはこのようになります。

```
$ docker run mysql:5.7
```

ただし Mac ( M1 ) の方は次のように `--platform` オプションを指定する必要があります。

```
$ docker run --platform=linux/amd64 mysql:5.7
```

`--platform=linux/amd64` は一部のコンテナを Mac ( M1 ) で動かすために必要なオプションです。

Windows および Mac ( Intel ) の方は付けても付けなくても結果に違いはありませんし、この Book 全ての場所で省略しても構いません。

この Book では Mac ( M1 ) でも動くように必要な場合では必ず明示することにしますが、不要な方に関しては付ける付けないの判断は自由です。

この Book では Mac ( M1 ) の Docker 事情については割愛します、興味のある方は以前公開した別の Book をご覧ください。

https://zenn.dev/suzuki_hoge/books/2021-12-m1-docker-5ac3fe0b1c05de

コマンドのオプションを組み立てられたところで、コンテナを起動してみましょう。

```
$ docker run --platform=linux/amd64 mysql:5.7

    You need to specify one of the following:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD
```

`docker run` が `You need to specify one of the following:` と怒られて失敗しています。

こういう場合は [Docker Hub の該当イメージのトップページ](https://hub.docker.com/_/mysql) に行ってみましょう、大抵の場合はそこに説明があります。
`Environment Variables` の項に説明があるので、それを参考に次の 4 つを指定してみます。

変数名              | 用途                                                    | 値
:--                 | :--                                                     | :--
`MYSQL_ROOT_PASSWORD` | ルートユーザのパスワード                                | 自由  
`MYSQL_USER`          | ルートユーザとは別に作成するユーザの名前 ( 任意 )       | 自由  
`MYSQL_PASSWORD`      | ルートユーザとは別に作成するユーザのパスワード ( 任意 ) | 自由<br>ただし `MYSQL_ROOT_PASSWORD` とは違うもの  
`MYSQL_DATABASE`      | 起動時に作成されるデータベースの名前 ( 任意 )           | `event`

自由となっている部分は自分で決めて、控えておいてください。
この本では上から `rootpassword`, `hoge`, `password`, `event` としますが、自分で設定してみる方が経験になるのでおすすめです。

あらためて `docker run` してみましょう

```
$ docker run                            \
    --platform=linux/amd64              \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_USER=hoge                  \
    -e MYSQL_PASSWORD=password          \
    -e MYSQL_DATABASE=event             \
    mysql:5.7
```

:::message
ここからはコマンドがどんどん長くなるので `\` で改行しています。

そのままペーストして 1 コマンドとして実行できますが、初見のパラメータなどは極力自分の手で入力するようにしましょう。

手打ちもタイポして出るエラーを読むのもとても大事です、最終的な理解度が全く変わります。
:::

ずらずらと出力がされ、最後にこのような出力が見えたら起動完了です。

```
Version: '5.7.36'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
```

このターミナルとは違うタブでコンテナ一覧を確認するとどうなるでしょうか。

それだけ確認してこのページはおしまいです。

:::details ワーク: 結果の予想、コンテナ一覧の確認
```
$ docker ps

CONTAINER ID    IMAGE           COMMAND                   CREATED          STATUS          PORTS                  NAMES
c8cabbe7b1ae    ubuntu:20.04    "bash"                    4 minutes ago    Up 9 minutes                           sharp_galileo
11d945f0edf0    mysql:5.7       "docker-entrypoint.s…"    7 minutes ago    Up 7 minutes    3306/tcp, 33060/tcp    stupefied_napier
```

MySQL サーバが起動し続けているので、コンテナは当然終了していません。

とは言え `bash` などが起動しているわけでもないので、このターミナルはもうこれ以上操作はできません、放置して次のページに進みましょう。
:::

動作確認は [コンテナに接続してみよう](#todo) のページで行います。

# まとめ
- Docker Hub にある公式イメージをそのまま起動することもある
- サーバなどのコンテナは基本的に `bash` 命令はしないし `-it` も不要である
- `-e` オプションで環境変数を指定できる  
- Mac ( M1 ) の場合に限り `--platform` オプションが必要である
  
これで MySQL データベースが手に入りました。
