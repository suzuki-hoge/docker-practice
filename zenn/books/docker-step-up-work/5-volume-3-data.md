---
title: "🖥️ ｜ 🐳 ｜ MySQL コンテナのデータが残るようにしよう"
---
## todo bash → php -S

# 🖥️ MySQL コンテナのデータがコンテナを終了しても消えないようにする
`mysql:5.7` のデータの実態はコンテナ内の `/var/lib/mysql` というディレクトリにあります

このディレクトリをホストマシンと共有しておくことで、データベースの状態を維持できるようにします

ネームドマウントでコンテナを起動して、MySQL コンテナにデータを挿入してみましょう

`create table` 文と `insert` 文は次の通りです

```sql
create table event.mail (
    adr  char(255) not null,
    sub  char(255) not null,
    body char(255) not null,
    at   char(255) not null
);
```

```sql
insert into mail (adr, sub, body, at) values ('foo@localhost.com', 'hello', 'world', '2022-01-26 12:34:56');
```

:::details ワーク: コンテナの停止、コンテナの起動、MySQL サーバに接続、テーブルの作成、データの挿入
コンテナの停止は `docker stop <CONTAINER>` です

```
$ docker stop <MySQL>
```

todo create

コンテナの起動は `docker run <IMAGE>` に `-v <volume-name>:<container-path>` です

```
$ docker run                                            \
    --platform=linux/amd64                              \
    -d                                                  \
    -e MYSQL_ROOT_PASSWORD=password                     \
    -e MYSQL_USER=hoge                                  \
    -e MYSQL_PASSWORD=password                          \
    -e MYSQL_DATABASE=event                             \
    -v docker-practice-build-mysql-store:/var/lib/mysql \
    mysql:5.7
```

MySQL サーバへの接続は `docker exec -it <CONTAINER> bash` + `mysql -h <host> -u <username> -p<password> <database>` です

```
$ docker exec -it <MySQL> bash

# mysql -h localhost -u hoge -ppassword event
```

もしくは直接 `mysql` 命令を送っても良いでしょう

```
$ docker exec -it 9c82 mysql -h localhost -u hoge -ppassword event
```

テーブルの作成とデータの挿入は MySQL データベースに接続したらペーストするだけです

```
mysql> create table event.mail (
    ->     adr  char(255) not null,
    ->     sub  char(255) not null,
    ->     body char(255) not null,
    ->     at   char(255) not null
    -> );

Query OK, 0 rows affected (0.05 sec)
```

```
mysql> insert into mail (adr, sub, body, at) values ('foo@localhost.com', 'hello', 'world', '2022-01-26 12:34:56');

Query OK, 1 row affected (0.04 sec)
```

```
mysql> select * from mail;

+-------------------+-------+-------+---------------------+
| adr               | sub   | body  | at                  |
+-------------------+-------+-------+---------------------+
| foo@localhost.com | hello | world | 2022-01-26 12:34:56 |
+-------------------+-------+-------+---------------------+
1 row in set (0.01 sec)
```
:::

MySQL コンテナのデータベースにデータを挿入したので、一度コンテナを終了してから同じボリュームを指定して起動し、データが残っているか確認しましょう

直前の手順とほぼ同じですが、練習と思ってまたやってみましょう

:::details ワーク: コンテナの停止、コンテナの起動、データの確認
コンテナの停止は `docker stop <CONTAINER>` です

```
$ docker stop <MySQL>

```
同じボリュームを指定して起動します

```
$ docker run                                            \
    --platform=linux/amd64                              \
    -d                                                  \
    -e MYSQL_ROOT_PASSWORD=password                     \
    -e MYSQL_USER=hoge                                  \
    -e MYSQL_PASSWORD=password                          \
    -e MYSQL_DATABASE=event                             \
    -v docker-practice-build-mysql-store:/var/lib/mysql \
    mysql:5.7
```

データの確認はまた違う方法でやってみます

`mysql` には `-e` で文字列を渡すとそれを実行してくれる機能があるので、それを使います

```
$ docker exec -it 9c82 mysql -h localhost -u hoge -ppassword event -e 'select * from mail;'

+-------------------+-------+-------+---------------------+
| adr               | sub   | body  | at                  |
+-------------------+-------+-------+---------------------+
| foo@localhost.com | hello | world | 2022-01-26 12:34:56 |
+-------------------+-------+-------+---------------------+
```

多段に命令を送りつける構成になっていますね

ホストマシンで実行したこのコマンドがどう伝わったのかを強く意識すると理解が進みます

todo e
:::

コンテナを一度終了したのに挿入したデータが残っていることを確認できました

