---
title: "Step 0: Docker の基礎を知ろう"
---

この章の目標は Docker の概要とイメージとコンテナについて簡単に理解することです

# 導入
Docker は Docker 社の開発しているプラットフォームです

VirtualBox などの仮想マシンは Hypervisor という仮想化ソフトをホスト OS の上で動かしその上でゲスト OS を動かす仕組みになっていますが、Docker コンテナは Docker Engine の上で動きます

Docker コンテナはホストマシンのカーネルを利用しつつもプロセスやネットワークを隔離することで、あたかも別のマシンが動いているように振る舞うことができます

![image](/images/slide/slide.001.jpeg)

ほげめも
- https://knowledge.sakura.ad.jp/13265/
- https://aws.amazon.com/jp/docker/

## 特徴
ゲスト OS を起動しないという点に注目すると、次のような特徴が理解しやすくなるでしょう

### 起動が早い
ゲスト OS の起動を行わないため、Docker コンテナの方が起動が速いです

![image](/images/slide/slide.002.jpeg)

そのためコンテナ構築のトライ & エラーが楽だったり、気軽にコンテナを起動することが可能だったりします

テストを実行する時だけ起動して数分で終了する、という小さいサイクルでクリーンな環境を用意することができます

### デプロイしやすい
VirtualBox などの場合、デプロイ先が Hypervisor であればデプロイは簡単でしょうが、デプロイ先のサーバをローカルで擬似的に再現するという使い方もあります

その場合はデプロイ内容にゲスト OS は含めないため、アプリケーションだけをデプロイする方法が必要になったり、デプロイ先との状態の不一致などが発生する可能性があります

![image](/images/slide/slide.003.jpeg)

Docker コンテナは Apache などと同じくただの 1 プロセスなので、アプリケーションをデプロイしやすいです

![image](/images/slide/slide.004.jpeg)

### ホスト OS の違いが影響する可能性がある
Docker コンテナは実際はホスト OS で動いているので、その違いがコンテナに影響してしまう可能性があります

![image](/images/slide/slide.005.jpeg)

そのため、Docker は Windows では相性が悪いなどの話もあるようです^[持っていないので実体験としてはわかりませんが、GitBash などで利用しているとまれに細かい挙動が違ったりすることがあるようです]^[WSL 環境はわかりません]

最近では M1 Mac で Docker を動かすのが大変というはなしもよく見かけます

仮想化技術のはずなのになんでホスト OS が違うとそんなに違うの、という疑問の理由の一つでしょう

## Docker Desktop とは
Docker Desktop は Windows や Mac で動くアプリケーションで、Docker Engine や Docker CLI や Docker Compose を含んでいます

ホストマシン上で Docker を使う場合は、これをインストールすることになります

