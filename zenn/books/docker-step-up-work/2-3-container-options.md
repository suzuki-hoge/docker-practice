---
title: "2-3: コンテナの基礎２ 起動オプションと停止と削除"
---

トレーニングでも使う〜〜
todo 〜〜のためののコンテナについて理解します。

# このページで初登場するコマンドとオプション
## コンテナを起動する
```:新コマンド
$ docker container run [option] <image> [command]
```

```:旧コマンド
$ docker run [option] <image> [command]
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-e, --env`   | 環境変数を設定する | 意味の通り
`-d, --detach`   | バックグラウンドで実行する | ターミナルが固まるのを避ける
`--name`   | コンテナに名前をつける | コンテナを指定しやすくする
`--rm`   | コンテナ終了時にコンテナを削除する | コンテナ名衝突のエラーを避ける

## コンテナを停止する
```:新コマンド
$ docker container stop [option] container
```

```:旧コマンド
$ docker stop [option] container
```

### オプション
このページで新たに使うオプションはなし

## コンテナを削除する
```:新コマンド
$ docker container rm [option] container
```

```:旧コマンド
$ docker rm [option] container
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-f, --force`   | 実行中のコンテナを強制削除する | 停止と削除をまとめて行う

# コンテナの起動オプション
## コンテナ名の指定
`docker container run` の `--name` オプションを使うと、コンテナ起動時にランダムに振られるコンテナ名を自分で決めることができます。

```:Host Machine
$ docker container run \
  --interactive        \
  --tty                \
  --name ubuntu        \
  ubuntu:20.04         \
  bash
```

:::message
ここからはコマンドがどんどん長くなるので `\` で改行しています。

そのままペーストして 1 コマンドとして実行できますが、初見のパラメータなどは極力自分の手で入力するようにしましょう。

手打ちもタイポして出るエラーを読むのもとても大事です、最終的な理解度が全く変わります。
:::

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE          COMMAND   CREATED          STATUS          PORTS     NAMES
d14eebbbc3b2   ubuntu:20.04   "bash"    52 seconds ago   Up 51 seconds             ubuntu
```

コンテナ名を指定すると、人間にとってコンテナ一覧がわかりやすくなるだけでなく、多くのコンテナを引数に取るコマンドの実行が楽になります。

このページの残りの説明や後半のトレーニングでも、基本的にコンテナ起動には `--name` を指定することにし、それを前提として他のコマンドも組み立てることにします。

## 環境変数の指定
イメージによっては起動時に環境変数の指定が必要なものがあるので、`mysql:5.7` を使って使い方を確認します。

MySQL コンテナを起動して `mysqld` を起動したいと思うので、それぞれ次のように指定します。

- `[otpion]` → 対話はしないので `--name` のみ
- `<image>` → MySQL コンテナを起動したいので `mysql:5.7`
- `[command]` → 公式イメージは基本的にデフォルト命令に従えば良いのでなし

以上を踏まえ、次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run \
  --name mysql         \
  mysql:5.7
```

ただし Mac ( M1 ) の場合は次のように `--platform` オプションを指定する必要があります。

```:Host Machine
$ docker container run   \
  --platform=linux/amd64 \
  --name mysql           \
  mysql:5.7
```

`--platform=linux/amd64` は一部のコンテナを Mac ( M1 ) で動かすために必要なオプションです。

Windows および Mac ( Intel ) の方は付けても付けなくても結果に違いはありませんし、この Book 全ての場所で省略しても構いません。

この Book では Mac ( M1 ) で動かすために必要な場合では必ず明示することにしますが、不要な方に関しては付ける付けないの判断は自由です。

この Book では Mac ( M1 ) の Docker 事情については割愛します、興味のある方は以前公開した別の Book をご覧ください。

https://zenn.dev/suzuki_hoge/books/2021-12-m1-docker-5ac3fe0b1c05de

話を戻します。
`docker container run` の結果を見ると、次のようなエラーを出力してコンテナは起動していません。

```:Host Machine
$ docker container run   \
  --platform=linux/amd64 \
  --name mysql           \
  mysql:5.7

2022-02-06 03:20:23+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
    You need to specify one of the following:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD
