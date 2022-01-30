---
title: "🖥️ ｜ 🐳 ｜ Ubuntu コンテナで PHP が動くようにしよう"
---

# 目的
実際に公式イメージを使っても、変更は大体の場合必要になりますし、チームメンバーの行う変更を理解するためにも自分でそれを行えることは大切です

のちにつかう

# Ubuntu コンテナを起動して PHP をインストールしよう
実際は PHP の公式イメージを使う方がいろいろ入っていて楽ですが、今回はあえて自分で PHP をインストールすることにします

まずはベースとなる Ubuntu を起動します ( [Docker Hub](https://hub.docker.com/_/ubuntu) )

:::details ワーク: ubuntu:20.04 コンテナを起動、bash を起動
コンテナの起動は `docker run [option] image [command]` です

```
$ docker run -it ubuntu:20.04 bash

#
```

`ubuntu:20.04` はデフォルト命令が `bash` なので指定しなくても大丈夫です
:::

Ubuntu への PHP8 のインストール手順は次の通りです
途中でターミナルに何か聞かれますが、適当に答えて先に進みましょう

```
# apt update
# apt install -y software-properties-common
# LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
# apt update
# apt install -y php8.0 php8.0-mysql
```

正常に終了すると、PHP のバージョンが確認できます

```
# php -v

PHP 8.0.14 (cli) (built: Dec 20 2021 21:22:57) ( NTS )
Copyright (c) The PHP Group
Zend Engine v4.0.14, Copyright (c) Zend Technologies
    with Zend OPcache v8.0.14, Copyright (c), by Zend Technologies
```

終了しておk？
[comment]: <> (Step 1 の PHP コンテナはこれで十分です)

[comment]: <> (- :bulb: ベースイメージ &#40; `ubuntu:20.04` &#41; を選択し、そこに自分で PHP をインストールしたコンテナができました)

[comment]: <> (- :bulb: コンテナへの命令は `bash` なので、`bash` を終了しない限りコンテナは終了しません)

[comment]: <> (- :bulb: コンテナの `bash` を操作するために、`-it` オプションをつけました^[厳密には `-i` と `-t` をまとめて指定しています])

[comment]: <> (- :warning: この `bash` やターミナルは終了せず、次のタブを開いて次に進んでください)