Docker Desktop は [公式サイト](https://docs.docker.jp/desktop/index.html#desktop-download-and-install) でダウンロードできます

以降この Book では Docker Desktop がインストールしてあるものとして進めます

## Docker Hub とは
[Docker Hub](https://hub.docker.com/) はイメージ ( わかりやすく言えば ≒ Dockerfile ) を共有する Saas サービスです

ソースコードを `git push` する先のように理解すれば、まずは大丈夫です

Docker Desktop のインストールや Dockerfile の取得には、Docker Hub のアカウントやログインは必要になりません

Dockerfile を `push` するときなどは必要になりますが、この Book では行いませんので、この Book ではアカウント作成は不要です

## ちょっとまとめ
- VirtualBox などと Docker の違いの 1 つは、ゲスト OS が存在しないこと
- ローカルマシンに Docker Desktop をインストールすると一通りのことができるようになる
- Docker Hub はイメージ ( ≒ Dockerfile ) を共有するサービスで、Read に限ればアカウントは不要

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

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES</code></pre>コンテナは命令を完遂すると終了します

今回受けた命令は `cat` 一発だけだったので、その完了とともにコンテナは即時終了しました
```
:::

## イメージとは
`ubuntu:22.04` をイメージといいます

:bulb: `docker run` は `ubuntu:22.04` というイメージを指定して、コンテナを起動するコマンドということになります

イメージはコンテナの実行に必要なパッケージで、ファイルやメタ情報を集めたものです^[実際にはイメージという 1 つのファイルは存在せず複数のレイヤーからなるものですが、この Book ではそこまで解説しません]

イメージにはたとえば「OS は何か」「何をインストールしてあるか」「環境変数はどうなっているか」「どういう設定ファイルを配置しているか」そして「デフォルトの命令はなにか」などが情報として詰まっています

イメージは `イメージ名:タグ名` 形式で指定されることが多いです

たとえば `ubuntu:22.04` や `ubuntu:21.10` などや、`ubuntu:latest` などがあります

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

```
$ docker run ubuntu:latest cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

タグ名は省略すると `latest` になります

```
$ docker run ubuntu cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```


`22.04` を使うか `latest` を使うかは、用途に応じて決めると良いでしょう

`latest` の場合は常に新しいイメージを使うことができる反面、イメージを取得したタイミングによって厳密な内容は異なる可能性があります

この Book では今後結果が大きく変わらないように `latest` ではなく version タグを使うことにします

## イメージを取得する
イメージは [Docker Hub](https://hub.docker.com/) から取得できます

取得するコマンドは `docker pull <image>` です

が、`docker run <image>` 実行時にまとめて `docker pull <image>` もやってくれているので、あまり `docker pull` だけを行うことは多くないでしょう

取得したイメージは `docker image ls` で確認できます

```
$ docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED        SIZE
ubuntu        22.04     63a463683606    3 hours ago    70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago    69.9MB
ubuntu        latest    9f4877540c73    3 hours ago    65.6MB
```

## イメージを探す
使うイメージは [Docker Hub](https://hub.docker.com/) で検索して選ぶことになるでしょう

![image](/images/docker-hub-ubuntu-search.png)

[Tags](https://hub.docker.com/_/ubuntu?tab=tags) から都合の良いバージョンや構成内容を選び、記載してあるコマンドで取得・実行ができます

![image](/images/docker-hub-ubuntu-tags.png)

## イメージを調べる
イメージの構成を詳細に把握するのは難しいですが、それでもいくつかの情報は読み取れます

まずは対応しているホスト OS のアーキテクチャが何かです

![image](/images/docker-hub-ubuntu-archs.png)

一般的な Windows や Mac では `linux/amd64` か`linux/x86_64` があれば大丈夫です ( まず絶対どちらかかそれに準ずるものがあります )

M1 Mac だと `linux/arm64/v8` があれば大丈夫です ( 割とないことがあります )

それからイメージの [詳細](https://hub.docker.com/layers/ubuntu/library/ubuntu/latest/images/sha256-57df66b9fc9ce2947e434b4aa02dbe16f6685e20db0c170917d4a1962a5fe6a9?context=explore) です

![image](/images/docker-hub-ubuntu-cmd.png)

デフォルト命令が `bash` であることが読み取れます

このイメージはシンプルな構成ですが、セットアップ手順や環境変数が読み取れるような場合もあります

## イメージを作る
Docker イメージは基本的に軽量化のためあまり多機能ではありません

開発をしやすくしたりプロジェクト固有の拡張を行うためには、Docker Hub にあるイメージだけでは不十分なことが珍しくありません

その場合には自分でイメージを作る必要が出てきます

イメージを作るのに使うファイルが Dockerfile です

詳細は次以降の章のワークで理解していくことにしますが、いくつかの例を試してみましょう

### もっといろいろインストールされてるイメージにする
`ubuntu:22.04` には `tree` や `vi` といったコマンドがありません

```
$ docker run -it ubuntu:22.04

root@51ea72e49575:/# vi
bash: vi: command not found

root@51ea72e49575:/# tree
bash: tree: command not found
```

これではちょっと不自由するので、`tree` と `vi` が入った Ubuntu イメージを作ってみましょう

次のような `Dockerfile` を好きなディレクトリに作ります ( 拡張子はありません )

```txt:Dockerfile
FROM ubuntu:22.04

RUN apt-get update
RUN apt-get install -y tree vim
```

`Dockerfile` のあるディレクトリで `docker build` を行うことで、イメージが作成できます

`my-ubuntu` という名前にして、タグは `util` とでもしておきましょう

`docker build` はカレントディレクトリにある Dockerfile を自動的に使います

最後の `.` も忘れずに

```
$ docker build -t my-ubuntu:util .
```

これで `my-ubuntu:util` というイメージがローカルマシンにできました

```
 docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED        SIZE
my-ubuntu     util      8dc87d7cb1d2    4 minutes ago  160MB
ubuntu        22.04     63a463683606    3 hours ago    70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago    69.9MB
ubuntu        latest    9f4877540c73    3 hours ago    65.6MB
```

:bulb: `docker build` は Dockerfile を指定して、イメージを作るコマンドということになります

`docker run` で `ubuntu:22.04` ではなく `my-ubuntu:util` を起動します

```
$ docker run -it my-ubuntu:util

root@e94e0c576b7e:/# which vi
/usr/bin/vi

root@e94e0c576b7e:/# tree /etc/
/etc/
|-- adduser.conf
|-- alternatives
|   |-- README
|   |-- awk -> /usr/bin/mawk
|   |-- editor -> /usr/bin/vim.basic
|   |-- ex -> /usr/bin/vim.basic
|   |-- nawk -> /usr/bin/mawk
|   |-- pager -> /bin/more
|   |-- rmt -> /usr/sbin/rmt-tar
|   |-- rview -> /usr/bin/vim.basic
|   |-- rvim -> /usr/bin/vim.basic
|   |-- vi -> /usr/bin/vim.basic
|   |-- view -> /usr/bin/vim.basic
|   |-- vim -> /usr/bin/vim.basic
|   |-- vimdiff -> /usr/bin/vim.basic
|   `-- which -> /usr/bin/which.debianutils
|-- apt
|   |-- apt.conf.d
|   |   |
|   |   | 略
|   |   |
|   |   `-- 
|   |-- auth.conf.d
|   |-- preferences.d
|   |-- sources.list
|   `-- sources.list.d
|
| 略
|
```

`ubuntu:22.04` のデフォルト命令である `bash` が起動します

`tree` と `vi` が使えるコンテナが起動しました

### デフォルト命令を変えたイメージにする
もう一例やってみましょう

環境変数を設定してタイムゾーンを東京にし、デフォルト命令を `date` コマンドに変更したイメージを作ります

違うディレクトリに `Dockerfile` を作ります

```txt:Dockerfile
FROM ubuntu:22.04

RUN apt-get update
RUN apt install -y tzdata

ENV TZ Asia/Tokyo

CMD date
```

今度は `date` というタグ名でイメージを作ります

```
$ docker build -t my-ubuntu:date .
```

コンテナを実行すると、日付を表示して即時終了します

```
$ docker run my-ubuntu:date
Sun Jan 23 08:03:07 JST 2022
```

## ちょっとまとめ
- コンテナは 1 つの命令を行うために起動する
  - 命令には `bash` のように終了するまで継続するプロセスも `cat` のように即時完了するプロセスもある
  - 命令はイメージによってデフォルトで決まっているが、コンテナ起動時に変更することもできる
- コンテナは命令を完遂すると終了する
- イメージは Docker Hub から手に入れたり、自分で作ったりする
- `docker run` はイメージからコンテナを起動するコマンド
- `docker build` は Dockerfile からイメージを作るコマンド

# まとめ
Docker Hub や Docker Engine について確認し、`docker run` と `docker build` を実行してみました

- Docker Desktop をインストールすると Docker Engine や `docker` コマンドが手に入る
- `docker run` がイメージからコンテナを起動するコマンド
- `docker build` が Dockerfile からイメージを作るコマンド
- 作ったイメージを共有する Saas サービスが Docker Hub

![image](/iamges/slide/slide.006.jpeg)

これ以降のワークはイメージとコンテナの実際の操作・作成がメインになります

:bulb: イメージとコンテナを徹底して意識することが Docker の操作をスムーズに理解する一番の近道です

自分が何に命令して何を作っているのか、意識しながら進めてみましょう

- [step1](./step1.md)

