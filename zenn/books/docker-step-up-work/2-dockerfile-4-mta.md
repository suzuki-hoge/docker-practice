---
title: "🖥️ ｜ 🐧 ｜ PHP コンテナの MTA の設定をしよう"
---

# 導入
## 目的・動機
PHP のインストールと同様に、このワークで必要になる MTA もインストールしておきます。

その際に PHP と MTA の設定ファイルが必要になるため、イメージに設定ファイルを配置する方法を知りましょう。

## このページで初登場するコマンド
[Dockerfile](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/builder/)

命令 | 意味 | 用途  
:-- | :-- | :--
`COPY` | ホストマシンのファイルをイメージにコピーする | 設定ファイルなどをイメージに含める

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
Mail User Agent は、

## MTA とは
Mail Transfer Agent は、メールを送信するコンテナとメールを受信するコンテナに必要です。

メールを送信するコンテナは PHP コンテナなので、そこに SMTP クライアントである `msmtp` と `msmtp-mta` をインストールします。

メールを受信するコンテナは Mail コンテナで、MailHog 自体が SMTP ( MTA を含む ) です。

## MDA とは
Mail Delivery Agent は `msmtp-mta` および MailHog に含まれています。

## MRA とは
Mail Retrieval Agent は、

# PHP イメージへの MTA インストール
## Dockerfile の追記とビルド
PHP イメージの Dockerfile に次の `RUN` 命令を追加し `msmtp` と `msmtp-mta` をインストールします。

```txt:docker/php/Dockerfile
RUN apt install -yqq msmtp msmtp-mta
```

PHP8 のインストールとは違い、インストールに加え PHP が `msmtptodo` を使うようにするための設定ファイルと、`msmtptodo` が接続する SMTP サーバを指定するための設定ファイルをイメージに用意なければなりません。

`mail.ini` と `mailrc` という 2 つのファイルを作成しましょう。

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

これらのファイルを `COPY` 命令でイメージの中に配置するように Dockerfile を変更します。

`RUN` による `msmtp` と `msmtp-mta` のインストールと、2 つの設定ファイルの `COPY` 命令を追記します。

`mail.ini` の配置先は `/etc/php/8.0/cli/conf.d/mail.ini` で、
`mailrc` の配置先は `/etc/msmtprc` です。

`COPY` の相対パスと `docker build` のパスに注意してください。

:::details ワーク: Dockerfile の変更、イメージのビルド
```txt:docker/php/Dockerfile
FROM ubuntu:20.04

RUN apt update                                       \
 && apt install -y software-properties-common        \
 && LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php \
 && apt update                                       \
 && apt install -y php8.0 php8.0-mysql

COPY docker/php/mail.ini /etc/php/8.0/cli/conf.d/mail.ini

RUN apt install -yqq msmtp msmtp-mta

COPY docker/php/mailrc /etc/msmtprc
```

`COPY` を `docker/` から書いたので `docker build` の `<path>` は `.` です。

```
$ docker build                       \
    -f docker/php/Dockerfile         \
    -t docker-step-up-work-build_php \
    .
```
:::

# まとめ
- todo
- MTA のインストールと設定ファイルが必要になったので、Dockerfile を変更した
- Dockerfile を変更したので、イメージを再ビルドした
