---
title: "３部: ボリューム"
---

３部の残りは新しいことを少しだけ学びます。

このページは、コンテナのデータをコンテナ削除とともに消失させないためにボリュームについて学びます。

# 全体構成とハイライト
![image](/images/structure/structure.076.jpeg)

## やることの確認
＼ | やること                       | できるようになること                                                                                
:-- | :--                            | :--                                                                                                 
App|イメージをビルド               | ✅　PHP が準備できる<br>✅　メール送信が準備できる
App|コンテナを起動しビルド結果を確認<br>Web サーバを起動                 | ✅　Dockerfile の妥当性が確認できる<br>✅　Web サーバが起動できる                  
App|ソースコードをバインドマウント | ホストマシンの `.php` 編集が即反映される                                                    
App|コンテナのポートを公開         | ブラウザからアクセスできる                                            
App|コンテナをネットワークに接続<br>データベースサーバの接続設定<br>メールサーバの接続設定   | DB コンテナに接続できる<br>Mail コンテナに接続できる
App|Docker Compose 化              | これらを１コマンドで再現できる
DB| イメージをビルド                                                         | ✅　文字コードとログの設定ができる
DB| 環境変数を指定してコンテナを起動                                         | ✅　Dockerfile の妥当性が確認できる<br>✅　MySQL サーバが起動できる<br>✅　ユーザとデータベースを作成できる
DB| 👉　データ置場にボリュームをマウント                                 | テーブルがコンテナ削除で消えなくなる                                      
DB| 初期化クエリをバインドマウント                                       | コンテナ起動時にテーブルが作成される                                            
DB| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
DB| Docker Compose 化                                                        | これらを１コマンドで再現できる
Mail| イメージを選定                                                           | ✅　SMTP サーバが起動できる<br>✅　Web サーバが起動できる                                      
Mail| コンテナを起動                                                           | ✅　Web サーバが起動できる<br>✅　SMTP サーバが起動できる                           
Mail| コンテナのポートを公開                                                   | ブラウザからアクセスできる                            
Mail| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
Mail| Docker Compose 化                                                        | これらを１コマンドで再現できる
ほか| 👉　ボリュームを作成                                                        | マウントする準備ができる
ほか| ネットワークを作成                                                        | コンテナを接続する準備ができる

# このページで初登場する構築のコマンド

## ボリュームを作成する - volume create
```:コマンド
$ docker volume create [option]
```

オプション | 意味 | 用途  
:-- | :-- | :--
`--name`   | ボリューム名を指定 | ID ではなく名前で扱えるようにする

## コンテナを起動する - container run
オプション | 意味 | 用途  
:-- | :-- | :--
`-v, --volume`   | マウントする | 短く指定する
`--mount`   | マウントする   | 丁寧に指定する

# コンテナのファイルを維持するには
【 ２部: コンテナの状態保持 】で確認した通り、**コンテナ内で作成されたファイルはコンテナの削除とともに全て廃棄されます**。

それでは **ログやデータを次起動するコンテナに引き継げない** ので開発に不自由してしまうため、Docker にはホストマシンとコンテナでファイルを共有する方法がいくつか用意されています。

このページでは１つの方法であるボリュームを使い、DB コンテナのデータベースのデータが消失しないようにします。

# ボリュームとは
ボリュームはコンテナ内のファイルをホストマシン上で **Docker が管理してくれる仕組み** です。

**ホストマシン側のどこに保存されているかは関心がなくとにかくデータを永続化したい** という場合に有用で、たとえばデータベースのデータの永続化に活用できます。

![image](/images/structure/structure.077.jpeg)

コンテナの特定のディレクトリをボリュームとしてホストマシン側で管理すれば、コンテナが削除されてもデータが消失しなくなります。

# 構築
## ボリュームの作成
ボリュームを使うには、まずはボリュームの作成を行います。

```:コマンド
$ docker volume create [option]
```

`[option]` には `--name` オプションを指定して `docker-practice-db-volume` という名前を付けます。

```:Host Machine
$ docker volume create \
    --name docker-practice-db-volume
```

作成はこれだけです。

これでコンテナにボリュームをマウントする準備ができました。

### 作成できたことを確認する
ボリューム一覧を確認するには、 `volume ls` を使います。

```:Host Machine
$ docker volume ls

DRIVER    VOLUME NAME
local     docker-practice-db-volume
```

`docker-practice-db-volume` が確認できれば大丈夫です。

## DB コンテナにボリュームをマウントする
作成したボリュームは、コンテナ起動時にマウントして使います。

`docker container run` には　`--volume` と `--mount` というほぼ同じことができるオプションがあるので、ここでは両方を簡単に解説します。

結果は同じになるため実行はどちらか一方で構いませんが、両方試してみたい方はコンテナを一度終了すれば大丈夫です。
ボリュームを削除したりする必要はありません。

### --volume オプションによるマウント
`--volume` は **設定を定められた順番で `:` 区切りで列挙** して指定します。

`:` で区切られた設定のうち１つめはボリューム名であり、これは先ほど作成した `docker-practice-db-volume` を指定します。
２つめはマウント先であり、これは MySQL データベースのテーブル情報が実際に保存されている `/var/lib/mysql` を指定します。
３つめは任意のオプションであり、「読み取り専用」などのフラグがいくつか用意されていますがこの本では特に指定しません。

