---
title: "２部: Dockerfile の基礎"
---

イメージのレイヤーを重ねるための Dockerfile について理解します。

# このページで初登場するコマンドとオプション
## イメージをビルドする
```:新コマンド
$ docker image build [option] <path>
```

```:旧コマンド
$ docker build [option] <path>
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-f, --file`   | Dockerfile を指定する | 複数の Dockerfile を使い分ける
`-t, --tag` | ビルド結果にタグをつける | 人間が把握しやすいようにする

## イメージのレイヤーを確認する
```:新コマンド
$ docker image history [option] <image>
```

```:旧コマンド
$ docker history [option] <image>
```

### オプション
このページで新たに使うオプションはなし

# イメージを作成する必要性
ここまでで次のことを理解しました。

- コンテナ内で行った作業は、コンテナ終了とともに全て消える
- イメージには `.img` のような実態はなく、レイヤーという情報の積み重なったものである

しかし Docker Hub にある公式イメージなどは軽量にするためにレイヤーが最低限しか積み上がっておらず、あまり多機能ではありません。

そこで「公式イメージでは十分なセットアップが得られない場合は毎回コンテナを起動してからセットアップする」というアプローチを採用すると無駄が多すぎてしまうので、あらかじめ必要なセットアップを済ませたイメージを自分で作成する必要が出てきます。

イメージを作成するには Dockerfile というテキストファイルを用います。
Dockerfile により既存のイメージにレイヤーを自由に積み重ねられるため、イメージをゼロから作る労力を払わずに極めて低コストで自分に都合の良いイメージを作成することができるようになります。

# Dockerfile を作る
## FROM: ベースイメージを指定する
Dockerfile は拡張子はなく、一般的には用途の違う Dockerfile はディレクトリを分けて管理することが多いため、ほぼ `Dockerfile` という名前で作られます。

適当なディレクトリを用意して次の内容で `Dockerfile` を作成します。

```Dockerfile
FROM ubuntu:20.04
```

Dockerfile は `FROM` という「レイヤーを積む土台イメージを指定する命令」で始まります。

## RUN: 任意のコマンドを実行する
コンテナに必要なコマンドが不足している場合などは `RUN` を使って解決します。

`ubuntu:20.04` コンテナを起動しても `vi` がインストールされておらず何かと不自由するので、ためしに `vi` をインストールすることにします。
次の内容に `Dockerfile` を更新します。

```Dockerfile:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y vim
```

Dockerfile の `RUN` は「任意のコマンドを実行させレイヤーを重ねる命令」です。

イメージに「`vi` をインストールした」というレイヤーを重ねておくことで、コンテナを起動するたびに `apt install update` と `apt install -y vim` を実行する必要がなくなります。

## COPY: ホストマシンのファイルをイメージに含める
コンテナに設定ファイルなどを配置したい場合は `COPY` を使って解決します。

`ubuntu:20.04` の `bash` を起動したときのプロンプトに現在ディレクトリだけを表示したいので、ためしに `.bashrc` を配置することにします。
まずはホストマシンで `.bashrc` を作成します。

```bash:.bashrc ( Host Machine )
export PS1='\w # '
```

次に `Dockerfile` を次の内容に更新します。

```Dockerfile:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y vim

COPY .bashrc /root/.bashrc
```

Dockerfile の `COPY` は「ホストマシンのファイルをイメージにコピーする命令」です。

イメージに「あらかじめ `.bashrc` を含めておく」ことで、コンテナを起動するたびに `.bashrc` を作成する必要がなくなります。

## CMD: イメージのデフォルト命令を指定する
コンテナで行いたいことが明確な場合や複雑な場合は `CMD` を使って解決します。

`bash` の起動する汎用イメージではなく、特定のフォーマットで現在時刻を表示するイメージにしたいので、ためしにデフォルト命令を `date` に変更します。
次の内容に `Dockerfile` を更新します。

```Dockerfile:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y vim

COPY .bashrc /root/.bashrc

CMD date +"%Y/%m/%d %H:%M:%S ( UTC )"
```

Dockerfile の `CMD` は「デフォルト命令を変更する命令」です。

イメージに「デフォルト命令は `date`」と上書きしておくことで、`+"%Y/%m/%d %H:%M:%S ( UTC )"` という複雑な起動方法を覚える必要がなくなります。

## 確認
`Dockerfile` と `.bashrc` を作成しました。ホストマシンで確認すると次のようになっているはずです。

