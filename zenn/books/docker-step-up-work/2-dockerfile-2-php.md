---
title: "🖥️ ｜ 🐳 ｜ PHP イメージを作ってコンテナ起動を早くしよう"
---

# 目的・動機
前のページ todo でコンテナは状態を残せないことがわかりました。

Ubuntu コンテナを起動するたびに毎回 PHP のインストールをするのでは時間がかかりすぎるので、PHP のインストールされた Ubuntu イメージを作って解消できるようになりましょう。

# PHP の入っているイメージを作ろう
イメージを作成するには Dockerfile を記述します。

このワーク ( および大半の実プロジェクト ) では複数の Dockerfile と追加のファイルが必要になるので、ディレクトリを作成しておくことにします。

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

:white: Dockerfile はイメージではないので、`docker run` することはできません

Dockerfile がカレントディレクトリにないのでオプションで指定する必要があります。
イメージの名前は `docker-step-up-work-build_php` にしましょう。
パスは `.` です。

ビルドが成功したらイメージ一覧を確認しましょう。

:::details ワーク: Dockerfile をビルド、イメージを確認
Dockerfile の指定は `-f` で、イメージ名の指定は `-t` で行います。

```
$ docker build -f docker/php/Dockerfile -t docker-step-up-work-build_php .
```

イメージの一覧は `docker image ls` で確認します。

```
$ docker image ls | grep step-up
docker-step-up-work-build_php    latest    176ddd804a12    1 hours ago    303MB
```
:::

Dockerfile からイメージを作れたので、コンテナを起動することができるようになりました。

コンテナ起動直後に PHP が使えそうか確認してみましょう。

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
$ docker run -it docker-step-up-work-build_php which php

/usr/bin/php

$
```
:::

これで `ubuntu:20.04` ではなく `docker-step-up-work-build_php` を起動すればすぐ PHP が使えるようになりました。


# まとめ
`docker build` を紹介しました

![image](/images/slide/slide.010.jpeg)

- コンテナは状態を持たないし、他のコンテナとも共有しない
- コンテナで頻繁に使うものはイメージに入っていないと効率が悪い
- Dockerfile でイメージを拡張することができる
- `docker build` は Dockerfile を指定してイメージを作成するコマンド
- `FROM` でベースイメージを指定する
- `RUN` でイメージを上書きしていく
- イメージがビルドできたら、`docker run` などのルールは Docker Hub から取得したものと全く同じ

コンテナは状態を持たないことと、イメージに変更を加えたい場合は Dockerfile を書くということを覚えておきましょう

- [step2](books/docker-step-up-work/bk/step2.mder-step-up-work/bk/step2.md)
- [step4](books/docker-step-up-work/bk/step4.mder-step-up-work/bk/step4.md)

