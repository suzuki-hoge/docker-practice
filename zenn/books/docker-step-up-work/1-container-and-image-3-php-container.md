---
title: "🖥️ ｜ 🐳 ｜ Ubuntu コンテナで PHP が動くようにしよう"
---

# 導入
## 目的・動機
PHP のコンテナを必要としているなら実際は PHP の公式イメージを使う方がいろいろ入っていて楽ですが、今回はあえて自分で PHP をインストールすることにします。

公式イメージを使ったとしてもプロジェクト固有の設定をすることは珍しくないため、イメージを拡張できるようになっておきましょう。

## このページで初登場するコマンド
特になし

# Ubuntu コンテナを起動して PHP をインストールしよう
## ベースとなるイメージからコンテナを起動する
まずはベースとなる Ubuntu コンテナを起動します。
( [Docker Hub - ubuntu](https://hub.docker.com/_/ubuntu) )

:::details ワーク: ubuntu:20.04 コンテナを起動し bash を命令
```
$ docker run -it ubuntu:20.04 bash

#
```

`-it` が必要です。
:::

## コンテナの bash で PHP をインストールする
Ubuntu への PHP8 のインストール手順は次の通りです、起動した Ubuntu コンテナの `bash` で実行しましょう。
途中でターミナルに何か聞かれますが、適当に答えつつ先に進みましょう。

```
# apt update
# apt install -y software-properties-common
# LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
# apt update
# apt install -y php8.0 php8.0-mysql
```

Ubuntu コンテナに接続さえしてしまえば、そこから先で要求されるのは Docker ではなく Linux の知識です。

この Book では Linux に関する知識は割愛するため、インストール手順の詳細な解説は行いません。

正常に終了すると、PHP のバージョンが確認できます。

```
# php -v

PHP 8.0.14 (cli) (built: Dec 20 2021 21:22:57) ( NTS )
Copyright (c) The PHP Group
Zend Engine v4.0.14, Copyright (c) Zend Technologies
    with Zend OPcache v8.0.14, Copyright (c), by Zend Technologies
```

# まとめ
- ベースになるイメージを起動して、そこに自分で何かをインストールすることがある
- インストール作業は Linux の知識が必要になることが多く、これは Docker とはほぼ関係のない作業である

これで PHP が実行できる環境が手に入りました。
