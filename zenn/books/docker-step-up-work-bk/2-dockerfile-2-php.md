---
title: "🖥️ ｜ 🐳 ｜ PHP イメージを作ってコンテナ起動を早くしよう"
---

# 導入
## 目的・動機
前のページ todo でコンテナは状態を残せないことがわかりました。

Ubuntu コンテナを起動するたびに毎回 PHP のインストールをするのでは時間がかかりすぎるので、PHP のインストールされた Ubuntu イメージを作って解消しましょう。

## このページで初登場するコマンド
特になし

# PHP の入っているイメージを作ろう
## Dockerfile を作る
イメージを作成するには Dockerfile を記述します。

このワーク ( および大半の実プロジェクト ) では複数の Dockerfile と追加のファイルが必要になるので、イメージごとにディレクトリを作成しておくことにします。

```
$ tree docker

docker
`-- php
    `-- Dockerfile
```

`docker/php/Dockerfile` を作成し、`FROM` と `RUN` を使って Dockerfile を書いてみましょう。

ベースイメージは `ubuntu:20.04` で、インストールコマンドは todo で実行した下記のコマンドです。

```
# apt update
# apt install -y software-properties-common
# LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
# apt update
# apt install -y php8.0
```

:::details Dockerfile の作成
```
FROM ubuntu:20.04

RUN apt update                                        \
 && apt install -y software-properties-common         \
 && LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php  \
 && apt update                                        \
 && apt install -y php8.0
```

`RUN` は 5 つより 1 つの方が望ましいでしょう。
その場合は横に長くなりすぎてしまうので一般には `\` で改行することが多いです。
:::

## Dockerfile からイメージを作る
Dockerfile が書けたら `docker build` でビルドします。

`./Dockerfile` ではないので `-f` での指定が必要です。
イメージに名前をつけないと使いづらいので `-t` で `docker-step-up-work-build_php` という名前をつけましょう。
パスは `.` です。

ビルドが成功したらイメージ一覧を確認しましょう。

:::details ワーク: Dockerfile をビルド、イメージを確認
Dockerfile の指定は `-f` で、イメージ名の指定は `-t` で行います。

```
$ docker build                       \
    -f docker/php/Dockerfile         \
    -t docker-step-up-work-build_php \
    .
```

イメージの一覧は `docker image ls` で確認します。
少し多くなってきたので、適当に `grep` で絞り込みます。

```
$ docker image ls | grep step-up

docker-step-up-work-build_php    latest    176ddd804a12    1 hours ago    303MB
```
:::

Dockerfile からイメージを作れたので、コンテナを起動することができるようになりました。

コンテナ起動直後に PHP が使えるか確認してみましょう。

:::details ワーク: PHP のインストールを確認
`bash` で確認する。

```
$ docker run -it docker-step-up-work-build_php bash

# php -v

PHP 8.0.14 (cli) (built: Dec 20 2021 21:22:57) ( NTS )
Copyright (c) The PHP Group
Zend Engine v4.0.14, Copyright (c) Zend Technologies
    with Zend OPcache v8.0.14, Copyright (c), by Zend Technologies
```
    
僕は `bash` を使わない方が楽なのでこうすることが多いです。

```
$ docker run docker-step-up-work-build_php which php

/usr/bin/php
```
:::

これで `ubuntu:20.04` ではなく `docker-step-up-work-build_php` を起動すればすぐ PHP が使えるようになりました。

`docker run` の後に行っていた PHP8 のインストール作業は `docker build` で行われるように変わりました。
1 回分の実行時間は同じですが、イメージをビルドした後はすぐに PHP コンテナを起動できるので、今後は格段に PHP コンテナの起動時間を短縮できるようになりました。

# まとめ
- コンテナは状態を持てないので、インストール作業をコンテナで実行すると起動のたびに必要になり非効率である
- Dockerfile でベースのイメージに追加のレイヤーを重ねる
- `docker build` で Dockerfile をイメージにビルドする
- インストールを行ったイメージがビルドできれば、それ以降のコンテナ起動の時間が大幅に短縮できる

todo e
