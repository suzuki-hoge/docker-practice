---
title: "２部: Dockerfile の基礎"
---

２部の最後は Dockerfile について学びます。

ここまでの基礎知識と Dockerfile の読み書きをきちんと理解できれば、もう頑張って学ぶフェーズは終わり、あとは特定の用途に合わせて機能を知るフェーズになります。

# このページで初登場するコマンドとオプション
## イメージをビルドする - image build
```:新コマンド
$ docker image build [option] <path>
```

```:旧コマンド
$ docker build [option] <path>
```

オプション | 意味 | 用途  
:-- | :-- | :--
`-f, --file`   | Dockerfile を指定する | 複数の Dockerfile を使い分ける
`-t, --tag` | ビルド結果にタグをつける | 人間が把握しやすいようにする

## イメージのレイヤーを確認する - image history
```:新コマンド
$ docker image history [option] <image>
```

```:旧コマンド
$ docker history [option] <image>
```

# Dockerfile の必要性と有用性
ここまでで次のことを理解しました。

- コンテナ内で行った作業は、コンテナ終了とともに全て消える
- イメージには `.img` のような実態はなく、レイヤーという情報の積み重なったものである

しかし Docker Hub にある公式イメージなどは軽量にするためにレイヤーが最低限しか積み上がっておらず、あまり多機能ではありません。
たとえば Ubuntu コンテナには `vi` も `curl` も入っていませんでした。

そこで「公式イメージでは十分なセットアップが得られない」場合に「あらかじめ必要なセットアップを済ませたイメージを自分で作成しておく」というアプローチを取ることになります。

Dockerfile は既存のイメージ ( = レイヤーたち ) に追加でレイヤーを乗せることができるるので、OS 設定などの労力を払わずに簡単にイメージを作成することができます。

# Dockerfile の基本の命令
Dockerfile にはいくつかの命令句がありますが、全てを一度に覚える必要はないため、代表的なものをいくつか学びます。

命令   | 効果                                      
:--    | :--                                       
`FROM` | ベースイメージを指定する                  
`RUN`  | 任意のコマンドを実行する                  
`COPY` | ホストマシンのファイルをイメージに追加する
`CMD`  | デフォルト命令を指定する

Dockerfile を書きながら１つずつ説明します。
行番号が表示される設定をされた `vi` の使える、時間を表示してくれるイメージを作ってみましょう。

## Dockerfile の作成
Dockerfile は複数のイメージをビルドする場合を除き、大抵はプロジェクトのトップディレクトリに `Dockerfile` という名前で作られます。

拡張子はありません。

自分のホストマシンのどこでも構わないので、適当なディレクトリを用意して `Dockerfile` を作成して下さい。

```Dockerfile:Dockerfile
```

## FROM: ベースイメージを指定する
`FROM` はベースになるイメージを指定する命令です。

次の `Dockerfile` は「これから `ubuntu:20.04` のレイヤーの上にさらにレイヤーを乗せていくぞ」という意味になります。

```Dockerfile:Dockerfile
FROM ubuntu:20.04
```

Dockerfile は `FROM` で始まります。

## RUN: 任意のコマンドを実行する
`RUN` は Linux のコマンドを実行してその結果をレイヤーとする命令です。

`ubuntu:20.04` イメージに `vi` をインストールするレイヤーを重ねるには、次のような `Dockerfile` を書きます。

```Dockerfile:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y vim
```

:::message
`RUN` で `apt` を使うのか、それとも `yum` など他のパッケージマネージャを使うのかは、ベースイメージによって決まります。

一度 `ubuntu:20.04` を `bash` で起動して OS が何かを調べておくなどするのが基本です。

少し詳しく知りたい方は【 ３部: とらぶる 】も読んでみてください。
:::

`RUN` により「コンテナを起動するたびに `vi` をインストールする」という手間を解決できます。

## COPY: ホストマシンのファイルをイメージに追加する
`COPY` はホストマシンのファイルをイメージに追加する命令です。

`ubuntu:20.04` イメージに行番号を表示する設定を記した `.vimrc` を配置するには、まずホストマシンに `.vimrc` を作ります。

```txt:.vimrc ( Host Machine )
set number
```

次に、`Dockerfile` を書き足します。

```Dockerfile:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y vim

COPY .vimrc /root/.vimrc
```

`COPY` により「コンテナを起動するたびに `.vimrc` を作成する」という手間を解決できます。

