---
title: "３部: ボリューム"
---

３部の残りは新しいことを少しだけ学びます。

このページは、コンテナのデータをコンテナ削除とともに消失させないために、ボリュームについて学びます。

![image](/images/structure/structure.076.jpeg)

# このページでやること
- ボリュームの作成
- 起動コマンドをボリュームを使うように修正

# このページで初登場するコマンドとオプション

## ボリュームを作成する
```:コマンド
$ docker volume create [option]
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`--name`   | ボリューム名を指定 | ID ではなく名前で扱えるようにする

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
`-v, --volume`   | マウントする | 短く指定する
`--mount`   | マウントする   | 丁寧に指定する

# コンテナのファイルを維持するには
[２部]() で確認した通り、**コンテナ内で作成されたファイルはコンテナの削除とともに全て廃棄されます**。
またホストマシンのファイルシステムとコンテナのファイルシステムは **隔離されています**。

このままでは、コンテナを終了すると **ログやデータを次起動するコンテナに引き継げません**。

その課題を解決するために、コンテナ内のファイルをホストマシンと共有する方法が Docker には２つあります
このページでは１つめの方法であるボリュームを使い、DB コンテナのデータベースのデータが消失しないようにします。

# ボリュームとは
ボリュームはコンテナ内のファイルをホストマシン上で **Docker が管理してくれる仕組み** です。

**ホストマシン側のどこに保存されているかは関心がなくとにかくデータを永続化したい** という場合に有用で、たとえば DB のデータの永続化やコンテナ間のファイル連携などに活用できます。

![image](/images/structure/structure.041.jpeg)

# ボリュームの作成
ボリュームを使うには、まずはボリュームの作成を行います。

```:コマンド
$ docker volume create [option]
```

`[option]` は未指定でも良いですが、扱いやすいように `--name` で `docker-practice-db-volume` という名前を付けます。
それと動作確認用に `sample-volume` も別に作成します。

以上を踏まえて、次のようにボリュームを２つ作成します。

```:Host Machine
$ docker volume create \
    --name docker-practice-db-volume
    
docker-practice-db-volume

$ docker volume create \
    --name sample-volume
    
sample-volume

$
```

作成はこれだけです。
ボリューム一覧を確認してみたい方は `docker volume ls` を実行してみてください。

# ボリュームのマウント
作成したボリュームは、コンテナ起動時にマウントしておきます。

`docker container run` には　`--volume` と `--mount` というほぼ同じことができるオプションがあるので、ここでは両方を簡単に解説します。

## --volume によるマウント
`--volume` は **設定を定められた順番で `:` 区切りで列挙** して指定します。

`:` で区切られた設定のうち１つめはボリューム名、２つめはマウント先、３つめは任意のオプションです。
オプションには「読み取り専用」などのフラグがいくつか用意されていますが、この本ではオプションは特に指定しません。

先ほど作成した `sample-volume` をマウントした適当な Ubuntu コンテナを起動してみます。

```:Host Machine
$ docker container run              \
  --name ubuntu1                    \
  --rm                              \
  --interactive                     \
  --tty                             \
  --volume sample-volume:/db-volume \
  ubuntu:20.04                      \
  bash

# cd /db-volume
```

`/db-volume` というディレクトリがコンテナ内に存在します。

ディレクトリ内にファイルを書き残し、コンテナを終了します。

```:Container
# echo 'Hello Volume.' > /db-volume/hello.txt

# exit
```

別のコンテナに同じボリュームをマウントすると、先程のファイルが確認できます。

```:Host Machine
$ docker container run              \
  --name ubuntu2                    \
  --rm                              \
  --interactive                     \
  --tty                             \
  --volume sample-volume:/db-volume \
  ubuntu:20.04                      \
  cat /db-volume/hello.txt

Hello Volume.

