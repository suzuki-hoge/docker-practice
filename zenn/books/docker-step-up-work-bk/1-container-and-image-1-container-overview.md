---
title: "📚 ｜ 🐳 ｜ コンテナってなに？"
---

# 導入
## 目的・動機
全ての操作で必要になるコンテナの基礎知識を習得しましょう。

## このページで初登場するコマンド
[`docker run [option] <image> [command] [arg...]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/run/)

オプション | 意味 | 用途  
:-- | :-- | :--
`-i, --interactive`   | コンテナの標準入力に接続する | コンテナを対話操作する
`-t, --tty`   | 擬似ターミナルを割り当てる   | コンテナを対話操作する ( todo )

[`docker ps [optioin]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/ps/)

オプション | 意味 | 用途  
:-- | :-- | :--

# 軽く触りながら理解を進める
## Ubuntu コンテナを起動してみる
コンテナの起動は `docker run` で行います。

```txt:docker run
$ docker run [option] <image> [command] [arg...]
```

Ubuntu を起動したいので `<image>` に `ubuntu:20.04` を、起動したコンテナで `bash` を使いたいので `[command]` には `bash` を指定します。

`bash` を使う時は `-i` と `-t` オプションをつける必要があります。 ( 詳細はこのページで後述 )

以上を踏まえ、次のコマンドでコンテナを起動してみましょう。

```
$ docker run -it ubuntu:20.04 bash

#
```

:::message
この Book では `$` をホストマシン、`#` をコンテナとして使い分けます。

また、出力は見やすいように空行や余白を入れたり、要点となるところ以外をカットしたりしています。ご了承ください。
:::

プロンプトが `$` から `#` に切り替わりました。

`#` プロンプトになったこのターミナルは、もう Ubuntu の世界です。
ためしに OS 情報 ( `lsb-release` ) を見てみると、起動した Ubuntu の情報が確認できます。

```
# cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

ただこれだけで Ubuntu を起動することができました。

## コンテナの一覧を確認してみる
コンテナの一覧は `docker ps` で確認できます。

```txt:docker ps
$ docker ps [option]
```

`docker run` を実行したターミナルのタブをそのままにして、別のタブでコンテナ一覧を確認してみましょう。

```
$ docker ps

CONTAINER ID    IMAGE           COMMAND    CREATED          STATUS          PORTS    NAMES
c8cabbe7b1ae    ubuntu:20.04    "bash"     4 minutes ago    Up 4 minutes             sharp_galileo
```

`ubuntu:20.04` が起動していることが確認できます。

`CONTAINER ID` と `NAMES` はランダムで割り振られるので、この Book と手元の結果は一致しないでしょう。

コンテナの状態を確認する時は、とにかく `docker ps` を使います。

## Ubuntu の bash を終了してみる
`docker run` をしたターミナルのタブに戻り、`exit` で `bash` を終了しましょう。

```
# exit

$
```

プロンプトが `#` から `$` に切り替わり、ホストマシンに戻ってきたことがわかります。

この状態でコンテナ一覧を確認してみると、コンテナが終了していることが確認できます。

```
$ docker ps

CONTAINER ID    IMAGE     COMMAND    CREATED          STATUS          PORTS    NAMES
```

コンテナに対して明示的な終了を伝えていないのに、なぜコンテナは終了してしまったのでしょうか。

## コンテナのライフサイクルについて
コンテナは 1 つにつき 1 つの命令を実行します。

今起動した `ubuntu:20.04` コンテナが受けた命令は、`docker run` の `[command]` で指定した `bash` です。
これは `docker ps` の `COMMAND` を見ても確認できます。

( 再掲 )
```
$ docker ps

CONTAINER ID    IMAGE           COMMAND    CREATED          STATUS          PORTS    NAMES
c8cabbe7b1ae    ubuntu:20.04    "bash"     4 minutes ago    Up 4 minutes             sharp_galileo
```

コンテナは起動すると、受けた命令を実行してそのプロセスを作ります。

```txt:todo picture
+---- コンテナ ----+
|  +- プロセス -+  |
|  |   bash   |  |
|  +----------+  |
+----------------+
```

そのプロセスが生きている限りコンテナは生き続け、プロセスの終了とともにコンテナは終了します。


```txt:todo picture
+---- コンテナ ----+
|                |
|                |     →     終了
|                |
+----------------+
```

`bash` が `exit` で終了したため、それが命令だったコンテナは役目を終えて終了したのです。

## コンテナへの命令を変えてみる
先ほどは `[command]` に `bash` を指定しましたが、今度は `cat /etc/lsb-release` という命令を与えてみます。

```
$ docker run ubuntu:20.04 cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"

$
```

先ほどは `bash` が命令だったのでプロンプトが `#` に切り替わり操作可能になりましたが、`cat` ではそうならずホストマシンのプロンプトに戻ってきました。

このターミナルのタブでコンテナ一覧を確認するとどうなるでしょうか。

:::details ワーク: 結果の予想、コンテナ一覧の確認
```
$ docker ps

CONTAINER ID    IMAGE     COMMAND    CREATED          STATUS          PORTS    NAMES
```

コンテナは何も起動していません。
これはコンテナが受けた命令 ( `cat` ) が終了したので、それに連動してコンテナが終了したからです。
:::

コンテナが終了する理由をよく把握しましょう。

## -it オプションについて
このページで実行した 2 つの `docker run` コマンドで `-it` の有無が違うことが気になったかもしれません。

```
$ docker run -it ubuntu:20.04 bash
```
```
$ docker run ubuntu:20.04 cat /etc/lsb-release
```

`-it` は `bash` などを起動してコンテナと対話する時に必要になるオプションです。

`-it` は `-i` と `-t` をまとめて指定する方式で、あえて長いオプション名で個別に指定すると次のようになります。

```
$ docker run --interactive --tty ubuntu:20.04 bash
```

`--interactive` は todo のためのオプションで、`--tty` は todo のためのオプションです。

`bash` など対話で操作する命令には `-it` が必要になります。
付け忘れると標準入出力が使えないので即時ホストマシンのターミナルに戻ってきてしまいます。

```
$ docker run ubuntu:20.04 bash

$
```

一方で、`cat /etc/lsb-release` のような対話をしない命令には必要ありませんが、付けても問題はありません。

`-it` を常につける癖があっても良いくらいですが、この Book では訓練の意味を込めて必要な時だけ付与するようにしていきましょう。

# まとめ
- コンテナは `docker run` で起動する
- 1 つのコンテナは `docker run` に命じられた命令 1 つを実行する
- その命令が終了すると、コンテナも終了する
