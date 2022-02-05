---
title: "🖥️ ｜ 🐧 ｜ PHP コンテナの MTA の設定をしよう"
---

# 導入
## 目的・動機
PHP のインストールと同様に、このワークで必要になる MTA もインストールしておきます。

その際に PHP と MTA の設定ファイルが必要になるため、イメージに設定ファイルを配置する方法を知りましょう。

## このページで初登場するコマンド
特になし

# メール送受信の基礎知識
## MUA とは
Mail User Agent とは、メールを送信するソフトウェアのことです。

## MTA とは
Mail Transfer Agent とは、ネットワーク上でメールを転送するソフトウェアのことです。

MUA でユーザが送信したメールを宛先に基づいて振り分け相手の MDA に転送します。

主な MTA には Sendmail や Postfix や qmail というものがあります。

## MDA とは
Mail Delivery Agent とは、MTA が振り分けたメールの送信や転送を行うソフトウェアのことです。

実態としては MTA と一体化していることが多いです。

## MRA とは
Mail Retrieval Agent とは、受信側が送られてきたメールを受け取り保管し、ユーザのメールソフトなどに引き渡すソフトウェアのことです。

MRA は MTA とは独立して提供されることが多いです。

## SMTP とは
Simple Mail Transfer Protocol は MTA にメールを送信する際に用いるプロトコルです。

デフォルトで 25 番ポートを使います。

## POP3 / IMAP とは
Post Office Protocol Version 3 は MTA からメールを受信する際に用いるプロトコルです。

デフォルトで 110 番ポートを使います。

Internet Message Access Protocol も MTA からメールを受信する際に用いるプロトコルです。

デフォルトで 143 番ポートを使います。

POP3 では受信したメールをローカルにダウンロードして保存し、サーバからは削除します。

IMAP では受信メールをサーバ上に保管したままメールソフトで閲覧します。

## まとめ
todo e

# このワークにおける代替品
## MUA とは
Mail User Agent は、なんだろう。todo

## MTA とは
Mail Transfer Agent は、メールを送信するコンテナとメールを受信するコンテナに必要です。

メールを送信するコンテナは PHP コンテナなので、そこに SMTP クライアントである `msmtp` と `msmtp-mta` をインストールします。

メールを受信するコンテナは Mail コンテナで、MailHog 自体が MTA を含む SMTP サーバです。

## MDA とは
Mail Delivery Agent は `msmtp-mta` および MailHog に含まれています。

## MRA とは
Mail Retrieval Agent は、このワークでは MailHog となります。

MailHog コンテナの保持している受信メールをブラウザで確認することになるので、受信プロトコルは IMAP になるでしょう。

## まとめ
このワークでメール送受信をするために必要なものは 2 つです。

1. 受信側となる MailHog
2. 送信に必要な SMTP クライアント ( `msmtp` と `msmtp-mta` )

このページでは SMTP クライアントのインストールを行います。

# PHP イメージへの MTA インストールと設定
## Dockerfile の追記とビルド
PHP イメージの Dockerfile に `msmtp` と `msmtp-mta` のインストールを行う `RUN` 命令の追記が必要になります。

さらに、インストールに加え PHP が `msmtp` を使うようにするための設定ファイルと、`msmtp` が接続する SMTP サーバを指定するための設定ファイルをイメージに用意なければなりません。

まずは `mail.ini` と `mailrc` という 2 つのファイルを作成しましょう。

```
docker
|-- mysql
|   `-- Dockerfile
`-- php
    |-- Dockerfile
    |-- mail.ini
    `-- mailrc
```

`mail.ini` は PHP の設定ファイルで、PHP の `mail` メソッドを呼び出した時に使う MTA を指定するために必要です。

```txt:docker/php/mail.ini
[Mail]
sendmail_path = /usr/bin/msmtp -t
```

`mailrc` は `msmtp` の設定ファイルで、SMTP サーバのホストやポートなどを指定するために必要です。
ただし今はまだホストやポートが判明していないため、値は `todo` としておきます。

```txt:docker/php/mailrc
account default
host todo
port todo
from "notice@docekr-step-up-work.com"
```

これらのファイルをイメージの中に配置する `COPY` 命令の追記も必要になります。

結果的に発生する差分は 3 行です。


1. `apt install -yqq msmtp msmtp-mta` による `msmtp` と `msmtp-mta` のインストール
2. `mail.ini` を `/etc/php/8.0/cli/conf.d/mail.ini` に配置
3. `mailrc` を `/etc/msmtprc` に配置

Dockerfile を編集してみましょう。

:::details ワーク: Dockerfile の変更、イメージのビルド
順番に特に制約はありません。

これは人間の理解のしやすさを優先して PHP のインストールと設定、MTA のインストールと設定、という順番にしていますが、`RUN` を 1 つにまとめる方針でも良いでしょう。
そこは何を重視するかで判断するポイントです。

```diff txt:docker/php/Dockerfile
  FROM ubuntu:20.04
  
  RUN apt update                                       \
   && apt install -y software-properties-common        \
   && LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php \
   && apt update                                       \
   && apt install -y php8.0 php8.0-mysql
  
+ COPY docker/php/mail.ini /etc/php/8.0/cli/conf.d/mail.ini
  
+ RUN apt install -yqq msmtp msmtp-mta
  
+ COPY docker/php/mailrc /etc/msmtprc
```

この Dockerfile では `COPY` を `docker/php/mail.ini` のように書いたので `docker build` の `<path>` は `.` です。

```
$ docker build                       \
    -f docker/php/Dockerfile         \
    -t docker-step-up-work-build_php \
    .
```

Dockerfile で `COPY` を `mail.ini` と書いたのなら `docker build` の `<path>` は `docker/php` です。
:::

# まとめ
- メール送信側は SMTP クライアントのインストールと設定が必要である
- MTA のインストールと設定ファイルが必要になったので、Dockerfile を変更した
- Dockerfile を変更したので、イメージを再ビルドした
