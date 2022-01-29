---
title: "📚 ｜ 🐳 ｜ コンテナって？"
---
# イメージとコンテナ
概要を理解したところで、Docker のコマンドを実際に使ってみましょう

:::message
この段落で使うコマンドのオプションなどや Dockerfile の書き方は、次以降の章で細かく説明します
:::

:::message
この段落ではこれ以降のワークとは関係のない適当な作業ディレクトリを 2 つ作ります
:::

## コンテナを起動してみる
まずはコンテナを起動してみましょう

次のコマンドは Ubuntu コンテナを起動する `docker run` コマンドです

```
$ docker run -it ubuntu:22.04

# cat /etc/lsb-release
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu Jammy Jellyfish (development branch)"
```

`docker run` を実行するとプロンプトが切り替わり、もう Ubuntu コンテナの中にいる状態になります

OS 情報 ( `lsb-release` ) を見てみると、起動した Ubuntu の情報が確認できます

:::message
この Book では `$` プロンプトをホストマシン、`#` プロンプトをコンテナとします
:::

`docker run` を実行したターミナルのタブをそのままにして、別のタブでコンテナ一覧を確認してみます

```
$ docker ps

CONTAINER ID    IMAGE           COMMAND    CREATED          STATUS          PORTS    NAMES
c8cabbe7b1ae    ubuntu:22.04    "bash"     4 minutes ago    Up 4 minutes             sharp_galileo
```

`ubuntu:22.04` が起動していることが確認できました

`docker run` を実行したターミナルのタブに戻り、コンテナで `exit` しましょう

```
# exit
```

もう一度コンテナ確認すると、`ubuntu:22.04` が終了していることが確認できます

```
$ docker ps

CONTAINER ID    IMAGE           COMMAND    CREATED          STATUS          PORTS    NAMES
```

## コンテナのライフサイクル
コンテナは 1 つのコンテナにつき 1 つの命令を実行します

今起動した `ubuntu:22.04` コンテナが実行した命令は、あらかじめ命じられていた `bash` でした

コンテナは起動すると、受けた命令を実行してそのプロセスを作ります

そのプロセスが生きている間が、コンテナの生きている期間になります

先ほどの手順を振り返ると

1. `$ docker run` でコンテナを起動 ( コンテナの受けた命令は `bash`  )
1. `bash` が始まったので `#` プロンプトに切り替わる
1. `$ docker ps` でコンテナ一覧を確認 ( 起動中 )
1. `# exit` で `bash` を終了
1. コンテナは命令を完遂したので終了する
1. `$ docker ps` でコンテナ一覧を確認 ( 終了済 )

という流れでした

## コンテナのデフォルト命令を変える
この `ubuntu:22.04` は `bash` しかできないわけではありません

命令は `docker run` で上書きすることもできます

```
$ docker run ubuntu:22.04 cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu Jammy Jellyfish (development branch)"
```

このように末尾に命令を書くことで、コンテナの命令を上書きすることができます

さっきは `bash` が起動しましたが、今回は `cat /etc/lsb-release` が実行されました

この状態でコンテナ一覧を確認するとどうなるでしょうか

考えてから実行してみてください

:::details 結果
```
$ docker ps

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

コンテナは命令を完遂すると終了します

今回受けた命令は `cat` 一発だけだったので、その完了とともにコンテナは即時終了しました
:::

このワークでは最終的に 3 つのコンテナを起動します

![image](/images/slide/slide.007.jpeg)

この章の目標はコンテナの起動を通して、`docker run` を理解することです

- [コマンドライン・リファレンス ( run )](http://docs.docker.jp/v19.03/engine/reference/commandline/run.html)
