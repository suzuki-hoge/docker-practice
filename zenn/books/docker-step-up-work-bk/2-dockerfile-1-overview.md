---
title: "📚 ｜ 🐳 ｜ Dockerfile ってなに？"
---

# このページで初登場するコマンド
[`docker build [option] <path>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/build/)

オプション | 意味 | 用途  
:-- | :-- | :--
`-f, --file`   | Dockerfile を指定する | 複数の Dockerfile を使い分ける
`-t, --tag` | ビルド結果にタグをつける | 人間が把握しやすいようにする

[`docker history [option] <image>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/history/)

オプション | 意味 | 用途  
:-- | :-- | :--

[Dockerfile](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/builder/)

命令 | 意味 | 用途  
:-- | :-- | :--
`FROM` | ベースイメージを指定する | 基盤にする OS などを指定する
`RUN` | コマンドを実行してレイヤーを追加する | 追加インストールなどの Linux 操作を行う
`ENV` | 環境変数を指定する | 意味の通り
`CMD` | デフォルト命令を設定する | サーバを起動したりする

# 導入
[イメージってなに？](#todo) のページで、イメージは `.img` のような実態を持つファイルではなくレイヤーの積み重なった情報であると理解しました。

しかし Docker Hub にある公式イメージなどは基本的に軽量にするためにレイヤーも最低限しか積み重なっておらず、あまり多機能ではありません。
そのため開発をしやすくしたりプロジェクト固有の拡張を行うために、Dockerfile を用いて自分でレイヤーを重ねる必要が出てきます。

# Ubuntu コンテナにコマンドを追加したイメージを作る
## Dockerfile を作る
`ubuntu:20.04` には `tree` や `vi` といったコマンドがありません。

```
$ docker run -it ubuntu:20.04

root@51ea72e49575:/# vi
bash: vi: command not found

root@51ea72e49575:/# tree
bash: tree: command not found
```

これではちょっと不自由するので、`tree` と `vi` が入った Ubuntu イメージを作ってみましょう。

次のような `Dockerfile` ( 拡張子はありません ) を好きなディレクトリに作ります。

`FROM` でベースとなるイメージを指定します、今回は `ubuntu.20.04` です。
`RUN` で Linux コマンドを指定します、今回は `tree` と `vi` をインストールするための 3 コマンドです。

```txt:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y tree
RUN apt install -y vim
```

`Dockerfile` のあるディレクトリで `docker build` を行うことで、イメージが作成できます。

```txt:docker buil
$ docker build [option] <path>
```

最低限の指定でビルドしてみましょう。

`docker build` は Dockerfile からイメージを作成するコマンドですが、Dockerfile の指定は `./Dockerfile` がある場合に限り省略可能です。
`<path>` については [MySQL サーバの設定をしよう](#todo) で細かく説明します、しばらくは `.` を指定します。

```
$ docker build .
```

最後にこのような出力がされていれば成功です。

```
 => => writing image sha256:11432b7f93dfffc42633aa64c794af144afb6b9a63dd9bf198da02d4e64fc2ba
```

## できたイメージを確認する
ローカルにある取得 / ビルド済みのイメージは `docker image ls` で確認できます。

`IMAGE ID` が `docker build` の `writing image sha256:` と同じイメージがあるはずです。

```
$ docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED          SIZE
<none>        <none>    11432b7f93df    3 minutes ago    160MB
ubuntu        22.04     63a463683606    3 hours ago      70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago      69.9MB
ubuntu        20.04     9f4877540c73    3 hours ago      65.6MB
ubuntu        latest    9f4877540c73    3 hours ago      65.6MB
```

イメージには必ず ID があり、タグ名などは任意です。

`docker run` などの `<image>` を引数とするコマンドはイメージが一意にできれば動くので、イメージ ID でも問題なく利用できます。

ビルドしたイメージ ( `11432b7f93df` ) を `docker run` して、`vi` と `tree` が使えるか確認してみましょう。

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

## イメージにタグをつける
ビルドは成功していますが、毎回 `IMAGE ID` である `11432b7f93df` で指定するのは使いづらいので、ビルド結果に `-t` でタグをつけるようにしましょう。
名前は `my-ubuntu:util` とでもしましょう。

```
$ docker build -t my-ubuntu:util .
```

先ほど `<none>` `<none>` となっていた部分がそれぞれ `my-ubuntu` と `util` になりました。

```
REPOSITORY    TAG       IMAGE ID        CREATED          SIZE
my-ubuntu     util      11432b7f93df    4 minutes ago    160MB
ubuntu        22.04     63a463683606    3 hours ago      70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago      69.9MB
ubuntu        20.04     9f4877540c73    3 hours ago      65.6MB
ubuntu        latest    9f4877540c73    3 hours ago      65.6MB
```

これで `my-ubuntu:util` で指定できるようになりました。

ちなみに、Dockerfile は変更していないのでビルド結果が同じため `IMAGE ID` ( `11432b7f93df` ) は据え置きです。
またよく見ると `ubuntu:20.04` と `ubuntu:latest` の `IMAGE ID` も同じことが確認できます。

## レイヤー確認
イメージのレイヤー情報を `docker history` で確認することができます。

```txt:docker history
$ docker history [option] <image>
```

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

`ubuntu:20.04` ( `9f4877540c73` ) までの 2 レイヤーに `RUN` による 3 レイヤーがさらに重ねられたものが `my-ubuntu:util ( `11432b7f93df` ) だということが読み取れます。

# デフォルト命令を変えたイメージにする
## 別の Dockerfile を作る
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
```

ビルドに成功したら一覧を確認します。

```
$ docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED           SIZE
my-ubuntu     date      3df3591057f9    1 minutes ago    160MB
my-ubuntu     util      11432b7f93df    8 minutes ago    160MB
ubuntu        22.04     63a463683606    3 hours ago      70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago      69.9MB
ubuntu        20.04     9f4877540c73    3 hours ago      65.6MB
ubuntu        latest    9f4877540c73    3 hours ago      65.6MB
```

作成したイメージをデフォルト命令で起動してみましょう。

:::details ワーク: デフォルト命令でビルドしたコンテナを起動
```
$ docker run my-ubuntu:date

Sun Jan 23 08:03:07 JST 2022

$
```

命令が `bash` から `date` に変わったことで、コンテナも即終了するようになりました。
:::

## レイヤーの確認
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

一般にイメージのレイヤーは少ない方が良いとされており ( todo ) 、`RUN` による Linux コマンドの実行は `&&` で 1 レイヤーにまとめるのが定石です。

## todo の高速化

# イメージの Git 管理
イメージには `.img` のような実態があるわけではないので、プロジェクトでは Dockerfile を Git 管理することになります。

Dockerfile を共有することで各自が PHP のインストールなどを手作業する必要がなくなり、同じイメージから起動する同じコンテナで開発を行えるようになります。

ただし `docker run` は Dockerfile ではなくイメージを指定するコマンドなので、Dockerfile に更新があった場合は `docker run` の前に自分で再ビルドをする必要があります。

# まとめ
- `docker build` は Dockerfile からイメージを作るコマンド
- `-f` により Dockerfile を明示できる
- `-t` によりビルド結果にタグをつけられる
- Dockerfile に書いた命令でレイヤーが積み重なりイメージになる
- イメージがレイヤーの積み重ねであることを理解しておくと、Dockerfile の理解が深まる
- Dockerfile は Git 管理下に入れ共有する
