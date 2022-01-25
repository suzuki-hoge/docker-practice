---
title: "Step 3: イメージを作成しよう"
---

この章の目標は Ubuntu への PHP インストールを操作して、Dockerfile と `docker build` を理解することです

- [コマンドライン・リファレンス ( build )](http://docs.docker.jp/v19.03/engine/reference/commandline/build.html)
- [Dockerfile リファレンス](https://docs.docker.jp/engine/reference/builder.html)

コンテナを終了してしまった場合は、Step 1 の手順で起動し直しておきましょう

# もうひとつ Ubuntu コンテナを起動してみよう
PHP コンテナのターミナルタブは残っていますね？

そこで `php -v` を行うと、結果はこの通りです

```
root@345264ac9206:/# php -v
PHP 8.0.8 (cli) (built: Dec  2 2021 16:34:27) ( NTS )
Copyright (c) The PHP Group
Zend Engine v4.0.8, Copyright (c) Zend Technologies
    with Zend OPcache v8.0.8, Copyright (c), by Zend Technologies
```

ではもう一つ Ubuntu コンテナを起動して、`php -v` を実行してみましょう

:::details 結果はどのようになるでしょうか
```
$ docker run -it ubuntu:22.04

# php -v
bash: php: command not found
```

`php` が入っていません
:::

# 起動中の PHP コンテナを停止して、また Ubuntu コンテナを起動してみよう
コンテナの停止は `docker stop` で行います

当然起動しているコンテナに対して実行するので、`docker exec` と同じく `CONTAINER ID` を指定して実行します

:::details 起動中の PHP コンテナを停止し、また起動して、`php -v` を実行しましょう
```
$ docker ps
CONTAINER ID    IMAGE                     COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher    "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
345264ac9206    ubuntu:22.04              "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha

$ docker stop 345264ac9206
345264ac9206

$ docker ps
CONTAINER ID    IMAGE                     COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher    "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier

$ docker run -it ubuntu:22.04

# php -v
bash: php: command not found
```

やはり `php` は入っていません
:::

# PHP の入っているイメージを作ろう
同じイメージから起動したコンテナ同士だとしても、コンテナは状態を共有しません

またコンテナに行った変更は、コンテナ終了時に全て破棄され残りません

これにより常にクリーンで同じコンテナが起動してくれるので安全で使いやすいのですが、流石に毎回 PHP のインストールをやるのは面倒すぎるので、PHP の入ったイメージを作成することにします

## Dockerfile を作る
イメージを作成するには Dockerfile を記述します

Step 0 で見たように、`Dockerfile` を作成してみましょう

```txt:Dockerfile
FROM ubuntu:22.04

RUN apt-get update
RUN apt-get install -y tree vim
```

これは `tree` と `vim` をインストールした時の Dockerfile です

:bulb: `FROM` はベースにするイメージで、用途に合わせて選択します

:bulb: `RUN` はベースイメージに対する追加の命令で、できあがるイメージにその行の結果を上乗せします

このようにベースイメージに `RUN` で命令を重ねることで、自分の使うものが入ったイメージを作るのが Dockerfile の基本です

Ubuntu に PHP をインストールしたコマンドを再掲しますので、Dockerfile を書いてみましょう

```
# apt-get update
# apt-get install -y software-properties-common
# LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
# apt-get update
# apt-get install -y php8.0
```

:::details Dockerfile
```
FROM ubuntu:22.04

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
RUN apt-get update
RUN apt-get install -y php8.0
```
:::

一度コンテナ内で実行した実績があるので簡単ですね

## Dockerfile からイメージを作る
Dockerfile が書けたらビルドをします

:bulb: Dockerfile はイメージではないので、`docker run` することはできません

`docker build` はカレントディレクトリにある Dockerfile を自動的に使います

`-t <image>` でイメージの名前を指定します

名前は `docker-step-up-work-build_php` にしましょう

( `docker run` や `docker exec` の `-t` とは違うオプションです )

`.` は作業ディレクトリを指定する引数なので、忘れずに付けましょう

```
$ docker build -t docker-step-up-work-build_php .
```

実行すると Dockerfile に書かれた内容が実行されながらイメージが作られます

イメージができたはずです、確認してみましょう

```
$ docker image ls | grep step-up
docker-step-up-work-build_app    latest    176ddd804a12    1 hours ago    303MB
```

イメージになったので `docker run` で起動できます

:::details 起動して PHP が入っていることを確認しましょう
```
$ docker run -it docker-step-up-work-build_php

# php -v
PHP 8.0.14 (cli) (built: Dec 20 2021 21:22:57) ( NTS )
Copyright (c) The PHP Group
Zend Engine v4.0.14, Copyright (c) Zend Technologies
    with Zend OPcache v8.0.14, Copyright (c), by Zend Technologies
```
:::

これで `ubuntu:22.04` ではなく `docker-step-up-work-build_php` を起動すればすぐ PHP が使えるようになりました

## Dockerfile を移動しておく
これから別の Dockerfile も扱うので、ディレクトリを分けておきます

`docker/php/` を作成して、そこに移動しておきましょう

```
$ tree docker
docker
└── app
    └── Dockerfile
```

`docker build` はデフォルトで作業ディレクトリの `Dockerfile` を探しますが、別の場所にあるものを明示する場合は `-f` を使います

Dockerfile を移動してもイメージをビルドし直す必要はありませんが、練習と思って再ビルドしておきましょう

:::details Dockerfile を指定してイメージをビルドするコマンド
```
$ docker build -t docker-step-up-build_php -f docker/php/Dockerfile .
```
:::

これで複数の `Dockerfile` を扱う準備ができました

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

- [step2](./step2.md)
- [step4](./step4.md)