```:Host Machine
$ docker container run                                \
    --name db                                         \
    --rm                                              \
    --detach                                          \
    --platform linux/amd64                            \
    --env MYSQL_ROOT_PASSWORD=rootpassword            \
    --env MYSQL_USER=hoge                             \
    --env MYSQL_PASSWORD=password                     \
    --env MYSQL_DATABASE=event                        \
    --volume docker-practice-db-volume:/var/lib/mysql \
    docker-practice:db
```

### --mount オプションによるマウント
`--mount` は **`key=val` 形式で設定を列挙** して指定します。

主な `key` は `type` と `source` と `destination` で、他に `readonly` のような任意オプションの `key` もあります。
また、`source` は `src` など、`destination` は `dst` や `target` などの略記も存在します。

`type` は `volume` を指定します。
`source` はボリューム名の `docker-practice-db-volume` を指定します。
`destination` は `/var/lib/mysql` を指定します。

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

### ボリュームがマウントできたことを確認する
コンテナを起動したら、テーブルを作りデータをインサートします。

```:Host Machine
$ docker container exec                         \
    --interactive                               \
    --tty                                       \
    db                                          \
    mysql -h localhost -u hoge -ppassword event

mysql> create table event.debug ( id char(1) );
mysql> insert into event.debug ( id ) values ( 1 );
mysql> select * from event.debug;

+------+
| id   |
+------+
| 1    |
+------+    
```

データを作ったらコンテナを終了し、またコンテナを起動してください。

コンテナが起動できたらテーブルやデータが残っていることを確認できるはずです。

```:Host Machine
$ docker container exec                         \
    --interactive                               \
    --tty                                       \
    db                                          \
    mysql -h localhost -u hoge -ppassword event

mysql> select * from event.debug;

+------+
| id   |
+------+
| 1    |
+------+    
```

# --volume オプションと --mount オプションの使い分け
`--volume` オプションの方が短くかけますが、【 ３部: バインドマウント 】も混じるとかなりわかりづらい記述になります。
`:` 区切りのルールなどを知らないと正しく読むこともままならないので、マウントするときは読みやすい **`--mount` オプションを使う方が良い** でしょう。

また、`--mount` オプションの方が Docker Compose とお互いに読み換えやすいという利点もあります。

# ボリュームの実体
作成したボリュームは `volume inspect` で詳細を確認することができます。

```:Host Machine
$ docker volume inspect docker-practice-db-volume
[
    {
        "CreatedAt": "2022-02-06T23:07:52Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/docker-practice-db-volume/_data",
        "Name": "docker-practice-db-volume",
        "Options": {},
        "Scope": "local"
    }
]
```

ここの `Mountpoint` がデータのある場所の実体なのですが、これは Docker Desktop の Linux 上のパスのことなので、**Docker Desktop を使っている場合はホストマシンで探しても見つかりません**。

**ボリュームは Docker が管理している** ので単純に読み書きすることはできません。
これは裏を返せば **コンテナ内でマウントしたボリュームのディレクトリを誤って消してしまってもホストマシンには影響しない** というメリットになっています。

# まとめ
このページの手順書と成果物は次のブランチで公開されています。

https://github.com/suzuki-hoge/docker-practice/tree/tmp

混乱してしまったときに参考にしてください。

## ポイント
- ボリュームは **とにかくただデータを残したい** という用途に向いている
- ボリュームをマウントをするには `--volume` オプションか `--mount` オプションで可能
- どちらでも結果はほぼ同じだが、**読みやすい `--mount` オプションを使うと良い**
- ボリュームは **Docker が管理** していて、**コンテナ内での変更がホストマシンに影響しない**

## できるようになったことの確認
＼ | やること                       | できるようになること                                                                                
:-- | :--                            | :--                                                                                                 
App|イメージをビルド               | ✅　PHP が準備できる<br>✅　メール送信が準備できる
App|コンテナを起動しビルド結果を確認<br>Web サーバを起動                 | ✅　Dockerfile の妥当性が確認できる<br>✅　Web サーバが起動できる                  
App|ソースコードをバインドマウント | ホストマシンの `.php` 編集が即反映される                                                    
App|コンテナのポートを公開         | ブラウザからアクセスできる                                            
App|コンテナをネットワークに接続<br>データベースサーバの接続設定<br>メールサーバの接続設定   | DB コンテナに接続できる<br>Mail コンテナに接続できる
App|Docker Compose 化              | これらを１コマンドで再現できる
DB| イメージをビルド                                                         | ✅　文字コードとログの設定ができる
DB| 環境変数を指定してコンテナを起動                                         | ✅　Dockerfile の妥当性が確認できる<br>✅　MySQL サーバが起動できる<br>✅　ユーザとデータベースを作成できる
DB| 👉　データ置場にボリュームをマウント                                 | ✅　テーブルがコンテナ削除で消えなくなる                                      
DB| 初期化クエリをバインドマウント                                       | コンテナ起動時にテーブルが作成される                                            
DB| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
DB| Docker Compose 化                                                        | これらを１コマンドで再現できる
Mail| イメージを選定                                                           | ✅　SMTP サーバが起動できる<br>✅　Web サーバが起動できる                                      
Mail| コンテナを起動                                                           | ✅　Web サーバが起動できる<br>✅　SMTP サーバが起動できる                           
Mail| コンテナのポートを公開                                                   | ブラウザからアクセスできる                            
Mail| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
Mail| Docker Compose 化                                                        | これらを１コマンドで再現できる
ほか| 👉　ボリュームを作成                                                        | ✅　マウントする準備ができる
ほか| ネットワークを作成                                                        | コンテナを接続する準備ができる

![image](/images/structure/structure.076.jpeg)
