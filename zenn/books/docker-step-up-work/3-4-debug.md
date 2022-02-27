---
title: "３部: デバッグ"
---

少し箸休めとして、デバッグの仕方を学びます。

![image](/images/structure/structure.071.jpeg)

# このページで初登場するコマンドとオプション
## コンテナのログを見る
```:新コマンド
$ docker container logs [option] <container>
```

```:旧コマンド
$ docker logs [option] <container>
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-f`<br>`--follow`   | 出力し続ける | 操作をしながらログを見る
`--tail`   | 末尾からの表示行数を指定 | 意味の通り

# 接続
DB コンテナを起動してから、次の図を見てください。

```:Host Machine
$ docker container run                     \
    --name db                              \
    --rm                                   \
    --detach                               \
    --platform linux/amd64                 \
    --env MYSQL_ROOT_PASSWORD=rootpassword \
    --env MYSQL_USER=hoge                  \
    --env MYSQL_PASSWORD=password          \
    --env MYSQL_DATABASE=event             \
    docker-practice:db

ca2c5fbd647518512ce56774e78574608ee9595a1725e7aa354a791e176c6f1d

$
```

![image](/images/structure/structure.072.jpeg)

３つの線について簡単に整理し、どれを使うべきか考えます。

## 1. `bash` 経由
手順としてはこうなります。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    db                   \
    bash
```

```:Container
# mysql -h 127.0.0.1 -u hoge -ppassword event
```

```:Container
mysql> create table event.debug ( id char(1) );

Query OK, 0 rows affected (0.06 sec)

mysql> insert into event.debug ( id ) values ( 1 );

Query OK, 1 row affected (0.06 sec)
```

## 2. `mysql` 直
手順としてはこうなります。

```:Host Machine
$ docker container exec                         \
    --interactive                               \
    --tty                                       \
    db                                          \
    mysql -h 127.0.0.1 -u hoge -ppassword event
```

```:Container
mysql> select * from debug;

+------+
| id   |
+------+
| 1    |
+------+
1 row in set (0.01 sec)
```

## 3. ホストから直
これはまだ説明していない `docker container run` のオプションと、ホストマシンへの `mysql` インストールが必要になるので、実行例だけ示します。

```:Host Machine
$ mysql -h 127.0.0.1 -u hoge -ppassword event

mysql> select * from debug;

+------+
| id   |
+------+
| 1    |
+------+
1 row in set (0.01 sec)
```

## どれを使うか
３つの違いがわかったでしょうか。

![image](/images/structure/structure.072.jpeg)

簡単に整理すると、次のような違いがあります。

\   | メリット                                          | デメリット                                                                   
:-- | :--                                               | :--                                                                          
①   | `bash` を経由するので他の作業もしやすい           | 接続操作が多い<br>接続のコマンド履歴が各所に散る                             
②   | すぐ `mysql` に繋がる                             | 接続のコマンド履歴がホストマシンに残る                                       
③   | 最短で MySQL に繋がる<br>GUI からでもなんでもいい | デバッグのためのポート解放が必要<br>ホストマシンの `mysql` セットアップが必要

③ は要するに **接続先をコンテナだと思っていない** ので、手間さえかければいままで通り GUI を使ったりできるため一番強力です。

① も「ついでにログも見ておこう」などできて便利ですが、**接続が多段なためちょっとしたスクリプトなどとは相性が悪い** です。

僕個人は ② を使うことが多いですね、**接続コマンドの実行履歴がホストマシンに残る** というのは結構メリットだと思います。

② と `mysql` の `-e` という文字列を実行させるオプションを組み合わせると、結構簡単に簡易なスクリプトが作れたりします。

```:Host Machine
$ docker container exec                                                   \
    --tty                                                                 \
    db                                                                    \
    mysql -h 127.0.0.1 -u hoge -ppassword event -e 'select * from debug;'

+------+
| id   |
+------+
| 1    |
+------+    
```

上のコマンドは **対話操作を挟まず**、**ホストマシンには何もセットアップせず**、**ホストマシンに残るコマンド** です。

自分が **どこに向かって何について命令しているか** 考えると、応用が効くようになります。

# ログ
## バックグラウンド実行したコンテナの出力を見る
[３部]() で起動した App コンテナのサーバを、動作していることが大体確認できたのでバックグラウンドにしてしまおうと思います。

```:Host Machine
$ docker container run  \
    --name app          \
    --rm                \
    --detach            \
    docker-practice:app \
    php -S 0.0.0.0:8000

9ab1d67201346c74c2724f3f030073eb5df50b108906852cf3f66184924ed306

$
```

このようなコンテナの本来されるはずだった出力を確認するには `docker container logs` を使います。

```:Host Machine
$ docker container logs \
    app

[Sun Feb 27 03:33:40 2022] PHP 8.0.16 Development Server (http://0.0.0.0:8000) started    

$
```

もしくは Docker Desktop の Dashboard からも確認できます。

![image](/images/docker-desktop-log-1.png)

![image](/images/docker-desktop-log-2.png)

## 起動したサービスのログを見る
`docker container logs` で確認できる出力は **Process ID 1 の出力** です。

MySQL のクエリログやエラーログなどの **サービスが出力するログ** を見る場合は、ただ `bash` で接続して普通のサーバと同じように見ることになります。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    db                   \
    bash
```

ログの場所は **Docker とは関係ないので MySQL について調べればわかります**。
今回は自分で `my.cnf` で設定しています。

```:Container
# tail -n 15 /var/log/mysql/query.log

2022-02-27T04:06:00.900836Z	    6 Query	create table event.debug ( id char(1) )
2022-02-27T04:06:03.555324Z	    6 Query	insert into event.debug ( id ) values ( 1 )
2022-02-27T04:06:05.060029Z	    6 Quit
2022-02-27T04:06:07.748508Z	    7 Connect	hoge@localhost on event using Socket
2022-02-27T04:06:07.749206Z	    7 Query	select @@version_comment limit 1
2022-02-27T04:06:07.750720Z	    7 Query	select * from debug
2022-02-27T04:06:07.754594Z	    7 Quit
2022-02-27T04:06:41.077370Z	    8 Connect	hoge@localhost on event using Socket
2022-02-27T04:06:41.078040Z	    8 Query	select @@version_comment limit 1
2022-02-27T04:06:41.079580Z	    8 Query	select * from debug
2022-02-27T04:06:41.080949Z	    8 Quit
2022-02-27T04:10:05.791013Z	    9 Connect	hoge@localhost on event using Socket
2022-02-27T04:10:05.791697Z	    9 Query	select @@version_comment limit 1
2022-02-27T04:10:05.793391Z	    9 Query	select * from debug
2022-02-27T04:10:05.796196Z	    9 Quit
```

**何のログを見るべきか** 考えて **どうやってそれを見るか** 考えましょう。

![image](/images/structure/structure.073.jpeg)

# まとめ
## ポイント
- コンテナへ命令する方法はいろいろな形があり、それぞれメリデメが違う
- バックグラウンドのコンテナのログも見られる
  - `docker container logs`
  - Docker Desktop の Dashboard
- サービスのログもしっかり見る
