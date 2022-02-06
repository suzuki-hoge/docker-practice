---
title: "2-1: コンテナの基礎１ 起動"
---

todo 〜〜のためののコンテナについて理解します。

# このページで初登場するコマンドとオプション
## コンテナを起動する
```:新コマンド
$ docker container run [option] <image> [command]
```

```:旧コマンド
$ docker run [option] <image> [command]
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-i, --interactive`   | コンテナの標準入力に接続する | コンテナを対話操作する
`-t, --tty`   | 擬似ターミナルを割り当てる   | コンテナを対話操作する

## コンテナ一覧を確認する
```:新コマンド
$ docker container ls [option]
```

```:旧コマンド
$ docker ps [option]
```

### オプション
このページで新たに使うオプションはなし

# コンテナとは todo

# コンテナの起動と終了の基礎
## コンテナの起動
コンテナの起動は `docker container run` で行います。

```:新コマンド
$ docker container run [option] <image> [command]
```

Ubuntu コンテナを起動して `bash` を操作したいので、それぞれ次のように指定します。

- `[otpion]` → `bash` を使うので `--interactive` と `--tty` ( 詳細は下部 )
- `<image>` → Ubuntu コンテナを起動したいので `ubuntu`
- `[command]` → 起動したコンテナで `bash` を使いたいので `bash`

以上を踏まえ、次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run --interactive --tty ubuntu bash

#
```

:::message
この Book では `$` をホストマシン、`#` をコンテナとして使い分けます。

また、出力は見やすいように空行や余白を入れたり、要点となるところ以外をカットしたりしています。ご了承ください。
:::

プロンプトが `$` から `#` に切り替わりました。ここはもう Ubuntu の中です。

ためしに OS 情報 ( `lsb-release` ) を見てみると、起動した Ubuntu の情報が確認できます。

```:Container
# cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

ただこれだけで Ubuntu を起動することができました。

## コンテナ一覧の確認
コンテナ一覧の確認は `docker container ls` で確認できます。

```:新コマンド
$ docker container ls [option]
```

`docker container run` を実行したターミナルのタブをそのままにして、別のタブを開きコンテナ一覧を確認してみます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND   CREATED         STATUS         PORTS     NAMES
953db932c235   ubuntu    "bash"    5 minutes ago   Up 5 minutes             reverent_lederberg
```

コンテナが 1 つ起動していることが確認できます。

`IMAGE` は指定した `ubuntu` で、`COMMNAD` も指定した `bash` です。
`CONTAINER ID` と `NAMES` はランダムで割り振られた値になっています。

コンテナの状態を確認するときは、とにかく `docker container ls` を使います。

## コンテナのプロセスを終了する
`docker container run` をしたタブに戻り、`exit` で `bash` を終了しましょう。

```:Container
# exit

$
```

プロンプトが `#` から `$` に切り替わり、ホストマシンに戻ってきたことがわかります。

この状態でコンテナ一覧を確認してみると、コンテナが終了していることが確認できます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

コンテナに対して明示的な終了をしていないのに、なぜコンテナは終了したのでしょうか。

## コンテナの寿命について
コンテナは 1 つにつき 1 つの命令を実行します。

さきほど起動した `ubuntu` コンテナが受けた命令は、`docker container run` の `[command]` で指定した `bash` です。

コンテナ ( `ubuntu` ) は起動すると、受けた命令 ( `bash` )を実行してそのプロセスを作ります。

```:todo picture
+---- コンテナ ----+
|  +- プロセス -+  |
|  |   bash   |  |
|  +----------+  |
+----------------+
```

そのプロセスが生きている限りコンテナは生き続け、プロセスの終了とともにコンテナは終了します。

```:todo picture
+---- コンテナ ----+
|                |
|                |     →     終了
|                |
+----------------+
```

`bash` を `exit` で終了したため、それが命令だったコンテナは役目を終えて終了したのです。

さきほどは `[command]` に `bash` を指定しましたが、今度は `cat /etc/lsb-release` という命令を与えてみます。

```:Host Machine
$ docker container run ubuntu cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"

$
```

さきほど命令した `bash` は対話操作を行う命令だったのでプロンプトが `#` に切り替わりましたが、`cat` ではプロンプトは変わらずにすぐホストマシンでの操作が行える状態になりました。

この状態でコンテナ一覧を確認すると、コンテナが 1 つも起動していないことが確認できます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```


コンテナが受けた `cat` 命令は `bash` と違い即時完了するので、それに連動してコンテナが終了したからです。

コンテナが終了する条件をよく理解しましょう。

## コンテナとの対話について
このページで実行した 2 つの `docker container run` コマンドでオプションの有無が違うことが気になったかもしれません。

```:Host Machine
$ docker container run --interactive --tty ubuntu bash
```

```:Host Machine
$ docker container run ubuntu cat /etc/lsb-release
```

`--interactive` と `--tty` は `bash` などを起動してコンテナと対話する時に必要になるオプションです。

`--interactive` は todo のためのオプションで、`--tty` は todo のためのオプションです。
付け忘れると標準入出力が使えないので即時ホストマシンのターミナルに戻ってきてしまいます。

```:Host Machine
$ docker container run ubuntu bash

$
```

一方で、`cat /etc/lsb-release` のような対話をしない命令には必要ありませんが、付けても問題はありません。

```:Host Machine
$ docker container run --interactive --tty ubuntu cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"

$
```

付けて悪さをすることはないので、ショートオプションの `-i` と `-t` をあわせて常に `-it` を指定する癖があっても良いくらいですが、この Book では訓練の意味を込めて必要な時にロングオプションを使うようにします。
