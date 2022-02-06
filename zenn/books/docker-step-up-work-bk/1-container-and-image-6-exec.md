---
title: "📚 ｜ 🐳 ｜ コンテナに接続してみよう"
---

# 導入
## 目的・動機

このページで、起動だけして何も確認できていなかった MySQL コンテナと Mail コンテナの簡単な動作確認をします。

## このページで初登場するコマンド
[`docker exec [option] <container> command [arg...]`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/exec/)

オプション | 意味 | 用途  
:-- | :-- | :--
`-i, --interactive`   | コンテナの標準入力に接続する | コンテナを対話操作する
`-t, --tty`   | 擬似ターミナルを割り当てる   | コンテナを対話操作する
`-u, --user`   | ユーザを指定する   | root ユーザで作業をするなど

# 起動中の MySQL コンテナに命令を送る
## コンテナを指定して命令を送る
Ubuntu コンテナは `bash` を命令したので自由に操作できましたが、MySQL コンテナは命令がサーバ起動だったのでターミナルは固まっています。

このままではせっかく起動したコンテナを活用できないので、`docker exec` で MySQL コンテナに接続してみましょう。

`docker exec` はコンテナに命令を送るコマンドです。

```txt:docker exec
$ docker exec [option] <container> command
```

コンテナは `docker ps` で確認できる `CONTAINER ID` か `NAMES` を用いて指定します。

```
$ docker ps

CONTAINER ID    IMAGE                     COMMAND                   CREATED          STATUS          PORTS                  NAMES
c8cabbe7b1ae    ubuntu:20.04              "bash"                    4 minutes ago    Up 9 minutes                           sharp_galileo
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"    7 minutes ago    Up 7 minutes    3306/tcp, 33060/tcp    stupefied_napier
2c70700cc16b    mailhog/mailhog:v1.0.1    "MailHog"                 1 second ago     Up 1 minutes    1025/tcp, 8025/tcp     confident_fermat
```

MySQL コンテナを指定するには `11d945f0edf0` か `stupefied_napier` を指定すれば良いということが確認できました。

`docker exec` で環境変数の確認 ( `env` ) でもしてみましょう。

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

コンテナに `env` 命令を送りつけたことで、コンテナの中で `env` が実行され、コンテナの環境変数を確認できました。

コンテナ名でも確認しておきましょう。

:::details ワーク: コンテナ名を使って環境変数を確認する
```
$ docker exec stupefied_napier env

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

## bash 命令を送る
次は `bash` を命じてみましょう。

`bash` を使うときは `docker run` と同じく `-it` ( オプションの意味も同じです ) が必要です。

```
$ docker exec -it 11d945f0edf0 bash

#
```

起動中の MySQL コンテナの `bash` に接続できたので、ここから MySQL データベースに接続してみましょう。

MySQL サーバに接続する `mysql` コマンドの書式は次の通りです。

```txt:mysql
mysql -h <host> -u <user> -p<password> <database>
```

MySQL コンテナを起動したときに `-e` で指定したパラメータを思い出して、接続してみましょう。

:::details ワーク: MySQL コンテナの `bash` から MySQL サーバに接続
次のように実行した場合、`<user>` は `hoge`、`<password>` は `password`、`<database>` は `event` です。

```
$ docker run                            \
    --platform=linux/amd64              \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_USER=hoge                  \
    -e MYSQL_PASSWORD=password          \
    -e MYSQL_DATABASE=event             \
    mysql:5.7
```

`<host>` は MySQL コンテナの `bash` から繋ごうとしているので `localhost` です。

```
# mysql -h localhost -u hoge -ppassword event

mysql>
```
:::

MySQL データベースに接続できたら、`-e MYSQL_DATABASE` で指定したデータベースがあることを確認しましょう。

```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| event              |
+--------------------+
2 rows in set (0.00 sec)
```

テーブルは当然ありません。

```
mysql> use event;
Database changed

mysql> show tables;
Empty set (0.00 sec)
```

たった数分で起動した MySQL コンテナですが、データベースまで作られていることが確認できました。

これで MySQL コンテナの起動がまずは十分だということがやっと確認できました。

## mysql 命令を送る
`docker exec` で命令が送れるということは、`bash` を命令してから `mysql` を実行せず `mysql` 命令を送ってしまうこともできるということです。

```
$ docker exec -it 11d945f0edf0 mysql -h localhost -u hoge -ppassword event