## CMD: デフォルト命令を指定する
`CMD` はイメージのデフォルト命令を設定する命令です。

`bash` の起動する汎用イメージではなく、特定のフォーマットで現在時刻を表示するイメージにしたいので、次のように `Dockerfile` を書き足します。

```Dockerfile:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y vim

COPY .vimrc /root/.vimrc

CMD date +"%Y/%m/%d %H:%M:%S ( UTC )"
```

`CMD` により「`container run` で `date +"%Y/%m/%d %H:%M:%S ( UTC )"` という複雑な引数を毎回指定する」という手間を解決できます。

## 確認
`Dockerfile` と `.vimrc` を作成しました。
ホストマシンで確認すると次のようになっているはずです。

```:Host Machine
$ tree .

.
|-- .vimrc
`-- Dockerfile
```

```Dockerfile:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y vim

COPY .vimrc /root/.vimrc

CMD date +"%Y/%m/%d %H:%M:%S ( UTC )"
```

```txt:.vimrc ( Host Machine )
set number
```

# イメージをビルドする
`Dockerfile` ができたので、次はイメージのビルドを行います。

```:新コマンド
$ docker image build [option] <path>
```

`[option]` には `--tag` オプションを指定して `my-ubuntu:date` というタグをつけます。
タグを指定しないでビルドを行うとランダム文字列の `IMAGE ID` でしか指定できなくなってしまい不便です。

`<path>` は `COPY` に使うファイルがあるディレクトリ `.` を指定します。

以上を踏まえ、次のコマンドでイメージをビルドします。

```:Host Machine
$ docker image build     \
    --tag my-ubuntu:date \
    .
```

最後にこのような出力がされていれば成功です。

```:Host Machine
 => => writing image sha256:f099b72286fd6e3f80d099ea4301316eb6a8f0d8d3eda7cbaafc4a5b62452e0f
```

`image ls` でイメージ一覧を確認すると、`my-ubuntu:date` というイメージが作成できていることが確認できます。

```:Host Machine
$ docker image ls

REPOSITORY   TAG      IMAGE ID       CREATED          SIZE
my-ubuntu    date     f099b72286fd   51 seconds ago   160MB
nginx        1.21     2e7e2ec411a6   3 weeks ago      134MB
ubuntu       22.04    63a463683606   4 weeks ago      70.4MB
ubuntu       21.10    2a5119fc922b   4 weeks ago      69.9MB
ubuntu       20.04    9f4877540c73   4 weeks ago      65.6MB
ubuntu       latest   9f4877540c73   4 weeks ago      65.6MB
```

意図した通りのイメージになっているか、コンテナを起動して確認します。

```:Host Machine
$ docker container run \
    --name my-ubuntu1  \
    --rm               \
    my-ubuntu:date

2022/02/20 08:12:16 ( UTC )
```

`CMD` によるデフォルト命令の変更が意図通りであることを確認できました。

次は `RUN` と `COPY` の結果を確認するために、メインコマンドを `vi` にして起動します。

```:Host Machine
$ docker container run \
    --name my-ubuntu2  \
    --rm               \
    --interactive      \
    --tty              \
    my-ubuntu:date     \
    vi
```

行番号の表示される `vi` が起動するはずです。

基本的な Dockerfile の作成とイメージのビルドは、このような手順になります。

# Dockerfile を複数扱うには
イメージをビルドする時に `Dockerfile` のパスを指定していなかったことが気になった方がいるかもしれませんが、`image build` はデフォルトで `./Dockerfile` を使うようになっているので問題ありません。

しかし実際に Docker を使って開発をする場合は、Web サーバのコンテナや DB サーバのコンテナなど複数のコンテナを活用することになります。
それに伴い Dockerfile も複数になるため、一般には Dockerfile と `COPY` に使うためのファイルはコンテナごとにディレクトリを作り分けて管理することが多いです。

このページではこれ以上 Dockerfile を作りませんが、ディレクトリを分ける方法だけ確認しておきます。

まずは次のように `docker/date/` ディレクトリを作成し、このページで作成した `Dockerfile` と `.vimrc` を移動します。

```:Host Machine
$ tree .

.
`-- docker
    `-- date
        |-- .vimrc
        `-- Dockerfile
```

このディレクトリ構成でイメージのビルドを行うには、`image build` に `--file` オプションの追加と `<path>` の変更が必要です。

```:Host Machine
$ docker image build              \
    --tag my-ubuntu:date          \
    --file docker/date/Dockerfile \
    docker/date
```