$  
```

## --mount によるマウント
`--mount` は **`key=val` 形式で設定を列挙** して指定します。

主な `key` は `type` と `source` と `destination` で、他に `readonly` のような任意オプションの `key` もあります。
また、`source` は `src` など、`destination` は `dst` や `target` などの略記も存在します。

今度は DB コンテナに `docker-practice-db-volume` をマウントして、MySQL のデータが消失しないようにします。
MySQL のデータは `/var/lib/mysql` にあるので、マウント先はそこにします。

```:Host Machine
$ docker container run                                                   \
    --name db                                                            \
    --rm                                                                 \
    --detach                                                             \
    --platform linux/amd64                                               \
    --env MYSQL_ROOT_PASSWORD=rootpassword                               \
    --env MYSQL_USER=hoge                                                \
    --env MYSQL_PASSWORD=password                                        \
    --env MYSQL_DATABASE=event                                           \
    --mount type=volume,src=docker-practice-db-volume,dst=/var/lib/mysql \
    docker-practice:db
```

起動できたらテーブルを作りレコードを作ります。
[３部]() で解説した `docker container exec` と `mysql -e` の組み合わせでさっと済ませます。

```:Host Machine
$ docker container exec                                                                       \
    --tty                                                                                     \
    db                                                                                        \
    mysql -h 127.0.0.1 -u hoge -ppassword event -e 'create table event.debug ( id char(1) );'

$ docker container exec                                                                           \
    --tty                                                                                         \
    db                                                                                            \
    mysql -h 127.0.0.1 -u hoge -ppassword event -e 'insert into event.debug ( id ) values ( 1 );'

$ docker container exec                                                         \
    --tty                                                                       \
    db                                                                          \
    mysql -h 127.0.0.1 -u hoge -ppassword event -e 'select * from event.debug;'

+------+
| id   |
+------+
| 1    |
+------+    
```

データを作ったらコンテナを終了し、また起動します。

今度起動するときは **ユーザやテーブルは残っているはず** なので初期化のための環境変数はいりません。

```:Host Machine
$ docker container run                                                   \
    --name db                                                            \
    --rm                                                                 \
    --detach                                                             \
    --platform linux/amd64                                               \
    --mount type=volume,src=docker-practice-db-volume,dst=/var/lib/mysql \
    docker-practice:db

$ docker container exec                                                         \
    --tty                                                                       \
    db                                                                          \
    mysql -h 127.0.0.1 -u hoge -ppassword event -e 'select * from event.debug;'

+------+
| id   |
+------+
| 1    |
+------+    
```

正しく維持できています。

## オプションの使い分け
`--volume` の方が短くかけますが、数文字を削るメリットなど対してありません。
マウントするときは読みやすい **`--mount` を使う方が良い** でしょう。

[３部]() で学ぶバインド・オプションも加えると、`--volume` のわかりづらさは結構なものになります。
また `--mount` の方が Docker Compose に書き換えやすいという利点もあります。

# ボリュームの実体
作成したボリュームは `docker volume inspect` で詳細を把握することができます。

```:Host Machine
$ docker volume inspect sample-volume
[
    {
        "CreatedAt": "2022-02-06T23:07:52Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/sample-volume/_data",
        "Name": "sample-volume",
        "Options": {},
        "Scope": "local"
    }
]
```

ここの `Mountpoint` がデータのある場所の実体なのですが、これは Docker Engine の Linux 上のパスのことなので、**Docker Desktop を使っている場合はホストマシンで探しても見つかりません**。

**ボリュームは Docker が管理している** ので単純に読み書きすることはできません。
これは裏を返せば **ボリュームをどんなにひどい壊し方をしてもホストマシンに影響しない** というメリットになっています。

# まとめ

todo github commit

## やったこと
- ボリュームの作成
- DB コンテナ
  - コンテナ起動時にボリュームをマウントする

## ポイント
- ボリュームは **Docker が管理** している
- 実体にはアクセスできないが、**とにかくただデータを残したい** という用途には向いている
- マウントをするには `--volume` か `--mount` を使うが、**読みやすい `--mount` を使うと良い**

## できるようになったこと
- DB コンテナのデータが消失しない

![image](/images/structure/structure.076.jpeg)

## やりきれなかったこと
- 
