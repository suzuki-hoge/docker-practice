---
title: "🖥️ ｜ 🐳 ｜ MySQL サーバの設定をしよう"
---
# 🖥️ MySQL サーバの設定をしよう
MySQL データベースは `.cnf` ファイルで文字コードやログの設定などが行えます

`mysql:5.7` では `/etc` に `.cnf` ファイルを置くことで反映されるので、次の内容を MySQL コンテナ内に `/etc/my.cnf` として配置します

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

ボリュームではなく Dockerfile の `COPY` を用いて、イメージそのものに配置してしまいます

まずはホストマシンに MySQL の Dockerfile を作る必要があります

次にその Dockerfile と同じディレクトリに `my.cnf` を保存しましょう

```
$ tree .
.
|-- docker
|   |-- mysql
|   |   |-- Dockerfile
|   |   `-- my.cnf
|   `-- php
|       `-- Dockerfile
`-- src
    |-- index.php
    |-- mail.php
    `-- select.php
```

Dockerfile の中身は、特にインストールしたいものがあるわけではないので `FROM` と `COPY` だけです

`FROM --platform=linux/amd64 <IMAGE>` と `COPY <hostmachine-path> <container-path>` の 2 行になります

Dockerfile は `docker build -t <image-name> -f <dockerfile-path> <working-directory>` でビルドします

`<working-directory>` は `COPY` 命令の `<container-path>` などの相対パスに影響します

`<image-name>` は `docker-practice-build_mysql` にしましょう

:::details ワーク: Dockerfile の作成、Dockerfile のビルド
Dockerfile は次の通りです

```txt:Dockerfile
FROM --platform=linux/amd64 mysql:5.7

COPY ./docker/mysql/my.cnf /etc/my.cnf
```

Dockerfile のビルドは次の通りです

ここで指定した `.` が、Dockerfile の `./docker/mysql/my.cnf` という相対パスの起点になります

```
$ docker build                     \
    -t docker-practice-build_mysql \
    -f docker/mysql/Dockerfile     \
    .
```

もし Dockerfile を `COPY my.cnf my.cnf` などのように書いた場合は、`<working-directory>` を `my.cnf` のある位置にずらすか

```
$ docker build                     \
    -t docker-practice-build_mysql \
    -f docker/mysql/Dockerfile     \
    docker/mysql
```

`docker build` の実行ディレクトリをずらす必要があります ( カレントディレクトリに Dockerfile がある場合は `-f` が省略できます )

```
$ cd docker/mysql

$ docker build                     \
    -t docker-practice-build_mysql \
    .
```

どの方法を用いても良いですが、僕は `cd` せずかつ `.` で済ませられるのが楽なのでよく使います

`docker/mysql/` を `docker/db/` みたいにリネームすると Dockerfile の変更が必要になってしまいますが、そうそうあることではないと思って許容しています

それを避けるなら Dockerfile は `COPY my.cnf my.cnf` で書いて `<working-directory>` を調整するのが良いでしょう

複数の Dockerfile を扱うときは Docker Compose を使うときに、知らないと案外ビルド失敗になりやすいので覚えておくと良いでしょう
:::

:::details ワーク: コンテナの停止、コンテナの起動、コンテナ内のファイル確認
コンテナの停止は `docker stop <CONTAINER>` です

```
$ docker stop <PHP>
```

起動するイメージは、当然さきほどビルドした `docker-practice-build_mysql` です

```
$ docker run                                            \
    --platform=linux/amd64                              \
    -d                                                  \
    -e MYSQL_ROOT_PASSWORD=password                     \
    -e MYSQL_USER=hoge                                  \
    -e MYSQL_PASSWORD=password                          \
    -e MYSQL_DATABASE=event                             \
    -v docker-practice-build-mysql-store:/var/lib/mysql \
    docker-practice-build_mysql
```

コンテナ内のファイル確認は `cat` で十分でしょう

```
$ docker exec -it <MySQL> cat /etc/my.cnf
[mysqld]
character_set_server = utf8
collation_server     = utf8_unicode_ci
general_log          = 1
general_log_file     = /var/log/mysql/query.log
log-error            = /var/log/mysql/error.log

[client]
default-character-set = utf8
```
:::

サーバの `/etc/my.cnf` の存在が確認できれば大丈夫です

試しに `my.cnf` の `= utf8` を `= nihongo` にでも変えてみると、コンテナが起動しなくなるので、起動していれば問題ないでしょう

todo 起動しない場合は step log を

