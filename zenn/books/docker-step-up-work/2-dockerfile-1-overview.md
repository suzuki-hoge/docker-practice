---
title: "📚 ｜ 🐳 ｜ Dockerfile ってなに？"
---

# このページで初登場するコマンド
[`docker build [option] <path>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/build/)

オプション | 意味 | 用途  
:-- | :-- | :--

[`docker pull [option] <image>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/pull/)

[`docker image ls [option]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/image_ls/)

`docker history`

`FROM`
`RUN`
`ENV`
`CMD`

# 導入
todo のページで、イメージは `.img` のような実態を持つファイルではなくレイヤーの積み重なった情報であると理解しました。

しかし Docker Hub にある公式イメージなどは基本的に軽量にするためにレイヤーも最低限しか積み重なっておらず、あまり多機能ではありません。
そのため開発をしやすくしたりプロジェクト固有の拡張を行うために、Dockerfile を用いて自分でレイヤーを重ねる必要が出てきます。

# ためしに Ubuntu コンテナにコマンドを追加する
## ビルド
`ubuntu:20.04` には `tree` や `vi` といったコマンドがありません。

```
$ docker run -it ubuntu:20.04

root@51ea72e49575:/# vi
bash: vi: command not found

root@51ea72e49575:/# tree
bash: tree: command not found
```

これではちょっと不自由するので、`tree` と `vi` が入った Ubuntu イメージを作ってみましょう。

todo `RUN`

次のような `Dockerfile` ( 拡張子はありません ) を好きなディレクトリに作ります。

```txt:Dockerfile
FROM ubuntu:22.04

RUN apt update
RUN apt install -y tree
RUN apt install -y vim
```

`Dockerfile` のあるディレクトリで `docker build` を行うことで、イメージが作成できます。

```
$ docker build [option] <path>
```

最低限の指定でビルドしてみましょう。

`docker build` は Dockerfile からイメージを作成するコマンドですが、Dockerfile の指定は同じディレクトリに Dockerfile がある場合に限り省略可能です。
`<path>` については todo で細かく説明します、しばらくは `.` を指定します。

```
$ docker build .
```

最後にこんな出力がされていれば成功です。

```
 => => writing image sha256:11432b7f93dfffc42633aa64c794af144afb6b9a63dd9bf198da02d4e64fc2ba
```

## 確認
ローカルにある取得 / ビルド済みのイメージは `docker image ls` で確認できます。

`IMAGE ID` が `docker build` の `writing image sha256:` と同じイメージがあるはずです。

```
$ docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED          SIZE
<none>        <none>    11432b7f93df    3 minutes ago    160MB
ubuntu        22.04     63a463683606    3 hours ago      70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago      69.9MB
ubuntu        latest    9f4877540c73    3 hours ago      65.6MB
```

`docker run [option] <image> [command] [arg...]` の `<image>` の部分は、イメージが一意に特定できればイメージ名ではなくイメージ ID でも動きます。
ビルドしたイメージを `docker run` して、`vi` と `tree` が使えるか確認してみましょう。

:::details ワーク: ビルドしたイメージからコンテナを起動、コマンドの確認
```
$ docker run -it 11432b7f93df bash

# which vi
/usr/bin/vi

# tree /etc/
/etc/
|-- adduser.conf
|-- alternatives
|   |-- README
|   |-- 略
|   `-- which -> /usr/bin/which.debianutils
|-- apt
|   |-- apt.conf.d
|   |   `-- 略
|   |-- auth.conf.d
|   |-- 略
|   `-- sources.list.d
| 略
`-- xattr.conf
```
:::

## オプション
ビルドは成功していますが、毎回 `IMAGE ID` である `11432b7f93df` で指定するのは使いづらいので、ビルド結果に `-t` でタグをつけるようにしましょう。

```
$ docker build -t my-ubuntu:util .
```

```
REPOSITORY    TAG       IMAGE ID        CREATED          SIZE
my-ubuntu     util      11432b7f93df    4 minutes ago    160MB
ubuntu        22.04     63a463683606    3 hours ago      70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago      69.9MB
ubuntu        20.04     9f4877540c73    3 hours ago      65.6MB
ubuntu        latest    9f4877540c73    3 hours ago      65.6MB
```

Dockerfile は変更していないので、ビルド結果自体は同じ ( `11432b7f93df` ) ですが、これで `my-ubuntu:util` で指定できるようになりました。

## レイヤー確認
イメージのレイヤー情報を `docker history` で確認することができます。

`ubuntu:20.04` と `my-ubuntu:util` を比べてみましょう。

```
$ docker history ubuntu:20.04

IMAGE          CREATED       CREATED BY                                      SIZE      COMMENT
9f4877540c73   3 weeks ago   /bin/sh -c #(nop)  CMD ["bash"]                 0B
<missing>      3 weeks ago   /bin/sh -c #(nop) ADD file:521a8ada4ac06e6f7…   65.6MB
```

```
$ docker history my-ubuntu:util

IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
11432b7f93df   13 seconds ago   RUN /bin/sh -c apt install -y vim # buildkit    58.5MB    buildkit.dockerfile.v0
<missing>      18 seconds ago   RUN /bin/sh -c apt install -y tree # buildkit   935kB     buildkit.dockerfile.v0
<missing>      20 seconds ago   RUN /bin/sh -c apt update # buildkit            31.1MB    buildkit.dockerfile.v0
<missing>      3 weeks ago      /bin/sh -c #(nop)  CMD ["bash"]                 0B
<missing>      3 weeks ago      /bin/sh -c #(nop) ADD file:d75d592836ef38b56…   70.4MB
```

`ubuntu:20.04` ( `9f4877540c73` ) までの結果に `RUN` による 3 つのレイヤーがさらに重ねられたものが `my-ubuntu:util ( `11432b7f93df` ) だということが読み取れます。

どちらのイメージも、積み上がったレイヤーの最後だけにイメージ ID が付いていることを理解しておきましょう。


# デフォルト命令を変えたイメージにする
もう一例やってみましょう。

環境変数を設定してタイムゾーンを東京にし、デフォルト命令を `date` コマンドに変更したイメージを作ります。

環境変数を指定するには `ENV` を、デフォルト命令を変更するには `CMD` を使います。

`my-ubuntu:util` を作った `Dockerfile` のあるディレクトリに `Dockerfile2` を作ります。

```txt:Dockerfile2
FROM ubuntu:20.04

RUN apt update && apt install -y tzdata

ENV TZ Asia/Tokyo

CMD date
```

`docker build` は未指定の場合 `./Dockerfile` を使ってしまうので、`Dockerfile2` を使わせるために `-f` オプションを追加します。
`-t` も最初から付けておきましょう。

```
$ docker build -f Dockerfile2 -t my-ubuntu:date .

$ docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED           SIZE
my-ubuntu     date      3df3591057f9    1 minutes ago    160MB
my-ubuntu     util      11432b7f93df    8 minutes ago    160MB
ubuntu        22.04     63a463683606    4 hours ago      70.4MB
ubuntu        21.10     2a5119fc922b    4 hours ago      69.9MB
ubuntu        20.04     9f4877540c73    4 hours ago      65.6MB
ubuntu        latest    9f4877540c73    4 hours ago      65.6MB
```

:::details ワーク: デフォルト命令でビルドしたコンテナを起動
```
$ docker run my-ubuntu:date

Sun Jan 23 08:03:07 JST 2022

$
```

命令が `bash` から `date` に変わったことで、コンテナも即終了するようになりました。
:::

こちらも `docker history` でレイヤーを確認してみましょう。

```
$ docker history ubuntu:20.04
IMAGE          CREATED       CREATED BY                                      SIZE      COMMENT
9f4877540c73   3 weeks ago   /bin/sh -c #(nop)  CMD ["bash"]                 0B
<missing>      3 weeks ago   /bin/sh -c #(nop) ADD file:521a8ada4ac06e6f7…   65.6MB
```

```
$ docker history my-ubuntu:date
IMAGE          CREATED         CREATED BY                                      SIZE      COMMENT
03f5d2276848   3 minutes ago   CMD ["/bin/sh" "-c" "date"]                     0B        buildkit.dockerfile.v0
<missing>      3 minutes ago   ENV TZ=Asia/Tokyo                               0B        buildkit.dockerfile.v0
<missing>      3 minutes ago   RUN /bin/sh -c apt update && apt install -y …   31.7MB    buildkit.dockerfile.v0
<missing>      3 weeks ago     /bin/sh -c #(nop)  CMD ["bash"]                 0B
<missing>      3 weeks ago     /bin/sh -c #(nop) ADD file:521a8ada4ac06e6f7…   65.6MB```
```

`ENV` や `CMD` もレイヤーとして重なっていることが読み取れます。

今回は Dockerfile で 1 つの `RUN` に `&&` で複数の Linux コマンドを実行したので、`RUN` によるレイヤーが 1 つしかありません。

todo

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



:white_check Dockerfile はレイヤーを積み重ねるもの