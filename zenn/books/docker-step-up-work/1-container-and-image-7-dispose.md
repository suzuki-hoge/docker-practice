---
title: "📚 ｜ 🐳 ｜ コンテナを終了するとどうなるの？"
---

# 目的
イメージを作る必要性を知る

# コンテナを終了する
今はコンテナが 3 つ起動していると思います

todo
```
$ docker ps

```

Ubuntu コンテナは PHP をインストールした状態、MySQL コンテナはテーブルを作りデータを追加した状態になっています

```
$ docker exec 51deacddc9c2 which php

/usr/bin/php

$
```

```
$ docker exec -it b95ff5bca1a2 mysql -h localhost -u hoge -ppassword event -e 'show tables;'

+-----------------+
| Tables_in_event |
+-----------------+
| foo             |
+-----------------+
```

これらのコンテナを終了します

```
$ docker stop <container>
```

```
$ docker stop 51deacddc9c2
```

```
$ docker stop 758a80125fd4
```

```
$ docker ps

CONTAINER ID    IMAGE     COMMAND    CREATED          STATUS          PORTS    NAMES
```

# コンテナを起動する
もう一度同じ手順で Ubuntu コンテナと MySQL コンテナを起動してみましょう

:::details ワーク: Ubuntu コンテナの起動
```
$ docker run -it ubuntu:20.04

#
```
:::

:::details ワーク: MySQL コンテナのバックグラウンド起動
```
$ docker run                            \
    --platform=linux/amd64              \
    -d                                  \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_USER=hoge                  \
    -e MYSQL_PASSWORD=password          \
    -e MYSQL_DATABASE=event             \
    mysql:5.7
```
:::

# コンテナの状態を確認する
:::details Ubuntu コンテナの PHP のパスを確認
```
$ docker exec 13 which php

$
```

PHP は入っていません
:::

:::details MySQL コンテナのテーブル一覧を確認
```
$ docker exec -it a7 mysql -h localhost -u hoge -ppassword event -e 'show tables;'

$
```

テーブルは何もありません
:::

コンテナは 1 つ 1 つが独立して存在し、コンテナの状態は終了するとどこにも残りません

なので PHP のインストール作業や MySQL データベースへのデータ追加はコンテナを終了すると全て振り出しに戻ります


同じイメージから起動したコンテナ同士だとしても、コンテナは状態を共有しません

またコンテナに行った変更は、コンテナ終了時に全て破棄され残りません

これにより常にクリーンで同じコンテナが起動してくれるので安全で使いやすいのですが、流石に毎回 PHP のインストールをやるのは面倒すぎるので、PHP の入ったイメージを作成することにします
