---
title: "2-6: イメージの基礎"
---

todo 〜〜のためののイメージについて理解します。

# このページで初登場するコマンドとオプション
## イメージを取得する
```:新コマンド
$ docker image pull [option] <image>
```

```:旧コマンド
$ docker pull [option] <image>
```

### オプション
このページで新たに使うオプションはなし

## イメージ一覧を確認する
```:新コマンド
$ docker image ls [option]
```

```:旧コマンド
$ docker images [option]
```

### オプション
このページで新たに使うオプションはなし

# イメージとは
イメージはコンテナの実行に必要なパッケージで、ファイルやメタ情報を集めたものです。

イメージは複数のレイヤーというものからなる情報のことであり、実際には `.img` のような 1 つのファイルは存在しません。

todo e

イメージにはたとえば次のような情報が含まれています。

- OS は何か
- 何をインストールしてあるか
- 環境変数はどうなっているか
- どういう設定ファイルを配置しているか
- デフォルト命令はなにか

# イメージを指定するには
イメージは `IMAGE ID` か `REPOSITORY:TAG` 形式で指定できます。
基本的には人間に扱いやすい `REPOSITORY:TAG` 形式を使うことになります。

`REPOSITORY` はたとえば `ubuntu` で、それにバージョンや構成内容を示す `TAG` が付いた状態で公開されています。
`TAG` はたとえば `ubuntu` であれば `20.04` や `21.10` や `22.04` などがあります。

`ubuntu:22.04` や `ubuntu:21.10` のイメージからコンテナを起動し OS 情報を見てみると、構成の異なるコンテナが起動していることが確認できます。

```:Host Machine
$ docker container run ubuntu:22.04 cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu Jammy Jellyfish (development branch)"
```

```:Host Machine
$ docker container run ubuntu:21.10 cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=21.10
DISTRIB_CODENAME=impish
DISTRIB_DESCRIPTION="Ubuntu 21.10"
```

また `TAG` には必ず `latest` というタグがあり、`TAG` を省略した場合は `latest` を指定したことになります。

```:Host Name
$ docker run ubuntu:latest cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

```:Host Name
$ docker run ubuntu cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

# イメージの TAG を選ぶには
Ubuntu のバージョンは  2022/02 現在ではそれぞれ次の通りです。
`lsb-release` の出力の `DISTRIB_DESCRIPTION` とも一致します。

- `22.04` → 開発中 ( コードネーム Jellyfish )
- `21.10` → 最新リリース
- `20.04` → 長期サポート ( Long Term Support )

バージョンを指定するか `latest` を使うかは、用途に応じて決めることになります。

この Book では安定して同じ結果が得られることを期待して `latest` ではなく LTS である `20.04` を明示して使うことにします。

# イメージを取得するには
イメージは基本的に [Docker Hub](https://hub.docker.com/) から `docker pull` で取得できます。

```:新コマンド
$ docker image pull [option] <image>
```

CentOS のイメージを取得します。

```:Host Machine
$ docker image pull centos:latest
```

# イメージ一覧を確認するには
ホストマシンにあるイメージ一覧を確認するには、`docker image ls` を使います。

```:Host Machine
$ docker image ls

REPOSITORY   TAG      IMAGE ID       CREATED        SIZE
centos       latest   e6a0117ec169   4 months ago   272MB
ubuntu       22.04    63a463683606   4 weeks ago    70.4MB
ubuntu       21.10    2a5119fc922b   4 weeks ago    69.9MB
ubuntu       20.04    9f4877540c73   4 weeks ago    65.6MB
ubuntu       latest   9f4877540c73   4 weeks ago    65.6MB
```

実は `docker container run` には `docker image pull` が内包されており、ここまでに実行した `ubuntu` のイメージも全て取得済みとなっています。

コンテナを起動するためにイメージを取得するという基本的な使い方の場合は、`docker image pull` だけを実行するメリットがほぼありません。
そのため、この Book では `docker image pull` は個別に実行せずに `docker container run` を用いることにします。

# イメージを探すには
使うイメージは [Docker Hub](https://hub.docker.com/) で検索して選ぶことになるでしょう。

![image](/images/docker-hub-ubuntu-search.png)

[Tags](https://hub.docker.com/_/ubuntu?tab=tags) から都合の良いバージョンや構成内容を選び、記載してあるコマンドで取得・実行ができます。

![image](/images/docker-hub-ubuntu-tags.png)

# どんなイメージか知るには
イメージの中身を詳細に把握するのは難しいですが、それでもいくつかの情報は読み取れます。

まずは対応しているホスト OS のアーキテクチャが何かです。

![image](/images/docker-hub-ubuntu-archs.png)

一般的な Windows や Mac では `linux/amd64` か`linux/x86_64` があれば大丈夫です。
M1 Mac だと `linux/arm64/v8` があれば大丈夫です。

`linux/amd64` か `linux/x86_64` はまず存在しますが、`linux/arm64/v8` はないことが多いです。

OS のアーキテクチャについて興味のある方は、以前公開した別の Book をご覧ください。

https://zenn.dev/suzuki_hoge/books/2021-07-m1-mac-4ede8ceb81e13aef10cf

それからイメージの詳細です

![image](/images/docker-hub-ubuntu-cmd.png)

デフォルト命令が `bash` であることが読み取れます。
これは `docker run` で `[command]` を指定しなかった場合は `bash` とする、という情報がイメージに含まれていることを意味します。

このイメージはシンプルな構成ですが、セットアップ手順や環境変数が読み取れるような場合もあります。

詳細は todo のページで説明します。
