---
title: "🖥️ ｜ 🐳 ｜ MySQL サーバの設定をしよう"
---

# 目的・動機
文字コードやログの設定を行うためには MySQL サーバが起動する前に設定ファイルを配置する必要があります。

MySQL イメージをそのまま `docker run` してしまうとただ MySQL サーバが起動するだけなので、設定ファイルを持った MySQL イメージを作って解消できるようになりましょう。

# このページで初登場するコマンド
[Dockerfile](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/builder/)

命令 | 意味 | 用途  
:-- | :-- | :--
`COPY` | ホストマシンのファイルをイメージにコピーする | 設定ファイルなどをイメージに含める

[`docker image rm [option] <image>](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/image_rm/)

命令 | 意味 | 用途  
:-- | :-- | :--
`-f, --force` | 強制的に削除する | 関連するイメージがあっても消したい場合など

# 🖥️ MySQL サーバの設定をしよう
## Dockerfile の作成とビルド
MySQL データベースは `/etc` に `.cnf` ファイルを置くことで各種設定が行えます。

次に示す `my.cnf` を MySQL サーバの起動前にコンテナ内の `/etc` に置くことができれば、このファイルの内容を反映した MySQL サーバが起動するはずです。

```txt:my.cnf
[mysqld]
character_set_server = utf8                    
collation_server     = utf8_unicode_ci         
general_log          = 1                       
general_log_file     = /var/log/mysql/query.log
log-error            = /var/log/mysql/error.log

[client]
default-character-set = utf8
```

このようにコンテナ内に設定ファイルを配置したい時は、Dockerfile の `COPY` を使います。

Dockerfile は 1 イメージにつき 1 つ必要なので、既にある `docker/php/Dockerfile` ではなく MySQL コンテナ用の Dockerfile を作る必要があります。
次にその Dockerfile と同じディレクトリに `my.cnf` を保存しましょう。

```
$ tree .

docker
|-- mysql
|   |-- Dockerfile
|   `-- my.cnf
`-- php
    `-- Dockerfile
```

`docker/mysql/Dockerfile` の中身は、特にインストールしたいものがあるわけではないので `FROM` と `COPY` だけです。

```txt:docker/mysql/Dockerfile
FROM --platform=linux/amd64 mysql:5.7

COPY ./docker/mysql/my.cnf /etc/my.cnf
```

`FROM` には `docker run` の時と同様に `--platform=linux/amd64` オプションを指定しています。

`COPY` は `<hostmachine-path> <container-path>` という順番でパスを 2 つ指定することで、ホストマシンのファイルをイメージ内に配置することができます。

Dockerfile が書けたら `docker build` でビルドします。

Dockerfile がカレントディレクトリにないのでオプションで指定する必要があります。
イメージの名前は `docker-step-up-work-build_mysql` にしましょう。
パスは `.` です。

ビルドが成功したらイメージ一覧を確認しましょう。

:::details ワーク: Dockerfile をビルド、イメージを確認
Dockerfile の指定は `-f` で、イメージ名の指定は `-t` で行います。

```
$ docker build                       \
    -f docker/php/Dockerfile         \
    -t docker-step-up-work-build_php \
    .
```

イメージの一覧は `docker image ls` で確認します。

```
$ docker image ls | grep step-up
docker-step-up-work-build_mysql    latest    90e1d09b877e    1 hours ago    448MB
docker-step-up-work-build_php      latest    176ddd804a12    2 hours ago    303MB
```
:::

## docker build のパスと COPY
`docker build` の `<path>` は、Dockerfile の `COPY` のホストマシンの相対パスをどこから辿るかに影響します。

次のようなディレクトリ構成の場合 `COPY` を `docker/mysql` から書いたなら、`docker build` では `.` を指定しなければビルドが失敗します。

```
$ tree .                docker build [option] .

docker
`-- mysql
    |-- Dockerfile      COPY (./)docker/mysql/my.cnf /etc/my.cnf
    `-- my.cnf
```

Dockerfile にディレクトリ構成を書きたくないのなら、`docker build` の `<path>` の方を調整する必要があります。

```
$ tree .                docker build [option] docker/mysql

docker
`-- mysql
    |-- Dockerfile      COPY (docker/mysql/)my.cnf /etc/my.cnf
    `-- my.cnf
```

もしくは `docker build` を実行するディレクトリを Dockerfile のある場所と同じにする必要があります。

```
$ tree .

docker
`-- mysql               docker build [option] .
    |-- Dockerfile      COPY (./)my.cnf /etc/my.cnf
    `-- my.cnf
```

どの方法を用いても良いですが、僕は `cd` せずかつ `.` で済ませられるのが楽なので最初の例をよく使います。
ディレクトリ名を `docker/mysql` から `docker/db` に変えたりすると Dockerfile が壊れますが、そうそうあることではないので許容しています。

複数の Dockerfile を扱うときや Docker Compose を使うときに、この仕様を知らないとビルド失敗になりやすいので覚えておくと良いでしょう。

## 作成したイメージでコンテナを起動
イメージができたのでコンテナを起動して確認しておきましょう。

起動するイメージは、当然さきほどビルドした `docker-practice-build_mysql` です。

```
$ docker run                        \
    --name mysql                    \
    --rm                            \
    --platform=linux/amd64          \
    -d                              \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_USER=hoge              \
    -e MYSQL_PASSWORD=password      \
    -e MYSQL_DATABASE=event         \
    docker-practice-build_mysql
```

コンテナ内にちゃんとファイルがあるか確認するくらいなら、`ls` 命令や `cat` 命令を送れば十分でしょう。

```
$ docker exec mysql ls -l /etc/my.cnf
-rw-r--r-- 1 root root 269 Jan 26 09:16 /etc/my.cnf
```

```
$ docker exec mysql head -n 3 /etc/my.cnf
[mysqld]
character_set_server = utf8
collation_server     = utf8_unicode_ci
```

サーバの `/etc/my.cnf` の存在が確認できればひとまずは大丈夫です。

## 設定ファイルが不正な場合
試しに `my.cnf` の `= utf8` を適当に `= nihongo` にでも変えてみると、不正な設定ファイルになります。

この変更を加えた後に `docker build` をして `docker run` をすると、どちらのコマンドが失敗するでしょうか。

:::details ワーク: エラーが出るコマンドを考えたら開く
エラーが発生するのは `docker run` です。

確認してみましょう。

まずは一度 `docker image rm` でイメージを削除します。

```
$ docker image rm -f docker-practice-build_mysql
```

`my.cnf` を適当に書き換えて、ビルドします。

```
$ vi docker/mysql/my.cnf

$ docker build                       \
    -f docker/php/Dockerfile         \
    -t docker-step-up-work-build_php \
    .

 => => writing image sha256:f5add4d6408a62c29d658690c4f7f4ced650c2f9999e8853d77ca61fbfe343f5                                                                                                           0.0s
 
$
```

イメージの作成はできますが、コンテナの起動には失敗します。

```
$ docker run                        \
    --name mysql                    \
    --rm                            \
    --platform=linux/amd64          \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_USER=hoge              \
    -e MYSQL_PASSWORD=password      \
    -e MYSQL_DATABASE=event         \
    docker-step-up-work-build_mysql
    
mysqld: Character set 'nihongo' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
```

Dockerfile に書いた `RUN` が `docker build` で実行されるので、Dockerfile に問題があれば `docker build` が失敗するという感覚になりがちです。
が、`COPY` はイメージにファイルを配置しているだけで、エラーになるのは初めてそのファイルを読み取る `docker run` によるサーバ起動時です。

たまにうっかりしているとこれを勘違いしてハマることがあるので、よく理解しておきましょう。
:::

# まとめ
- サーバの設定などを行う場合は、コンテナ起動より前に設定ファイルを配置する必要がある
- そのためには Dockerfile の `COPY` を使い、イメージに設定ファイルを含めておく
- `COPY` の相対パスは `docker build` の `<path>` に依存して決まる
- Dockerfile および `COPY` したファイルの不備が、必ずしも `docker build` で検知できるとは限らない
