---
title: "Step 7: ボリュームを使おう"
---

## PHP コンテナにホストマシンのディレクトリをマウントしよう
- mail の設定
- mail の設定

## MySQL コンテナにホストマシンのディレクトリをマウントしよう




## コンテナ起動時にテーブルが作られるようにしましょう
テーブルを作るクエリはこうです

```sql
create table event.page (
    pathname char(255) not null,
    at       char(255) not null
);
```

`mysql:5.7` のイメージには、特定のディレクトリに `.sql` を置いとくとコンテナ起動時に実行してくれる機能があります todo url

次のクエリを `Dockerfile` と同じディレクトリに `init.sql` として保存し、コンテナを起動してみましょう

```
$ tree docker
docker
└── db
    ├── Dockerfile
    └── init.sql
```

`$(pwd)/docker/db/init.sql`
`/docker-entrypoint-initdb.d/init.sql`

<details>
<summary>バインドマウントで起動する</summary>
<pre>
<code>$ docker run --platform=linux/amd64 -i -e MYSQL_ROOT_PASSWORD=password -e MYSQL_USER=hoge -e MYSQL_PASSWORD=password -e MYSQL_DATABASE=event -v $(pwd)/docker/db/init.sql:/docker-entrypoint-initdb.d/init.sql -t mysql:5.7</code>
</pre>
</details>

起動したら別のターミナルで接続して `init.sql` があるか確認しましょう ( わからなければ → todo )

```
root@81d6523857a0:/# cat /docker-entrypoint-initdb.d/init.sql
create table event.page (
    pathname char(255) not null,
    at       char(255) not null
);
```

```sql
mysql> show tables;
+-----------------+
| Tables_in_event |
+-----------------+
| page            |
+-----------------+
1 row in set (0.01 sec)

mysql> desc page;
+----------+-----------+------+-----+---------+-------+
| Field    | Type      | Null | Key | Default | Extra |
+----------+-----------+------+-----+---------+-------+
| pathname | char(255) | NO   |     | NULL    |       |
| at       | char(255) | NO   |     | NULL    |       |
+----------+-----------+------+-----+---------+-------+
2 rows in set (0.05 sec)
```

```sql
mysql> insert into page (pathname, at) values ('/index', '2022-01-23 12:34:56');
Query OK, 1 row affected (0.02 sec)

mysql> select * from page;
+----------+---------------------+
| pathname | at                  |
+----------+---------------------+
| /index   | 2022-01-23 12:34:56 |
+----------+---------------------+
1 row in set (0.01 sec)
```

## コンテナのデータが消えないようにしよう
ubuntu イメージに PHP を入れた時のように、コンテナに対して行った作業はコンテナ終了後は残りません

MySQL のデータが残らないと開発時に不便なので改良します

MySQL のデータはコンテナ内の `/var/lib/mysql` にあります

このディレクトリをホストと共有すればいいです

ボリュームマウント

<details>
<summary>ボリュームマウントで起動する</summary>
<pre>
<code>$ docker run --platform=linux/amd64 -i -e MYSQL_ROOT_PASSWORD=password -e MYSQL_USER=hoge -e MYSQL_PASSWORD=password -e MYSQL_DATABASE=event -v docker-practice-build-mysql-store:/var/lib/mysql -v $(pwd)/docker/db/init.sql:/docker-entrypoint-initdb.d/init.sql -t mysql:5.7</code>
</pre>
</details>

```sql
mysql> insert into page (pathname, at) values ('/index', '2022-01-23 12:34:56');
Query OK, 1 row affected (0.02 sec)

mysql> select * from page;
+----------+---------------------+
| pathname | at                  |
+----------+---------------------+
| /index   | 2022-01-23 12:34:56 |
+----------+---------------------+
1 row in set (0.01 sec)
```

コンテナを終了し、また起動してみましょう

今度は `page` にデータが残っているはずです

```sql
mysql> select * from page;
+----------+---------------------+
| pathname | at                  |
+----------+---------------------+
| /index   | 2022-01-23 12:34:56 |
+----------+---------------------+
1 row in set (0.01 sec)
```

作成したボリュームは `docker volume ls` で確認できます

```
$ docker volume ls
DRIVER    VOLUME NAME
local     docker-practice-build-mysql-store
```

todo `-d`

`docker stop`




# step4: コンテナにポートを割り当てよう
## ホストとコンテナを繋ごう
今のままでは PHP のサーバにホストのブラウザから接続できません

コンテナ内から外に出る通信は行えます
`apt-get` などができていましたね

しかしホストからコンテナに接続することは、デフォルトではできません

