# 【 ３部: ネットワーク 】

## ネットワークの作成

```
$ docker network create \
    docker-practice-network
```

## App コンテナをネットワークに接続

```
$ docker container run                        \
    --name app                                \
    --rm                                      \
    --detach                                  \
    --mount type=bind,src=$(pwd)/src,dst=/src \
    --publish 18000:8000                      \
    --network docker-practice-network         \
    docker-practice:app                       \
    php -S 0.0.0.0:8000 -t /src
```

## DB コンテナをネットワークに接続してエイリアスを設定

```
$ docker container run                                                                       \
    --name db                                                                                \
    --rm                                                                                     \
    --detach                                                                                 \
    --platform linux/amd64                                                                   \
    --env MYSQL_ROOT_PASSWORD=rootpassword                                                   \
    --env MYSQL_USER=hoge                                                                    \
    --env MYSQL_PASSWORD=password                                                            \
    --env MYSQL_DATABASE=event                                                               \
    --mount type=volume,src=docker-practice-db-volume,dst=/var/lib/mysql                     \
    --mount type=bind,src=$(pwd)/docker/db/init.sql,dst=/docker-entrypoint-initdb.d/init.sql \
    --network docker-practice-network                                                        \
    --network-alias db                                                                       \
    docker-practice:db
```

## Mail コンテナをネットワークに接続してエイリアスを設定

```
$ docker container run                \
    --name mail                       \
    --rm                              \
    --detach                          \
    --platform linux/amd64            \
    --publish 18025:8025              \
    --network docker-practice-network \
    --network-alias mail              \
    mailhog/mailhog:v1.0.1
```

## App コンテナから DB コンテナへの接続設定

変更ファイル

- [src/history.php](src/history.php#L7-L10)
- [src/mail.php](src/mail.php#L41-L47)

```php
$host = 'db';
$port = '3306';
$database = 'event';
$dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

$username = 'hoge';
$password = 'password';
```

反映コマンド

なし

## App コンテナから Mail コンテナへの接続設定

変更ファイル

- [docker/app/mailrc](docker/app/mailrc#L2-L3)

```txt
account default
host mail
port 1025
from "service@d-prac.test"
```

反映コマンド

```
$ docker image build             \
    --tag docker-practice:app    \
    --file docker/app/Dockerfile \
    .
```