---
title: "３部: イメージの作成"
---

[２部]() で学んだことを実践して、３コンテナ分のイメージを用意します。

![image](/images/structure/structure.057.jpeg)

# このページでやること
- Dockerfile の作成
- `docker image build` の実行

# 作業を始める前に
イメージを作る前に、簡単にいくつか整理しておきます。

## App コンテナについて
この本では [Ubuntu](https://hub.docker.com/_/ubuntu) イメージをベースにして、自分で PHP とメール送信のコマンドをインストールしたり設定を行ったりします。

PHP のインストールから行うのは学習のためであり、実運用では Docker Hub で **言語やフレームワークの公式イメージの中から選んだイメージをベースにする** ことが多いです。
とはいえそれらの公式イメージがそのまま未設定で用途に合致することは多くないため、**イメージの作成は必要スキル** です。

:::message
PHP の場合は、通常は言語のセットアップとは別に Apache や Nginx をセットアップしますが、この本では PHP の [ビルトインウェブサーバー](https://www.php.net/manual/ja/features.commandline.webserver.php) を使います。
これは PHP 自体を簡易な Web サーバにすることができる **開発環境のための PHP の標準機能** です。

Apache や Nginx で構築しておかないとコンテナをそのままリリースできなくなってしまうので、この構成は演習に限るとご理解ください。
:::

## DB コンテナについて
この本では [MySQL](https://hub.docker.com/_/mysql) イメージを使います。
簡単な設定をするくらいで、ほぼ公式の通り使います。

**実運用もほぼ同じ手間で使う** ことになるでしょう。

## Mail コンテナについて
この本では [MailHog](https://hub.docker.com/r/mailhog/mailhog) というイメージを取得して、一切手を入れずそのまま使います。

MailHog はモックのメールサーバを起動してくれる OSS で、ここに向かって送信したメールは実際には送信されません。
送信したメールの内容は、MailHog の Web サーバで確認することになります。

**実運用でも同じように活用する** ことができます。

## イメージの取得と作成について
全体構成図のこのページでハイライトしている部分は次のように `image pull` と `image build` の２コマンドがあります。

![image](/images/structure/structure.057.jpeg)

厳密に分割すると `image pull` と `image build` は次のように細分化できますが、`image build` の初回実行時に `image pull` も実行されるので、明示的に分けて実行することはあまりありません。

![image](/images/structure/structure.058.jpeg)

![image](/images/structure/structure.059.jpeg)

この本でも `image build` に絞って解説します。

# App イメージの作成
App イメージを作るための Dockerfile は、次の内容を実現する５命令です。

- ベースイメージの指定
- PHP のインストール
- PHP の設定ファイルを追加
- msmtp のインストール
- msmtp の設定ファイルを追加

![image](/images/structure/structure.060.jpeg)

まずは `docker/app/Dockerfile` を作成してください。

## ベースイメージの指定
ベースイメージの指定は `FROM` で行います。

本来は使うイメージは Docker Hub で探しますが、Ubuntu イメージは１部で使った `ubuntu:20.04` を使うことにするので探すのは割愛します。

以上を踏まえ、`Dockerfile` を次のように編集します。

```Dockerfile:docker/app/Dockerfile
FROM ubuntu:20.04
```

## PHP のインストール
インストールなどの Linux 操作は `RUN` で行います。

基本的に **`RUN` を書く場合に求められるのは Docker の知識ではなく Linux の知識** であることが大半です。
そのため検索ワードに `docker` などをつける必要はなく、むしろ `ubuntu php8 install` のように OS 名を指定する方が良いでしょう。

以上を踏まえ、調べてわかった手順を `Dockerfile` の末尾に書き加えます。

```Dockerfile:docker/app/Dockerfile
RUN apt update                                       \
 && apt install -y software-properties-common        \
 && LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php \
 && apt update                                       \
 && apt install -y php8.0 php8.0-mysql
```

## PHP の設定ファイルを追加
設定ファイルの追加などは `COPY` で行います。

PHP は自分でメールを送信しているわけではなく、Sendmail や msmtp のような SMTP クライアントを使ってメールを送信しており、そのコマンドの実体を設定ファイルで教えてあげる必要があります。

これも **PHP の設定なので調べ物をするときに Docker は関係ない** です。

どこに配置すれば反映できるのか調べ、次のように `Dockerfile` の末尾に書き加えます。

```Dockerfile:docker/app/Dockerfile
COPY ./docker/app/mail.ini /etc/php/8.0/cli/conf.d/mail.ini
```

それから `COPY` するためのファイルを作成しますが、まだ SMTP クライアントについて判明していないので現時点では空ファイルです。

```txt:docker/app/mail.ini
```

## msmtp のインストール
msmtp はメールサーバの SMTP クライアントです。

PHP をインストールしたときと同様に手順を調べ、次のように `Dockerfile` の末尾に書き加えます。

```Dockerfile:docker/app/Dockerfile
RUN apt install -yqq msmtp msmtp-mta
```

また、`msmtp` の実体について判明したので、先に作った PHP の設定ファイルを編集します。

```txt:docker/app/mail.ini
[Mail]
sendmail_path = /usr/bin/msmtp -t
```

## msmtp の設定ファイルを追加
最後に msmtp 自体の設定でが、これの中身は現時点ではメールサーバについて何もわからないので **まだ中身は書けません**。

`COPY` 命令の追記と空欄ファイルの作成だけやっておきます。

```Dockerfile:docker/app/Dockerfile
COPY ./docker/app/mailrc /etc/msmtprc
```

```txt:docker/app/mailrc
account default
host ???
port ???
from "service@d-prac.mock"
```

## イメージの作成
結果的に次のようになっているはずです。

```:Host Machine
$ tree docker --charset c
docker
`-- app
    |-- Dockerfile
    |-- mail.ini
    `-- mailrc
```

```Dockerfile:docker/app/Dockerfile
FROM ubuntu:20.04

RUN apt update                                       \
 && apt install -y software-properties-common        \
 && LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php \
 && apt update                                       \
 && apt install -y php8.0 php8.0-mysql

COPY ./docker/app/mail.ini /etc/php/8.0/cli/conf.d/mail.ini

RUN apt install -yqq msmtp msmtp-mta

COPY ./docker/app/mailrc /etc/msmtprc
```

TAG を決め、`Dockerfile` の場所を指定し、`COPY` するファイルのパスを考えて、次のようにビルドします。

```:Host Machine
$ docker image build             \
    --tag docker-practice:app    \
    --file docker/app/Dockerfile \
    .
```

ビルドできればまずは成功です。

# DB イメージの作成
DB イメージを作るための Dockerfile は、次の内容を実現する２命令です。

- ベースイメージの指定
- MySQL の設定ファイルを追加

![image](/images/structure/structure.061.jpeg)

まずは `docker/db/Dockerfile` を作成してください。

## ベースイメージの指定
Docker Hub で `mysql` と検索すると、[MySQL](https://hub.docker.com/_/mysql) が見つかります。

[Tags](https://hub.docker.com/_/mysql?tab=tags) を見ると主に 5.7 系と 8 系がありますが、今回は `mysql:5.7` を使います。

`OS/ARCH` の項目を見ると 8 系は `linux/arm64/v8` がありますが、5.7 系にはそれがないため、`docker container run` の `--platform` と同様のアーキテクチャを明示するオプションが必要になります。

以上を踏まえ、`Dockerfile` を次のように編集します。

```Dockerfile:docker/app/Dockerfile
FROM --platform=linux/amd64 mysql:5.7
```

## MySQL の設定ファイルを追加
これは **MySQL について調べれば簡単** です。

文字コードとログの設定をしたいので、次のように設定ファイルを作成します。

```txt:docker/db/my.cnf
[mysqld]
character_set_server = utf8                    
collation_server     = utf8_unicode_ci         
general_log          = 1                       
general_log_file     = /var/log/mysql/query.log
log-error            = /var/log/mysql/error.log

[client]
default-character-set = utf8
```

これを追加するための命令を `Dockerfile` に追記します。

```Dockerfile:docker/app/Dockerfile
COPY ./docker/db/my.cnf /etc/my.cnf
```

## イメージの作成
結果的に次のようになっているはずです。

```:Host Machine
$ tree docker --charset c
docker
|-- app
|   |-- Dockerfile
|   |-- mail.ini
|   `-- mailrc
`-- db
    |-- Dockerfile
    `-- my.cnf
```

```Dockerfile:docker/db/Dockerfile
FROM --platform=linux/amd64 mysql:5.7

COPY ./docker/db/my.cnf /etc/my.cnf
```

TAG を決め、`Dockerfile` の場所を指定し、`COPY` するファイルのパスを考えて、次のようにビルドします。

```:Host Machine
$ docker image build            \
    --tag docker-practice:db    \
    --file docker/db/Dockerfile \
    .
```

ビルドできればまずは成功です。

## Mail イメージの作成
先述の通り [MailHog](https://hub.docker.com/r/mailhog/mailhog) はそのまま使うため、ビルドは必要ありません。

イメージの取得も `docker container run` についでにやってもらうことにするので、`docker image pull` すら必要ありません。

`mailhog/mailhog:v1.0.1` というイメージ名だけ控えておきましょう。

# 初めて構築するときは
この本ではいきなり Dockerfile を書きましたが、**構築手順が定かではない場合はこの方法は効率が悪い** です。

「PHP のインストールってこれでいいのかな」「`msmtp` ってどこにインストールされてオプションは何があるんだろうか」という状態なら、**一度ただベースイメージを起動して自分で `bash` で試行錯誤する** とよいでしょう。

![image](/images/structure/structure.062.jpeg)

Dockerfile をゼロから書く場合は、基本的には「ベースイメージをただ起動して `bash` で試す」「そこで動いたコマンドを Dockerfile にペーストする」というサイクルになるでしょう。

![image](/images/structure/structure.063.jpeg)

# まとめ
コンテナの起動は次の [３部]() で行うので、このページではイメージのビルドが成功していれば十分です。

todo github commit

## やったこと
- App コンテナ
  - `FROM` でベースイメージを指定
  - `RUN` で PHP をインストール
  - `COPY` で PHP の使う SMTP クライアントを設定
  - `RUN` で msmtp をインストール
  - `COPY` で SMTP サーバとの接続を設定 ( **ただし未完成** )
- DB コンテナ
  - `FROM` でベースイメージを指定 ( `--platform` の明示あり )
  - `COPY` で文字コードとログを設定 
- Mail コンテナ
  - 特になし

## ポイント    
- `RUN` を書く場合に求められるのは **Linux の知識**    
- 手順が定かでない場合、 **まずはコンテナを起動して手作業してみる** のが大事

## できるようになったこと
- `docker image build` の正常終了

![image](/images/structure/structure.057.jpeg)

## やりきれなかったこと
- App コンテナのメールサーバの接続設定
  - 解決は [３部]()
