---
title: "Step 1: コンテナを起動しよう"
---

このワークでは最終的に 3 つのコンテナを起動します

![image](/images/slide/slide.007.jpeg)

この章の目標はコンテナの起動を通して、`docker run` を理解することです

- [コマンドライン・リファレンス ( run )](http://docs.docker.jp/v19.03/engine/reference/commandline/run.html)

# Ubuntu コンテナを起動して PHP をインストールしよう
実際は PHP の公式イメージを使う方がいろいろ入っていて楽ですが、今回はあえて自分で調達することにします

実際に公式イメージを使っても、変更は大体の場合必要になりますし、チームメンバーの行う変更を理解するためにも自分でそれを行えることは大切です

前の章でやったように `ubuntu:22.04` を起動して `bash` を使います

`-it` は `bash` などを起動してコンテナと対話する時に必要になるオプションです

```
$ docker run -it ubuntu:22.04

#
```

Ubuntu への PHP8 のインストール手順は次の通りです

途中でターミナルに何か聞かれたら適当に答えて先に進みましょう

```
# apt-get update
# apt-get install -y software-properties-common
# LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
# apt-get update
# apt-get install -y php8.0
```

正常に終了すると、PHP のバージョンが確認できます

```
# php -v
PHP 8.0.8 (cli) (built: Dec  2 2021 16:34:27) ( NTS )
Copyright (c) The PHP Group
Zend Engine v4.0.8, Copyright (c) Zend Technologies
    with Zend OPcache v8.0.8, Copyright (c), by Zend Technologies
```

Step 1 の PHP コンテナはこれで十分です

- :bulb: ベースイメージ ( `ubuntu:22.04` ) を選択し、そこに自分で PHP をインストールしたコンテナができました
- :bulb: コンテナへの命令は `bash` なので、`bash` を終了しない限りコンテナは終了しません
- :bulb: コンテナの `bash` を操作するために、`-it` オプションをつけました^[厳密には `-i` と `-t` をまとめて指定しています]
- :warning: この `bash` やターミナルは終了せず、次のタブを開いて次に進んでください

# MySQL コンテナを起動しよう
MySQL は、最初から MySQL がインストールされているイメージを使ってみましょう

`bash` などを対話で操作するつもりはないので `-it` は不要です

:::message
`-it` を付けても問題はないので常に指定する癖がついても良いくらいですが、この Book では意識して使い分けましょう
:::

```
$ docker run --platform=linux/amd64 mysql:5.7
    You need to specify one of the following:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD
```

:::message
`--platform=linux/amd64` は一部のコンテナを Mac ( M1 ) で動かすために必要なオプションです

Windows および Mac ( Intel ) の方は付けても付けなくても結果に違いはありません

この Book では M1 Mac の Docker 事情については割愛します
:::

よく見ると `You need to specify one of the following:` と怒られて失敗しています

コンテナには起動時に環境変数の指定が必要なものがあります

こういう場合は [Docker Hub の MySQL のトップページ](https://hub.docker.com/_/mysql?tab=description) に行ってみましょう、大抵の場合はそこに説明があります

`Environment Variables` の項に説明があるので、次の 4 つを指定してみます

3 つは自由に決めて、控えておいてください

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_USER`
- `MYSQL_PASSWORD` ( `MYSQL_ROOT_PASSWORD` とは違う値に )
- `MYSQL_DATABASE` ( `event` に )

もう一度 `docker run` してみましょう

```
$ docker run --platform=linux/amd64   \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_USER=hoge                  \
  -e MYSQL_PASSWORD=password          \
  -e MYSQL_DATABASE=event             \
  mysql:5.7
```

:::message
ここからはコマンドがどんどん長くなるので `\` で改行しています

そのままペーストして 1 コマンドとして実行できますが、極力自分の手で入力するようにしましょう

最終的な理解度が全く変わるので、ペーストはお勧めしません
:::

```
Version: '5.7.36'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
```

このような出力が見えたら起動完了です


Step 1 の MySQL コンテナはこれで十分です

- :bulb: MySQL イメージを選択し、それをそのまま起動したコンテナができました
- :bulb: コンテナに `-e` で環境変数を指定しました
- :bulb: コンテナへの命令は `mysqld` なので、`bash` のようにターミナルが自由に操作できるわけではありません
- :bulb: `bash` のように対話をするつもりがないので、`-it` は付けませんでした
- :warning: このターミナルも終了せず、次のタブを開いて次に進んでください

# Mail コンテナを起動しよう
Mail コンテナも Docker Hub のイメージを使います

[MailCatcher](https://mailcatcher.me/) というメール送信機能とモックのメールサーバを提供してくれる Ruby によるライブラリがあります

ホスト OS には `gem` で入れるようですが、[Docker Hub にイメージがある](https://hub.docker.com/r/schickling/mailcatcher) のでそれを使います

:::message
機能的には大差なさそうですが、更新の比較的最近な [MailHog](https://hub.docker.com/r/mailhog/mailhog) のイメージを使う方が一般には良いでしょう

ただ MailHog は Mac ( M1 ) だとメールサーバは問題なく使えますがメール送信機能が動かなかったため、このワークでは MailCatcher を使います

メール送信を `sendmail` などで行いメールサーバだけを使いたい場合は、MailHog の利用も可能です
:::

Docker Hub で調べたイメージ名を指定して起動してみましょう

今回は `-d` オプションをつけてみます

```
$ docker run -d --platform=linux/amd64 schickling/mailcatcher
1b4cbbeb4f1909a179823fbb700543f06d9cf80ff21ce1ccf19169183f566374

$
```

`-d` というバックグラウンドで実行するフラグをつけたので、すぐホストマシンのターミナルに戻ってきてしまいました

`-d` をつけるとターミナルが固まらずにコンテナはバックグラウンドで起動するようになります

`bash` のように対話操作するものや `cat /lsb-release` のような即時終わるものを除き、MySQL サーバや Mail サーバのコンテナを起動する時には `-d` をつけるとターミナルが多くなりすぎず良いでしょう

Step 1 の Mail コンテナはこれで十分です

- :bulb: MailCatcher イメージを選択し、それをそのまま起動したコンテナができました
- :bulb: コンテナへの命令は常駐プロセスの `mailcatcher` ですが、`-d` によりバックグラウンドモードにしているのでターミナルが固まりませんでした

# コンテナ一覧を確認してみよう
3 つのコンテナが確認できれば大丈夫です

```
$ docker ps
CONTAINER ID    IMAGE                     COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher    "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
345264ac9206    ubuntu:22.04              "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

`CONTAINER ID` と `NAMES` はランダムです

# まとめ
3 つの `docker run` の使い方を紹介しました

- `docker run` はイメージからコンテナを起動するコマンド
- `-it` で `bash` などの対話操作を可能にする
- `-e` で環境変数を指定できる
- `-d` でバックグラウドで実行できる

:bulb: `docker run` は `docker pull` を含んでいるので忘れがちですが、`docker run` はイメージからコンテナを起動するとよく意識しましょう

今は自分で Ubuntu イメージに変更を加えたコンテナと、Docker Hub から取得したイメージをそのまま使っているコンテナが起動しています

![image](/images/slide/slide.008.jpeg)

- [step0](./step0.md)
- [step2](./step2.md)