mysql>
```

MySQL コンテナ内の `bash` で使ったコマンドそのままを丸ごとホストマシンから送りつけて接続できます。

`bash` を経由するより手数が少なくて楽ですし、コンテナを終了すると消えてしまうコンテナ内の `bash` ではなくホストマシンのターミナルにコマンド履歴が残るので、何かと便利です。

ホストマシンから MySQL コンテナのデータベースに接続しているのではなく、ホストマシンからコンテナへ MySQL データベースに接続する命令を送っているということをよく理解しておきましょう。

```txt:todo picture
ホストマシン         --->     コンテナ          ----->      データベース
mysql 実行してくれ   --->    mysql 実行するぞ   ---->        mysql> 入力をどうぞ
```

## テーブルを作ってデータを入れておく
せっかく MySQL データベースに繋がったので、試しに適当なテーブル ( `foo` ) を作ってデータを追加しておきましょう。

```
mysql> use event;
Database changed

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
```

ホストマシンから `foo` テーブルの中身を確認する練習をして、MySQL コンテナの確認はおしまいです。

:::details ワーク: ホストマシンから foo テーブルの中身を確認
`docker exec` で `bash` を命令しそこから `mysql` で接続する方法でも、`docker exec` で `mysql` 命令を送る方法でも良いですが、`mysql -e` を使う方法も紹介しておきましょう。

`mysql` は `-e` で文字列を渡すとそのクエリを実行してくれる機能があります。

これを使えばホストマシンから一切の対話操作を行わずテーブルの中身を参照することができます。

```
$ docker exec -it 11d945f0edf0 mysql -h localhost -u hoge -ppassword event -e 'select * from foo;'

+----+
| id |
+----+
| 1  |
| 2  |
+----+
```

自動化などを行う際に役に立つので、覚えておくと便利かもしれません。

:::

# 起動中の Mail コンテナに命令を送る
## sh 命令を送る
Mail コンテナも起動しただけで何にも使っていないので、動作確認をしておきましょう。

コンテナが起動中であることを確認し ( もしくは起動し ) ます。

```
$ docker ps

CONTAINER ID    IMAGE                     COMMAND                   CREATED          STATUS          PORTS                  NAMES
c8cabbe7b1ae    ubuntu:20.04              "bash"                    4 minutes ago    Up 9 minutes                           sharp_galileo
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"    7 minutes ago    Up 7 minutes    3306/tcp, 33060/tcp    stupefied_napier
2c70700cc16b    mailhog/mailhog:v1.0.1    "MailHog"                 1 second ago     Up 1 minutes    1025/tcp, 8025/tcp     confident_fermat
```

`bash` 命令を送ります。

```
$ docker exec -it 2c70700cc16b bash
OCI runtime exec failed: exec failed: container_linux.go:380: starting container process caused: exec: "bash": executable file not found in $PATH: unknown

$
```

`bash` がないと怒られてしまいました。

イメージは本当に最低限のコマンドしか入ってないことが多く、`bash` がないことも珍しくありません。

その場合は `sh` で接続しましょう。

```
$ docker exec -it 2c70700cc16b sh

#
```

`curl` で Mail サーバが起動中であることを確認したいですが、`bash` がなかったくらいなので `curl` もないでしょう。

`apk` を使ってインストールします。
( なぜ `apt` ではなく `apk` を使えば良いと判断できるかは [OS やパッケージ管理コマンドを把握するには？](#todo) で解説します )

```
# apk update && apk add curl

ERROR: Unable to lock database: Permission denied
ERROR: Failed to open apk database: Permission denied
```

今度は権限不足で怒られてしまいました。

今は `mailhog` というユーザで接続しているようですが、一度切断して `docker run` の `-u` オプションで `root` ユーザを指定しなければなりません。

```
# whoami

mailhog

# exit
```

```
$ docker exec -it -u root 2c70700cc16b sh

# whoami

root
```

改めて `curl` のインストールを済ませてしまいましょう。

```
# apk update && apk add curl
```

[Docker Hub の MailHog のトップページ](https://hub.docker.com/r/mailhog/mailhog) を見ると MailHog の HTTP サーバは `8025` ポートで起動するようです。

> `the HTTP server starts on port 8025`

そこに向けて `curl` してみましょう。

```
# curl localhost:8025

<!DOCTYPE html>
<html ng-app="mailhogApp">
  <head>
    <title>MailHog</title>
    <meta charset="utf-8">
    略
```

HTTP サーバが起動していることが確認できました、これで Mail コンテナもやっと動作確認ができました。

# まとめ
- `docker run` はイメージからコンテナを起動するコマンドである
- `docker exec` は起動しているコンテナに命令を送るコマンドである
- 基本的にコンテナへの SSH 接続というのは行わず、`bash` 命令を送る

`docker run` や `docker exec` が何を引数に何を行っているか、本当にちゃんと意識しましょう。面倒なようですがそれが一番の近道です。

todo e