`--file` オプションは `./Dockerfile` 以外の Dockerfile を指定する時に必要です。

次に `<path>` ですが、これは `COPY` で使うファイルを指定する時の相対パスになります。
`実行ディレクトリ/<path>/.vimrc` を `/root/.vimrc` に追加すると解釈されます。

```:Host Machine
$ tree .

.                       $ docker image build [option] docker/date
`-- docker                                            ^^^^^^^^^^^
    `-- date
        |-- .vimrc
        `-- Dockerfile  COPY (./)(docker/date/).vimrc /root/.vimrc
                                  ^^^^^^^^^^^
```

`image build` で `.` を指定したいなら、`COPY` の方を調整します。

```:Host Machine
$ tree .                

.                       $ docker image build [option] .
`-- docker                                            ^
    `-- date
        |-- .vimrc
        `-- Dockerfile  COPY (./)(./)docker/date/.vimrc /root/.vimrc
                                  ^
```

`COPY` も `<path>` も `.` にしたいなら実行するディレクトリを変えれば良いですが、複数のイメージをビルドするたびに `cd` しなければいけないのでおすすめしません。

```:Host Machine
$ tree .

.
`-- docker
    `-- date            docker image build [option] .
        |-- .vimrc                                  ^
        `-- Dockerfile  COPY (./docker/date/)(./).vimrc /root/.vimrc
                                              ^
```

どの方法を用いても良いですが、僕は `image build` が `.` で済む `COPY docker/date/.vimrc /root/.vimrc` の方法をよく使います。
ディレクトリ名 ( `docker/date` ) を変更すると Dockerfile が壊れますが、そうそうあることではないので許容しています。

# レイヤーを確認する
ローカルに存在するイメージのレイヤー情報を `image history` で確認することができます。

```:新コマンド
$ docker image history [option] <image>
```

`ubuntu:20.04` と `my-ubuntu:date` のレイヤーを比べてみます。

```:Host Machine
$ docker image history ubuntu:20.04

IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
9f4877540c73   3 days ago       /bin/sh -c #(nop)  CMD ["bash"]                 0B
<missing>      3 days ago       /bin/sh -c #(nop) ADD file:3acc741be29b0b58e…   65.6MB
```

```:Host Machine
$ docker image history my-ubuntu:date

IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
db18651e322c   33 minutes ago   CMD ["/bin/sh" "-c" "date +\"%Y/%m/%d %H:%M:…   0B        buildkit.dockerfile.v0
<missing>      33 minutes ago   COPY .vimrc /root/.vimrc # buildkit             20B       buildkit.dockerfile.v0
<missing>      49 minutes ago   RUN /bin/sh -c apt install -y vim # buildkit    67.3MB    buildkit.dockerfile.v0
<missing>      50 minutes ago   RUN /bin/sh -c apt update # buildkit            27.6MB    buildkit.dockerfile.v0
<missing>      3 days ago       /bin/sh -c #(nop)  CMD ["bash"]                 0B
<missing>      3 days ago       /bin/sh -c #(nop) ADD file:3acc741be29b0b58e…   65.6MB
```

`my-ubuntu:date` は `ubuntu:20.04` を `FROM` でベースイメージに指定したので、**`my-ubuntu:date` の下 2 層は `ubuntu:20.04` を同じ** になっています。

その上に Dockerfile に書いた `RUN` `RUN` `COPY` `CMD` が積み重なっていることが確認できます。
一番上まで積み重ねて `image build` によるビルドが完了したレイヤーに `IMAGE ID` ( `db18651e322c` ) が振られています。

## RUN をいくつのレイヤーにするか
若干細かい話になるので理解をこの本の読破より後に回しても大丈夫です。

普段目にする Dockerfile は `RUN apt update && apt install -y vim` のように **１つの `RUN` で複数の Linux コマンドを連続して実行** しているものが大半だと思います。

これは **`RUN` がコマンドの結果をレイヤーとして確定する** という点に注目すると意図が読み取りやすいです。

たとえば次のような「`.java` を持ってきてコンパイルして `.jar` を手に入れたい、けど `.java` 自体はいらない」という仮想の Dockerfile があった場合を考えます。

```Dockerfile:Dockerfile
RUN git clone https://github.com/suzuki-hoge/some-java-tool
RUN cd some-java-tool
RUN compile
RUN cp some-java-tool.jar some-dir
RUN cd ..
RUN rm -rf some-java-tool
```

**`RUN` は結果をレイヤーとして確定する** ので、**`git clone` が成功した時点のレイヤーをイメージに含みます**。

対して、次の Dockerfile は **６つのコマンド全てが終わってから１つのレイヤーを確定する** ので、**途中で存在したファイルはイメージに含まれません**。

```Dockerfile:Dockerfile
RUN git clone https://github.com/foo/some-java-tool && \
    cd some-java-tool                               && \
    compile                                         && \
    cp some-java-tool.jar some-dir                  && \
    cd ..                                           && \
    rm -rf some-java-tool
```

**イメージのサイズを気にする場合** は、このような点に気を付けたりマルチステージビルド ( この本では解説しません ) を活用すると良いでしょう。

Linux コマンドを繋げるもう１つの理由は、**レイヤーがキャッシュされる** という点です。

次のような Dockerfile をビルドしたあとに、

```Dockerfile:Dockerfile
RUN apt update
RUN apt install -y vim
```

次のような Dockerfile に変更してビルドをすると問題が発生するかもしれません。

```Dockerfile:Dockerfile
RUN apt update
RUN apt install -y vim curl
```

変更のあったレイヤーは２つめの `apt install` の方だけなので、**１つめのレイヤーとして確定している `apt update` は再実行されません**。

次のように書いておけば **１つめのレイヤーに変更があったと判断されるため** `apt update` から再実行されます。

```Dockerfile:Dockerfile
RUN apt update && apt install -y vim curl
```

反対に、`RUN` を繋げすぎると Dockerfile の構築中などに次のようなデメリットも発生します。

- Linux コマンドに不備があり `RUN` が失敗した場合、**繋げすぎたコマンドはどこで失敗したか極めてわかりづらい**
- 繋げすぎたコマンドの後半で失敗しても、**確定したレイヤーがないので初めから全部再実行**になる

構築時はバラして完成したら繋げる、のように状況に応じて `RUN` を構築できるとよりよいでしょう。

## Docker Hub のレイヤー情報を読み解く
【 ２部: イメージの基礎 】で 22 もレイヤーがある `rails:5.0.1` の話をしました。

> [Rails の Tags ページ](https://hub.docker.com/_/rails?tab=tags) から `5.0.1` を選んでレイヤーを確認してみると、実に 22 ものレイヤーがあることが確認できます。

![image](/images/rails-layers-1.png)

しかし [公開されている Dockerfile](https://github.com/docker-library/rails/blob/e16e955a67f48c1e8dc0af87ba6c0b7f8302bad2/Dockerfile) は 4 レイヤーしか作っていません。

```Dockerfile:Dockerfile
FROM ruby:2.3

# see update.sh for why all "apt-get install"s have to stay as one long line
RUN apt-get update && apt-get install -y nodejs --no-install-recommends && rm -rf /var/lib/apt/lists/*

# see http://guides.rubyonrails.org/command_line.html#rails-dbconsole
RUN apt-get update && apt-get install -y mysql-client postgresql-client sqlite3 --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV RAILS_VERSION 5.0.1

RUN gem install rails --version "$RAILS_VERSION"
```

**Docker Hub のレイヤーページで確認できるのはレイヤー** ということと **Dockerfile は FROM で指定したイメージにレイヤーを重ねられる** ということが理解できると、どうしてレイヤーの数と Dockerfile の行数が一致しないかがわかります。

この画面で見ている `rails:5.0.1` のレイヤーは、もともと 18 のレイヤーがある `ruby:2.3` に Dockerfile で 4 レイヤーを重ねたものだからです。

![image](/images/rails-layers-2.png)

頭の片隅にでも入れておくと、役に立つ時が来るでしょう。

# まとめ
簡潔にまとめます。

- `FROM` はベースイメージを指定する
- `RUN` は Linux コマンドを実行してレイヤーを確定する
- `COPY` はホストマシンのファイルをイメージに追加する
- `CMD` はデフォルト命令を指定する
- イメージをビルドする時は `<path>` と `COPY` を調整する
- 次のようなことを考慮して `RUN` で確定するレイヤーの単位を決める  
  - イメージサイズやキャッシュなどの利点
  - 構築やデバッグのしづらさなどの難点
- `FROM` で指定したイメージのレイヤーに Dockerfile で指定したレイヤーが乗る
  
混乱してしまった時は立ち返ってみてください。