```

`You need to specify one of the following:` に対応するために、`-e` による環境変数の指定を行います。

環境変数の変数名と意味は [Docker Hub の該当イメージのトップページ](https://hub.docker.com/_/mysql) に行けば説明がありますが、このページではとりあえず `MYSQL_ROOT_PASSWORD` だけ指定することにします。それ以外は todo で決定します。

```:Host Machine
$ docker container run                \
  --platform=linux/amd64              \
  --name mysql                        \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  mysql:5.7
  
Version: '5.7.36'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
```

大量の出力の最後に次のように出ていれば、MySQL サーバが起動したコンテナが正常に起動しています。

```:Host Machine
Version: '5.7.36'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
```

todo e

## コンテナをバックグラウンドで実行する
`mysql:5.7` のようにコンテナを起動するたびにターミナルが固まってしまうと、ターミナルをたくさん開かなければいけなくなり煩雑になってしまいます。

MySQL サーバのような「ただずっと立っていてくれればいい」ようなコンテナの場合は、`--detach` オプションを使ってバックグラウンド実行をすると良いでしょう。

```:Host Machine
$ docker container run                \
  --platform=linux/amd64              \
  --name mysql                        \
  --detach                            \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  mysql:5.7
  
335b732ab22fce8add8f719370ed66df5c0b90fe7e2f022715456a684860c76e

$
```

`--detach` オプションにより `CONTAINER ID` が表示されるだけになり、プロンプトもすぐホストマシンの `$` に戻ってきています。

# コンテナの停止と削除
## コンテナの停止
`mysql:5.7` イメージのデフォルト命令は、`bash` のように対話する命令でも `cat /lsb-releaese` のような即時完了する命令でもなく、MySQL サーバの起動 ( 実態は `mysqld` ) です。

`mysqld` も `bash` と同じく終了するまで続くプロセスですが、`bash` のように `exit` することができません。

そのようなコンテナを停止する場合は `docker container stop` を使います。

```:新コマンド
$ docker container stop [option] container
```

`container` は `docker container ls` の中からコンテナを一意に識別できれば `NAMES` でも 何桁の `CONTAINER ID` でも構いません。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE       COMMAND                  CREATED         STATUS         PORTS                 NAMES
536f4248760f   mysql:5.7   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   3306/tcp, 33060/tcp   mysql
```

ここでコンテナ起動時に指定した `--name` が役に立ちます。
起動するたびに毎回ランダムで振られる `CONTAINER ID` や `NAMES` と違い、毎回同じ値で `--name` を指定していれば、いちいちコンテナ一覧を確認する手間が省略できます。

`NAMES` を使って MySQL コンテナを停止するには、次のように実行します。

```:Host Machine
$ docker container stop mysql
```

無事停止できたことが確認できました。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

## コンテナの削除
実はコンテナは停止しただけでは削除されておらず、`docker container ls` で全てのステータスのコンテナを表示すると、今まで停止したコンテナの存在が確認できます。

```:Host Machine
$ docker container ls --all

CONTAINER ID   IMAGE       COMMAND                  CREATED         STATUS                      PORTS   NAMES
536f4248760f   mysql:5.7   "docker-entrypoint.s…"   3 minutes ago   Exited (0) 37 seconds ago           mysql
```

削除しないとホストマシンに不要な情報が残り続けるだけでなく、同じ `--name` でコンテナを起動できなくなってしまいます。

```:Host Machine
$ docker container run                \
  --platform=linux/amd64              \
  --name mysql                        \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  mysql:5.7
  
docker: Error response from daemon: Conflict.
The container name "/mysql" is already in use by container "536f4248760f66378a23205303a5ae554d7f0076b26d0a3c929c8daca175fb56".
You have to remove (or rename) that container to be able to reuse that name.
```

この状態を避けるにはコンテナを削除する必要があります。

```:新コマンド
$ docker container rm [option] container
```

削除してコンテナ一覧を確認します。

```:Host Machine
$ docker container rm mysql

$ docker container ls --all

CONTAINER ID   IMAGE       COMMAND                  CREATED         STATUS                      PORTS   NAMES
```

完全に削除できたことが確認できます。

また、`docker container rm` に `--force` オプションを付けることで、起動中のコンテナの停止と削除をまとめて行うことが可能です。

```:Host Machine
$ docker container run                \
  --platform=linux/amd64              \
  --name mysql                        \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  mysql:5.7
```

```:Host Machine
$ docker container rm \
  --force             \
  mysql
  
$ docker container ls --all

CONTAINER ID   IMAGE       COMMAND                  CREATED         STATUS                      PORTS   NAMES
```

