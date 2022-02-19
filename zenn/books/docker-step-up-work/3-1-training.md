---
title: "3-1: foo"
---

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

