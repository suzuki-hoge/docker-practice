---
title: "🖥️ ｜ 🐳 ｜ Ubuntu コンテナで PHP が動くようにしよう"
---
# Ubuntu コンテナを起動して PHP をインストールしよう
実際は PHP の公式イメージを使う方がいろいろ入っていて楽ですが、今回はあえて自分で調達することにします

実際に公式イメージを使っても、変更は大体の場合必要になりますし、チームメンバーの行う変更を理解するためにも自分でそれを行えることは大切です

前の章でやったように `ubuntu:20.04` を起動して `bash` を使います

`-it` は `bash` などを起動してコンテナと対話する時に必要になるオプションです

```
$ docker run -it ubuntu:20.04

#
```

Ubuntu への PHP8 のインストール手順は次の通りです

途中でターミナルに何か聞かれたら適当に答えて先に進みましょう

```
# apt update
# apt install -y software-properties-common
# LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
# apt update
# apt install -y php8.0
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

- :bulb: ベースイメージ ( `ubuntu:20.04` ) を選択し、そこに自分で PHP をインストールしたコンテナができました
- :bulb: コンテナへの命令は `bash` なので、`bash` を終了しない限りコンテナは終了しません
- :bulb: コンテナの `bash` を操作するために、`-it` オプションをつけました^[厳密には `-i` と `-t` をまとめて指定しています]
- :warning: この `bash` やターミナルは終了せず、次のタブを開いて次に進んでください
