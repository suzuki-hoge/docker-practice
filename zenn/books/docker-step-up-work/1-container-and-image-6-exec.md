---
title: "📚 ｜ 🐳 ｜ コンテナに接続してみよう"
---

# 目的
コンテナの確認ができるようになる

# MySQL コンテナに接続してみよう
Ubuntu コンテナは `bash` を命令したので自由に操作できましたが、MySQL コンテナは命令がサーバ起動だったのでターミナルは固まっています

このままではせっかく起動したコンテナをなにもできないので、`docker exec` で MySQL コンテナに接続してみましょう

`docker exec` はコンテナに命令を送るコマンドです

```
$ docker exec [option] container command
```

コンテナは`コンテナ ID` か `コンテナ名` で指定するので、まずはそれらを `docker ps` で確認しましょう ( todo others )

```
$ docker ps

CONTAINER ID    IMAGE        COMMAND                   CREATED          STATUS          PORTS                  NAMES
11d945f0edf0    mysql:5.7    "docker-entrypoint.s…"    7 minutes ago    Up 7 minutes    3306/tcp, 33060/tcp    stupefied_napier
```

MySQL コンテナを指定するには `11d945f0edf0` か `stupefied_napier` を指定すれば良いということが確認できました

`docker exec` で環境変数の確認でもしてみましょう

```
$ docker exec 11d945f0edf0 env

HOME=/root
MYSQL_VERSION=5.7.36-1debian10
MYSQL_MAJOR=5.7
GOSU_VERSION=1.12
MYSQL_DATABASE=event
MYSQL_PASSWORD=password
MYSQL_USER=hoge
MYSQL_ROOT_PASSWORD=rootpassword
HOSTNAME=758a80125fd4
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

コンテナの中で `env` が実行されました

コンテナ名でも確認しておきましょう

:::details ワーク: コンテナ名を使って環境変数を確認する
```
$ docker exec stupefied_napier  env

HOME=/root
MYSQL_VERSION=5.7.36-1debian10
MYSQL_MAJOR=5.7
GOSU_VERSION=1.12
MYSQL_DATABASE=event
MYSQL_PASSWORD=password
MYSQL_USER=hoge
MYSQL_ROOT_PASSWORD=rootpassword
HOSTNAME=758a80125fd4
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```
:::

:bulb: `docker run` と似ていますが `docker exec` はコンテナを指定しています

todo e

`docker xxx` が何を引数に何を行っているか、本当にちゃんと意識しましょう
面倒なようですがそれが一番の近道です

次は `bash` を命じてみましょう

`bash` を使うときは `docker run` と同じく `-it` が必要です

```
$ docker exec -it 11d945f0edf0 bash

#
```

データベースに繋いでみましょう

MySQL サーバに接続する `mysql` コマンドの書式は次の通りです

```
mysql -h host -u user -ppassword database
```

:::details MySQL コンテナの `bash` から MySQL サーバに接続
`host` は MySQL コンテナの `bash` から繋ぐので `localhost` で、それ以外は自分で決めたパラメータです

`-p` と `password` の間は空白がないことに気をつけましょう

```
# mysql -h localhost -u hoge -ppassword event

mysql>
```

`password` を非表示で入力したい場合は `-p` のみ指定します

```
# mysql -h localhost -u hoge -p event

Enter password:

mysql>
```

この Book ではローカル開発環境なので `-ppassword` の方を多用します
:::

接続できたらいくつか確認をしておきましょう

`-e MYSQL_DATABASE` で指定したデータベースだけがあることを確認できます

```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| event              |
+--------------------+
2 rows in set (0.00 sec)

mysql> use event;
Database changed

mysql> show tables;
Empty set (0.00 sec)
```

## 別の
`docker exec` で命令が送れるということは、`bash` を命令してから `mysql` を入力せずに `mysql` 命令を送ってしまうこともできるということです

:::details MySQL コンテナに mysql 命令を送りデータベースに接続する
```
$ docker exec -it 11d945f0edf0 mysql -h localhost -u hoge -ppassword event

mysql>
```

コンテナの中で動いたコマンド全くそのままです

`docker exec` 自体はホストマシンのターミナルで書いてますが、`mysql` コマンドが実行されるのはコンテナの中だと意識しましょう
:::

ホストマシンから MySQL コンテナのデータベースに接続しているのではなく、ホストマシンからコンテナへ MySQL データベースに接続する命令を送っているということを理解しましょう

todo e

# create table & insert
mysql> create table foo ( id char(255) not null primary key );
Query OK, 0 rows affected (0.07 sec)

mysql> insert into foo ( id ) values ( 1 );
Query OK, 1 row affected (0.06 sec)

mysql> insert into foo ( id ) values ( 2 );
Query OK, 1 row affected (0.00 sec)

mysql> select * from foo;
+----+
| id |
+----+
| 1  |
| 2  |
+----+
2 rows in set (0.01 sec)

# まとめ
`docker exec` を紹介しました

![image](/images/slide/slide.009.jpeg)

- `docker exec` は起動しているコンテナに命令を送るコマンド
- `docker run` と文法は似ているが、指定するものが違うことを意識する
- コンテナへの SSH というのは普通は行わない、`docker exec` で `bash` を命じれば良い

`docker exec` は言語コンテナに「ちょっとこれテストしてくれや」とか「ちょっとコンテナ内のサーバログ見せてや」みたいな感じでそこそこ使います

思った通りに動かない時に直接 `bash` で接続してデバッグしたりもするので、覚えておきましょう

- [step1](books/docker-step-up-work/bk/step1.mder-step-up-work/bk/step1.md)
- [step3](books/docker-step-up-work/bk/step3.mder-step-up-work/bk/step3.md)


## 桁数