```:Host Machine
$ tree .

.
|-- .bashrc
`-- Dockerfile
```

```Dockerfile:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt install -y vim

COPY .bashrc /root/.bashrc

CMD date +"%Y/%m/%d %H:%M:%S ( UTC )"
```

```bash:.bashrc
export PS1='\w # '
```

# イメージをビルドする
## ビルドと確認
`Dockerfile` のあるディレクトリで `docker build` を行うことで、イメージが作成できます。

```:新コマンド
$ docker image build [option] <path>
```

まずは最低限の指定でビルドしようと思うので、それぞれ次のように指定します。

- `[otpion]` → `./Dockerfile` がある場合は省略可能
- `<path>` → `COPY` に使う `.bashrc` がカレントディレクトリにあるので `.`

以上を踏まえ、次のコマンドでイメージをビルドします。

```:Host Machine
$ docker image build .
```

最後にこのような出力がされていれば成功です。

```:Host Machine
 => => writing image sha256:db18651e322c8c93ddbf2af1e4b23fb9ead26a411823792be33baca27730320a
```

イメージ一覧を確認すると、タグのない `db18651e322c` というイメージが作成されていることが確認できます。

```:Host Machine
$ docker image ls

REPOSITORY   TAG      IMAGE ID       CREATED         SIZE
<none>       <none>   db18651e322c   minutes ago   160MB
centos       latest   e6a0117ec169   4 months ago    272MB
ubuntu       22.04    63a463683606   4 weeks ago     70.4MB
ubuntu       21.10    2a5119fc922b   4 weeks ago     69.9MB
ubuntu       20.04    9f4877540c73   4 weeks ago     65.6MB
ubuntu       latest   9f4877540c73   4 weeks ago     65.6MB
```

ビルドしたイメージ ( `db18651e322c` ) でコンテナを起動して、意図した通りのイメージになっているか確認します。

まずはデフォルト命令を変更して日付を表示するコンテナにしたので、次の通り起動します。

- `[otpion]` → 対話しないはずなのでなし
- `<image>` → タグがないので `IMAGE ID` の `db18651e322c`
- `[command]` → デフォルト命令を確認したいのでなし

```:Host Machine
$ docker container run db18651e322c

2022/02/06 01:26:08 ( UTC )
```

`CMD` によるデフォルト命令の変更が意図通りであることを確認できます。

次は `bash` を起動したいので、次の通り起動します。

- `[otpion]` → `bash` を使うので `--interactive` と `--tty`
- `<image>` → タグがないので `IMAGE ID` の `db18651e322c`
- `[command]` → 起動したコンテナで `bash` を使いたいので `bash`

```:Host Machine
$ docker container run --interactive --tty db18651e322c bash

/ # which vi
/usr/bin/vi

/ # cd /etc

/etc # cat lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

`RUN` による `vi` のインストール、`COPY` による `.bashrc` の反映、`FROM` によるベースイメージの指定のそれぞれが意図通りであることが確認できます。

## イメージにタグをつける
毎回 `IMAGE ID` である `db18651e322c` で指定するのでは使いづらいので、ビルド結果に `-t` でタグをつけるようにします。

イメージの名前は `my-ubuntu:date` としたいので、それぞれ次のように指定します。

- `[otpion]` → `-t` で `my-ubuntu:date` を指定
- `<path>` → `COPY` に使う `.bashrc` がカレントディレクトリにあるので `.`

以上を踏まえ、次のコマンドでイメージをビルドします。

```:Host Machine
$ docker image build -t my-ubuntu:date .
```

先ほど `<none>` `<none>` となっていた部分がそれぞれ `my-ubuntu` と `date` になりました。
Dockerfile は変更していないのでビルド結果は同じため、`IMAGE ID` は `db18651e322c` 据え置きです。

```:Host Machine
$ docker image ls

REPOSITORY    TAG       IMAGE ID        CREATED          SIZE
my-ubuntu     date      db18651e322c    9 minutes ago    160MB
ubuntu        22.04     63a463683606    3 hours ago      70.4MB
ubuntu        21.10     2a5119fc922b    3 hours ago      69.9MB
ubuntu        20.04     9f4877540c73    3 hours ago      65.6MB
ubuntu        latest    9f4877540c73    3 hours ago      65.6MB
```

これで `my-ubuntu:date` で指定できるようになりました。

```:Host Machine
$ docker container run my-ubuntu:date
2022/02/06 01:50:52 ( UTC )
```

