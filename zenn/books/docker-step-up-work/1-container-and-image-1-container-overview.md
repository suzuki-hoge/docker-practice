---
title: "📚 ｜ 🐳 ｜ コンテナってなに？"
---

# このページで初登場するコマンド
[`docker run [option] <image> [command] [arg...]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/run/)

オプション | 意味 | 用途  
:-- | :-- | :--
`-i, --interactive`   | コンテナの標準入力に接続する | コンテナを対話操作する
`-t, --tty`   | 擬似ターミナルを割り当てる   | todo
`-d, --detach`   | バックグラウンドで実行する   | ターミナルが固まるのを避ける

[`docker ps [optioin]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/ps/)

オプション | 意味 | 用途  
:-- | :-- | :--

# Ubuntu コンテナを起動してみる
コンテナの起動は `docker run` で行います

```
$ docker run [option] <image> [command] [arg...]
```

Ubuntu のコンテナを起動してみましょう

```
$ docker run -it ubuntu

#
```

プロンプトが切り替わりました

ここはもう Ubuntu の世界です
OS 情報 ( `lsb-release` ) を見てみると、起動した Ubuntu の情報が確認できます

```
# cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

✅ `docker run [option] <image> [command] [arg...]` は `<image>` を引数に取るコマンドです

# コンテナの一覧を確認する
コンテナの一覧は `docker ps` で確認します

```
$ docker ps [option]
```

`docker run` を実行したターミナルのタブをそのままにして、別のタブでコンテナ一覧を確認してみましょう

```
$ docker ps

CONTAINER ID    IMAGE     COMMAND    CREATED          STATUS          PORTS    NAMES
c8cabbe7b1ae    ubuntu    "bash"     4 minutes ago    Up 4 minutes             sharp_galileo
```

`ubuntu` が起動していることが確認できます

`CONTAINER ID` と `NAMES` はランダムで割り振られます

# コンテナのライフサイクル
コンテナは 1 つのコンテナにつき 1 つの命令を実行します

今起動した `ubuntu` コンテナが受けた命令は、`docker ps` の `COMMAND` を見ると `bash` だったことがわかります^[なぜ `bash` なのかは todo で説明します]

コンテナは起動すると、受けた命令を実行してそのプロセスを作ります

todo e

そのプロセスが生きている限りコンテナは生き続け、プロセスの終了とともにコンテナは終了します

todo e

# bash を終了する
`docker run` をしたターミナルのタブに戻り、`exit` で `bash` を終了しましょう

```
# exit

$
```

プロンプトが切り替わりホストマシンに戻ってきたことがわかります

そのターミナルのタブでコンテナ一覧を確認してみると、コンテナが `bash` に連動して終了していることが確認できます

```
$ docker ps

CONTAINER ID    IMAGE     COMMAND    CREATED          STATUS          PORTS    NAMES
```

# コンテナの命令を上書きする
`docker run` は `[command]` を指定することでコンテナへの命令を上書きすることができます

```
$ docker run [option] image [command] [arg...]
```

先ほど `bash` の命令を受けていた `ubuntu` に `cat /etc/lsb-release` という命令を与えてみます

```
$ docker run ubuntu cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"

$
```

先ほどは `bash` が命令だったのでプロンプトが `#` に切り替わり操作可能になりましたが、`cat` ではそうならずホストマシンのプロンプトのままです

このターミナルのタブでコンテナ一覧を確認するとどうなるでしょうか

:::details ワーク: 結果の予想、コンテナ一覧の確認
```
$ docker ps

CONTAINER ID    IMAGE     COMMAND    CREATED          STATUS          PORTS    NAMES
```

コンテナ一覧を見てみると、コンテナは何も起動していません

これはコンテナが受けた命令 ( `cat` ) が終了したので、コンテナが終了したからです
:::

todo: `docker run` はサーバを起動するコマンドではなく命令を実行してプロセスを起動するコマンド ( コンテナは〜？ )

# 停止
# イメージ



`-it` は `bash` などを起動してコンテナと対話する時に必要になるオプションです

`bash` などを対話で操作するつもりはないので `-it` は不要です

:::message
`-it` を付けても問題はないので常に指定する癖がついても良いくらいですが、この Book では意識して使い分けましょう
:::
