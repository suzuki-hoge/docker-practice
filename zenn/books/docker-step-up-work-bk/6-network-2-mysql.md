---
title: "🖥️ ｜ 🐳 ｜ PHP コンテナから MySQL データベースを使おう"
---
## 📚 PHP コンテナをネットワークに割り当てる todo
コンテナ同士を接続したい場合は、コンテナを `todo` ではない同じネットワークにぶら下げる必要があります ( todo )

```
$ docker run                                \
    -it                                     \
    -d                                      \
    -p 18000:8000                           \
    -v $(pwd)/src:/tmp/src                  \
    --network docker-practice-build-network \
    docker-practice-build_app
```

`docker inspect` でコンテナの IP などを調べることができます

```
$ docker inspect <PHP> | jq '.[].NetworkSettings.Networks."docker-practice-build-network"'
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
```

`Gateway` が `docker-practice-build-network` と同じ `192.168.128.1` で、`IPAddress` が `192.168.128.2` になっていることを確認できます

## 🖥️ MySQL コンテナをネットワークに割り当てる todo
MySQL コンテナも同じように起動してみましょう

PHP コンテナと MySQL コンテナを接続したいので、当然ネットワーク名は同じものを指定します

:::details 練習: MySQL コンテナを起動、MySQL コンテナの IPAddress を確認
`docker run` の `--network` で同じネットワークを指定します

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
    --network docker-practice-build-network                              \
    docker-practice-build_mysql
```

`docker inspect <CONTAINER>` で `IPAddress` を調べます

```
$ docker inspect <MySQL> | jq '.[].NetworkSettings.Networks."docker-practice-build-network"'
{
  "IPAMConfig": null,
  "Links": null,
  "Aliases": [
    "f38168dfc46e"
  ],
  "NetworkID": "9adb1d1b92c359dea25607ba878f1de0e6801ecbd9c3d8986f90c1495ea861a8",
  "EndpointID": "9f4ba83f4b7c7d24e85f68d767379f8c042e71b572ffd6688d389e437034be27",
  "Gateway": "192.168.48.1",
  "IPAddress": "192.168.48.3",
  "IPPrefixLen": 20,
  "IPv6Gateway": "",
  "GlobalIPv6Address": "",
  "GlobalIPv6PrefixLen": 0,
  "MacAddress": "02:42:c0:a8:30:03",
  "DriverOpts": null
}
```

`Gateway` は同じく `192.168.128.1` で、`IPAddress` は `192.168.128.3` になっていることを確認できます
:::

## 🖥️ PHP コンテナから MySQL データベースに接続する
step todo で `select.php` という PHP ファイルを PHP コンテナにマウント todo しています

そのファイルにはいくつかの `todo` があります

```
$ grep "$\w\+ = '" src/select.php.todo

$host = 'todo';
$port = 'todo';
$database = 'event';
$username = 'todo';
$password = 'todo';
```

それぞれ次の通り設定します

- `$host` は調べた `IPAddress`
- `$port` は MySQL のデフォルトポート
- `$username` は自分が設定した値
- `$password` は自分が設定した値

設定したらホストマシンのブラウザで `/select.php` にアクセスして確認してみましょう

ホストマシンのブラウザから PHP コンテナにアクセスするポートと PHP コンテナが MySQL コンテナにアクセスするポートを間違えないようにしましょう

:::details ワーク: todo 解消、ブラウザで確認
todo 解消を行うのはホストマシンでもコンテナ内でも構いません

`$host` は調べた `192.168.128.2` に、`$port` は `3306` に、`$username` と `$password` は `docker run` の `-e` で自分で定めたものに設定します

```
$ grep "$\w\+ = '" src/select.php
$host = '192.168.128.2';
$port = '3306';
$database = 'event';
$username = 'hoge';
$password = 'password';
```
:::



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





# PHP コンテナから MySQL コンテナに接続できるようにしよう

# PHP コンテナから Mail コンテナに接続できるようにしよう


## bridge の代わりに自作のがついている、Alias