## Dockerfile のディレクトリを分ける
実際に Docker を使って開発をする場合は、Web サーバのコンテナや DB サーバのコンテナという風に複数のコンテナを活用することになります。
それに伴って Dockerfile も複数になるため、一般には Dockerfile と `COPY` に使うファイルはディレクトリを分けて管理することになります。

このページではこれ以上 Dockerfile を作りませんが、ディレクトリを分ける方法だけ確認しておきます。

まずは次のように `docker/date/` ディレクトリを作成し、このページで作成した `Dockerfile` と `.bashrc` を移動します。

```:Host Machine
$ tree .

.
`-- docker
    `-- date
        |-- .bashrc
        `-- Dockerfile
```

このディレクトリ構成でイメージをビルドする際に、`docker image build` を実行するディレクトリを変えない場合は `[option]` と `<path>` の指定を変える必要があります。

- `[otpion]` → `-t` + `-f` で `docker/date/Dockerfile` を指定
- `<path>` → `COPY` に使う `.bashrc` がある `docker/date` を指定

以上を踏まえると、イメージをビルドするコマンドは次のようになります。

```:Host Machine
$ docker image build -t my-ubuntu:date -f docker/date/Dockerfile docker/date
```

`<path>` は `COPY` の相対パスをどこから辿るかに影響します。

今のようなディレクトリ構成の場合に `COPY .bashrc /root/.bashrc` と書いたなら、`docker image build` では `docker/date` を指定しなければビルドが失敗します。

```:Host Machine
$ tree .                docker image build [option] docker/date

.
`-- docker
    `-- date
        |-- .bashrc
        `-- Dockerfile  COPY (docker/date/).bashrc /root/.bashrc
```

`docker image build` で `.` を指定したいなら、`COPY docker/date/.bashrc /root/.bashrc` と記述することになります。

```:Host Machine
$ tree .                docker image build [option] .

.
`-- docker
    `-- date
        |-- .bashrc
        `-- Dockerfile  COPY (./)docker/date/.bashrc /root/.bashrc
```

`docker image build` を実行するディレクトリを Dockerfile のある場所と同じにするなら両方を `.` にできますが、いちいちディレクトリを変えるのは面倒でしょう。

```:Host Machine
$ tree .

.
`-- docker
    `-- date
        |-- .bashrc     docker image build [option] .
        `-- Dockerfile  COPY (./).bashrc /root/.bashrc
```

どの方法を用いても良いですが、僕は `docker image build` が一番楽な `COPY docker/date/.bashrc /root/.bashrc` の方法をよく使います。
ディレクトリ名 ( `docker/date` ) を変更すると Dockerfile が壊れますが、そうそうあることではないので許容しています。

# レイヤー確認
イメージのレイヤー情報を `docker image history` で確認することができます。

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
<missing>      33 minutes ago   COPY .bashrc /root/.bashrc # buildkit           20B       buildkit.dockerfile.v0
<missing>      49 minutes ago   RUN /bin/sh -c apt install -y vim # buildkit    67.3MB    buildkit.dockerfile.v0
<missing>      50 minutes ago   RUN /bin/sh -c apt update # buildkit            27.6MB    buildkit.dockerfile.v0
<missing>      3 days ago       /bin/sh -c #(nop)  CMD ["bash"]                 0B
<missing>      3 days ago       /bin/sh -c #(nop) ADD file:3acc741be29b0b58e…   65.6MB
```

`my-ubuntu:date` は `ubuntu:20.04` を `FROM` でベースイメージに指定したので、`my-ubuntu:date` の下 2 層は `ubuntu:20.04` を同じになっています。

その上に Dockerfile に書いた `RUN` `RUN` `COPY` `CMD` が積み重なっていることが確認できます。
一番上まで積み重ねて Dockerfile によるビルドが完了したレイヤーに `IMAGE ID` ( `db18651e322c` ) が振られています。

# todo の高速化

# まとめ
- `docker build` は Dockerfile からイメージを作るコマンド
- `-f` により Dockerfile を明示できる
- `-t` によりビルド結果にタグをつけられる
- Dockerfile に書いた命令でレイヤーが積み重なりイメージになる
- イメージがレイヤーの積み重ねであることを理解しておくと、Dockerfile の理解が深まる
- Dockerfile は Git 管理下に入れ共有する





その証拠に、`rails:5.0.1` の [Dockerfile](https://github.com/docker-library/rails/blob/e16e955a67f48c1e8dc0af87ba6c0b7f8302bad2/Dockerfile) は `FROM` を除き 4 行ですが、画面で確認できるレイヤーは 22 あります。
