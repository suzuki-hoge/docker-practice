---
title: "📚 ｜ 🐳 ｜ イメージってなに？"
---

# 導入
## 目的・動機
全ての操作で必要になるイメージの基礎知識を習得しましょう。

## このページで初登場するコマンド
[`docker pull [option] <image>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/pull/)

オプション | 意味 | 用途  
:-- | :-- | :--

[`docker image ls [option]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/image_ls/)

オプション | 意味 | 用途  
:-- | :-- | :--

# イメージの基礎知識
## イメージとは
イメージはコンテナの実行に必要なパッケージで、ファイルやメタ情報を集めたものです。

イメージは複数のレイヤーというものからなる情報のことであり、実際には `.img` のような 1 つのファイルは存在しません。

todo e

イメージにはたとえば次のような情報が含まれています。

- OS は何か
- 何をインストールしてあるか
- 環境変数はどうなっているか
- どういう設定ファイルを配置しているか
- デフォルトの命令はなにか

## イメージの指定
イメージは `イメージ名:タグ名` 形式で指定されることが多いです。

イメージ名はたとえば `ubuntu` で、それにバージョンや構成内容のバリエーションの数だけタグ名が付いています。

たとえば前のページで使った `ubuntu:20.04` の他に、 `ubuntu:22.04` や `ubuntu:21.10` などがあります。

コンテナを起動して OS 情報を見てみましょう。

```
$ docker run ubuntu:22.04 cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu Jammy Jellyfish (development branch)"
```

```
$ docker run ubuntu:21.10 cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=21.10
DISTRIB_CODENAME=impish
DISTRIB_DESCRIPTION="Ubuntu 21.10"
```

`ubuntu:22.04` と `ubuntu:21.10` の出力が違うことからも、この 2 つは違うイメージであることが理解できます。

また、タグには必ず `:latest` というタグがあり、タグを省略した場合は `:latest` を指定したことになります。

```
$ docker run ubuntu:latest cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

```
$ docker run ubuntu cat /etc/lsb-release
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

## イメージの選定
Ubuntu のバージョンは  2022/02 時点でそれぞれ次の通りで、`lsb-release` の `DISTRIB_DESCRIPTION` と一致します

- `20.04` が長期サポート ( LTS )
- `21.10` が最新リリース
- `22.04` は開発中 ( コードネーム Jellyfish )

バージョンを明記するか `latest` を使うかは、イメージのタグをよくみて用途に応じて決めると良いでしょう。

この Book では今後結果が大きく変わらないように `latest` ではなく LTS ( Long Term Support ) である `20.04` を明示して使うことにします

## イメージの取得
イメージは基本的に [Docker Hub](https://hub.docker.com/) から `docker pull` で取得できます。

```txt:docker pull
$ docker pull [option] <image>
```

CentOS を取得してみましょう。

```
$ docker pull centos:latest
```

取得したイメージは `docker image ls` で確認できます

```txt:docker image ls
$ docker image ls [option]
```

```
$ docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED        SIZE
centos        latest    e6a0117ec169    4 months ago    272MB
ubuntu        22.04     63a463683606    3 hours ago    70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago    69.9MB
ubuntu        latest    9f4877540c73    3 hours ago    65.6MB
```

実は `docker run` には `docker pull` が内包されており、ここまでに実行した `ubuntu` のイメージも全て `pull` したことになっています。

基本的には `docker run` で十分なので、この Book では `docker pull` は行わずに `docker run` で済ませることにします。

## イメージを探す
使うイメージは [Docker Hub](https://hub.docker.com/) で検索して選ぶことになるでしょう。

![image](/images/docker-hub-ubuntu-search.png)

[Tags](https://hub.docker.com/_/ubuntu?tab=tags) から都合の良いバージョンや構成内容を選び、記載してあるコマンドで取得・実行ができます。

![image](/images/docker-hub-ubuntu-tags.png)

## イメージの中身を調べる
イメージの中身を詳細に把握するのは難しいですが、それでもいくつかの情報は読み取れます。

まずは対応しているホスト OS のアーキテクチャが何かです。

![image](/images/docker-hub-ubuntu-archs.png)

一般的な Windows や Mac では `linux/amd64` か`linux/x86_64` があれば大丈夫です。
M1 Mac だと `linux/arm64/v8` があれば大丈夫です。

`linux/amd64` か `linux/x86_64` はまず存在しますが、`linux/arm64/v8` はないことが多いです。

OS のアーキテクチャについて興味のある方は、以前公開した別の Book をご覧ください。

https://zenn.dev/suzuki_hoge/books/2021-07-m1-mac-4ede8ceb81e13aef10cf

それからイメージの [詳細](https://hub.docker.com/layers/ubuntu/library/ubuntu/latest/images/sha256-57df66b9fc9ce2947e434b4aa02dbe16f6685e20db0c170917d4a1962a5fe6a9?context=explore) です

![image](/images/docker-hub-ubuntu-cmd.png)

デフォルト命令が `bash` であることが読み取れます。
これは `docker run` で `[command]` を指定しなかった場合は `bash` とする、という情報がイメージに含まれていることを意味します。

このイメージはシンプルな構成ですが、セットアップ手順や環境変数が読み取れるような場合もあります。

# まとめ
- イメージはコンテナ実行に必要な情報の詰まったパッケージである
- Docker Hub で探して、`docker run` ( `docker pull` ) で取得して使うことができる
- `docker run` はイメージからコンテナを起動するコマンドである  

```txt:todo picture
イメージ    --- docker run --->    コンテナ
```