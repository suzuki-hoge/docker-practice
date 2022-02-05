---
title: "📚 ｜ 🐳 ｜ コンテナに名前をつけてみよう"
---

# 導入
## 目的・動機
毎回 `docker ps` をして `CONTAINER ID` を調べるのは面倒なので、`NAMES` を自分で指定する方法を知っておきましょう。

## このページで初登場するコマンド
[`docker run [option] <image> [command] [arg...]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/run/)

オプション | 意味 | 用途  
:-- | :-- | :--
`--name`   | コンテナに名前をつける | コンテナを指定しやすくする
`--rm`   | コンテナ終了時にコンテナを削除する | 同じ名前で次に起動する時にエラーになるのを避ける

# コンテナに名前をつける
## コンテナを特定しやすいように起動する
`docker exec` のような `<container>` を引数に取るコマンドは、要するにコンテナが一意になれば良いので `CONTAINER ID` にこだわる必要はありません。

`docker ps` の `NAMES` にはランダムな名前が毎回割り当てられていますが、これを自分で指定することができます。

まずは起動中のコンテナを一度全部削除 ( `docker rm` ) しましょう。

停止していることを確認 ( `docker ps -a` ) できたら、`docker run` に `--name` オプションを追加して 3 コンテナを起動し直しましょう。
コンテナ名はそれぞれ `php`, `mysql`, `mail` とします。

対話する Ubuntu コンテナの起動には `-it` を、対話しない MySQL コンテナと Mail コンテナの起動には `-d` を指定しています。

また `--rm` オプションも付けておきます。
`--rm` オプションがあれば `docker stop` によるコンテナ終了時に自動的にコンテナ削除もされるようになります。
`--name` を指定して `--rm` を指定しないと、終了済みコンテナに使った名前が残り続けてしまい、コンテナを削除しない限りその名前が使えなくなってしまうからです。

```
$ docker run     \
    --name php   \
    --rm         \
    -it          \
    ubuntu:20.04 \
    bash
```

```
$ docker run                            \
    --name mysql                        \
    --rm                                \
    --platform=linux/amd64              \
    -d                                  \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_USER=hoge                  \
    -e MYSQL_PASSWORD=password          \
    -e MYSQL_DATABASE=event             \
    mysql:5.7
```

```
$ docker run               \
    --name mail            \
    --rm                   \
    --platform=linux/amd64 \
    -d                     \
    schickling/mailcatcher
```

コンテナ一覧の `NAMES` を見ると、設定した通りになっています。

```
$ docker ps -a

CONTAINER ID    IMAGE                     COMMAND                   CREATED          STATUS              PORTS                  NAMES
13850ae487a9    ubuntu:20.04              "bash"                    4 minutes ago    Up 2 seconds ago                           php
c3d991c304bd    mysql:5.7                 "docker-entrypoint.s…"    7 minutes ago    Up 6 seconds ago    3306/tcp, 33060/tcp    mysql
1fb785309c3b    schickling/mailcatcher    "mailcatcher --no-qu…"    6 seconds ago    Up 9 seconds ago    1025/tcp, 1080/tcp     mail
```

`CONTAINER ID` ではなく `NAMES` でも `docker exec` や `docker stop` ができることを確認しておきましょう。

:::details ワーク: 3 コンテナに date 命令を送る、3 コンテナを終了する、コンテナ情報が残ってないことを確認
```
$ docker exec php date
Sun Jan 30 11:02:06 UTC 2022
```

```
$ docker exec mysql date
Sun Jan 30 11:02:10 UTC 2022
```

```
$ docker exec mail date
Sun Jan 30 11:02:15 UTC 2022
```

`docker stop` は複数コンテナを指定できます。

```
$ docker stop php mysql mail
php
mysql
mail
```

終了後にコンテナ情報が残ってないことを確認します。

```
$ docker ps -a

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```
:::

# まとめ
- `docker run` の `--name` オプションで、コンテナに好きな名前をつけられる
- `docker exec` や `docker stop` でコンテナを指定する時に、自分でつけたコンテナ名で指定できる  
- `docker run` の `--rm` オプションで、`docker stop` によるコンテナ終了でもコンテナが削除される
