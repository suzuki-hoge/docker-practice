---
title: "📚 ｜ 🐳 ｜ イメージって？"
---
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


バージョンを明記するか `latest` を使うかは、用途に応じて決めると良いでしょう

`latest` の場合は常に新しいイメージを使うことができる反面、イメージを取得したタイミングによって厳密な内容は異なる可能性があります

また、`22.04` は `development branch` と書いてある通り開発中で、2022/04 リリースのようです
`latest` の `lsb-release` に `20.04.3 LTS` と書いてありますね

この Book では今後結果が大きく変わらないように `latest` ではなく LTS ( Long Time Support ) である `20.04` を明示して使うことにします

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
`ubuntu:20.04` には `tree` や `vi` といったコマンドがありません

```
$ docker run -it ubuntu:20.04

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

REPOSITORY    TAG       IMAGE ID        CREATED          SIZE
my-ubuntu     util      8dc87d7cb1d2    4 minutes ago    160MB
ubuntu        22.04     63a463683606    3 hours ago      70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago      69.9MB
ubuntu        latest    9f4877540c73    3 hours ago      65.6MB
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

`ubuntu:20.04` のデフォルト命令である `bash` が起動します

`tree` と `vi` が使えるコンテナが起動しました

### デフォルト命令を変えたイメージにする
もう一例やってみましょう

環境変数を設定してタイムゾーンを東京にし、デフォルト命令を `date` コマンドに変更したイメージを作ります

違うディレクトリに `Dockerfile` を作ります

```txt:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y tzdata

ENV TZ Asia/Tokyo

CMD date
```

今度は `date` というタグ名でイメージを作ります

```
$ docker build -t my-ubuntu:date .

$ docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED           SIZE
my-ubuntu     date      76cb3a3a4043    24 seconds ago    160MB
my-ubuntu     util      8dc87d7cb1d2    4 minutes ago     160MB
ubuntu        22.04     63a463683606    3 hours ago       70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago       69.9MB
ubuntu        latest    9f4877540c73    3 hours ago       65.6MB
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

![image](/images/slide/slide.006.jpeg)

これ以降のワークはイメージとコンテナの実際の操作・作成がメインになります

:bulb: イメージとコンテナを徹底して意識することが Docker の操作をスムーズに理解する一番の近道です

自分が何に命令して何を作っているのか、意識しながら進めてみましょう

- [step1](books/docker-step-up-work/bk/step1.mder-step-up-work/bk/step1.md)