コンテナにポートを割り当てましょう

## コンテナ同士を繋ごう
デフォルトでは、コンテナ同士は接続できません

PHP コンテナから MySQL コンテナに接続すためには、ネットワークが必要になります


docker network create docker-practice-build-network

docker run --network docker-practice-build-network -p 9000:8000 -v $(pwd)/src/index.php:/tmp/index.php -d -i -t docker-practice-build_app bash
docker run --platform=linux/amd64 -i -e MYSQL_ROOT_PASSWORD=password -e MYSQL_USER=hoge -e MYSQL_PASSWORD=password -e MYSQL_DATABASE=event -v docker-practice-build-mysql-store:/var/lib/mysql -v $(pwd)/docker/db/init.sql:/docker-entrypoint-initdb.d/init.sql -d --network docker-practice-build-network -t mysql:5.7

これで同じネットワークにつながりました

`docker-practice-build-network` の IP は `docker network inspect` でわかります

```
$ docker network ls
NETWORK ID     NAME                             DRIVER    SCOPE
f1512e5256c0   docker-practice-build-network    bridge    local

$ docker network inspect docker-practice-build-network | jq '.[].IPAM.Config[]'
{
  "Subnet": "192.168.128.0/20",
  "Gateway": "192.168.128.1"
}
```

`Gateway` が `192.168.128.1` となっています

コンテナの `inspect` もしてみましょう

```
$ docker ps
CONTAINER ID    IMAGE                        COMMAND                   CREATED           STATUS           PORTS                                        NAMES
3e8a00b594c1    mysql:5.7                    "docker-entrypoint.s…"    10 minutes ago    Up 9 minutes     3306/tcp, 33060/tcp                          angry_chandrasekhar
f971766a19b7    docker-practice-build_app    "bash"                    19 minutes ago    Up 19 minutes    0.0.0.0:9000->8000/tcp, :::9000->8000/tcp    sweet_yonath

$ docker inspect 584f3badf489 | jq '.[].NetworkSettings.Networks."docker-practice-build-network"'
{
  "IPAMConfig": null,
  "Links": null,
  "Aliases": [
    "584f3badf489"
  ],
  "NetworkID": "f1512e5256c0f71d0854d6ed493499656b8f21f53e8c9bbd894a4c16fa0c9811",
  "EndpointID": "812e1d4743e7ee686894ef3c646422695bba72859c843e5288bf6ec776cacece",
  "Gateway": "192.168.128.1",
  "IPAddress": "192.168.128.2",
  "IPPrefixLen": 20,
  "IPv6Gateway": "",
  "GlobalIPv6Address": "",
  "GlobalIPv6PrefixLen": 0,
  "MacAddress": "02:42:c0:a8:80:02",
  "DriverOpts": null
}


// todo
```

PHP コンテナ ( `f971766a19b7` ) が `192.168.128.2` で MySQL コンテナ ( `3e8a00b594c1` ) が `192.168.128.3` のようですね

`index.php` を編集して動作確認をしてみましょう

vi

## IP ではなく名前でアクセスする
$ docker run --platform=linux/amd64 -i -e MYSQL_ROOT_PASSWORD=password -e MYSQL_USER=hoge -e MYSQL_PASSWORD=password -e MYSQL_DATABASE=event -v docker-practice-build-mysql-store:/var/lib/mysql -v $(pwd)/docker/db/init.sql:/docker-entrypoint-initdb.d/init.sql -d --network docker-practice-build-network --network-alias db -t mysql:5.7

```
$ docker inspect 96d231d5b4b2 | jq '.[].NetworkSettings.Networks."docker-practice-build-network"'
{
  "IPAMConfig": null,
  "Links": null,
  "Aliases": [
    "db",
    "96d231d5b4b2"
  ],
  "NetworkID": "f1512e5256c0f71d0854d6ed493499656b8f21f53e8c9bbd894a4c16fa0c9811",
  "EndpointID": "e4aa159f4f0e4af01909aa6005fa5f76d5ba4b22170e58e739e315cd7f02ee86",
  "Gateway": "192.168.128.1",
  "IPAddress": "192.168.128.2",
  "IPPrefixLen": 20,
  "IPv6Gateway": "",
  "GlobalIPv6Address": "",
  "GlobalIPv6PrefixLen": 0,
  "MacAddress": "02:42:c0:a8:80:02",
  "DriverOpts": null
}
```

`Aliases` に `db` が増えています

これでこのコンテナ ( `192.168.128.2` ) に `db` という名前でアクセスできます

`index.php` を修正して確認してみましょう

