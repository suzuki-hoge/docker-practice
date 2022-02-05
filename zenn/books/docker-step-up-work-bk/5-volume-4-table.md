---
title: "🖥️ ｜ 🐳 ｜ MySQL コンテナの起動時にテーブルを作成しよう"
---
# 🖥️ コンテナ起動時にテーブルが作られるようにしよう
コンテナを終了しても挿入したデータは消えなくなりましたが、テーブルを作成する手順がまだ自動化されていません

このワークでは行いませんが、ユーザの作成や権限の設定なども今後は必要になるでしょうが、それら全てを手作業するのは面倒です

MySQL イメージには `.sql` を特定のディレクトリに置いてコンテナを起動すると、コンテナ起動時にその `.sql` が実行されるという機能があるので、これを使いましょう

`mysql:5.7` では `/docker-entrypoint-initdb.d/` に `.sql` をおけば実行してもらえます

`create table` 文を `init.sql` という名前で保存しましょう

```
$ tree .
.
|-- docker
|   |-- mysql
|   |   |-- Dockerfile
|   |   |-- init.sql
|   |   `-- my.cnf
|   `-- php
|       `-- Dockerfile
`-- src
    |-- index.php
    |-- mail.php
    `-- select.php
```

```sql:docker/mysql/init.sql
create table event.mail (
    adr  char(255) not null,
    sub  char(255) not null,
    body char(255) not null,
    at   char(255) not null
);
```

Dockerfile の `COPY` 命令でも `docker run` の `-v` オプションでも起動時にファイルを任意の場所に配置できますが、今回は `-v` を使うことにします

動作確認のために一度ボリュームも削除します

`docker volume rm <name>` で削除できます

:::details ワーク: コンテナの停止、コンテナの起動、ファイルの確認
コンテナの停止は `docker stop <CONTAINER>` です

```
$ docker stop <MySQL>
```

ボリュームの削除は `docker volume rm <name>` です

```
$ docker volume rm docker-practice-build-mysql-store
```

todo もし 消せない場合は

コンテナを起動するときに `-v` を 2 つ指定します

todo filename ok

todo 一度削除 ( Initializing database files ??? )

```
$ docker run                                                             \
    --platform=linux/amd64                                               \
    -d                                                                   \
    -e MYSQL_ROOT_PASSWORD=password                                      \
    -e MYSQL_USER=hoge                                                   \
    -e MYSQL_PASSWORD=password                                           \
    -e MYSQL_DATABASE=event                                              \
    -v docker-practice-build-mysql-store:/var/lib/mysql                  \
    -v $(pwd)/docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql \
    docker-practice-build_mysql
```

ファイルの確認は todo でいいでしょう

```
$ docker exec -it e7c1 ls /docker-entrypoint-initdb.d

init.sql
```

todo
```
$ docker logs 1b3a
2022-01-26 22:55:34+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.36-1debian10 started.
2022-01-26 22:55:34+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
2022-01-26 22:55:35+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.36-1debian10 started.
2022-01-26 22:55:35+00:00 [Note] [Entrypoint]: Initializing database files
```
:::

## よりみち: ボリュームと COPY どちらを使うか
まず徹底して意識するべきはコンテナとイメージです

ボリュームは起動したコンテナに割り当てていて、`COPY` はイメージの修正をしています

たとえばボリュームは、同じイメージから起動したコンテナでも割り当てるボリュームを変えたりすることで違うデータを持つことができます

これを理解すれば

「ホストマシンのブラウザで手動テストを行うときはデータが残っていて欲しい」→ ボリュームを使う
「自動テストを行うときはまっさらな状態で起動して欲しい」→ ボリュームを使わない
「データは残って欲しいけど Feature ブランチと Develop ブランチの操作を混ぜたくない」→ ボリュームを使い分ける

todo to e

のような使い方ができます

一方で設定ファイルのような常に同じ内容であって欲しいものはコンテナごとではなくイメージに組み込まれている方が良いでしょう

「Dockerfile を配布します、設定ファイルはこれです、必ず `xxx.cnf` を `xxx/xxx.cnf` にマウントして起動してください」は取り回しが悪すぎます

todo e ( X 別々 | O 同梱 )

逆に `init.sql` のような「テーブル増やしたから `create table` 文を増やそ」みたいに頻繁に編集するものをイメージに組み込んでしまうと、頻繁に Dockerfile のビルドをしなければならなくなります

「先ほど `init.sql` に変更が出たのでみなさん `docker build` をしてね」は面倒です

Docker はコンテナ起動が軽くて頻繁に終了と起動をしているのですから、起動のたびに反映して欲しいですよね

自分が変更を行いたいものが何で、それがいつ反映されて欲しいかを考えるには、イメージとコンテナを意識するのが近道です

todo 焼いたタイミングと反映

