# 【 ３部: バインドマウント 】

## ファイルツリー

```
$ tree .

.
|-- docker
|   |-- app
|   |   |-- Dockerfile
|   |   |-- mail.ini
|   |   `-- mailrc
|   `-- db
|       |-- Dockerfile
|       |-- init.sql          ← New
|       `-- my.cnf
`-- src
    |-- form.php
    |-- history.php
    |-- index.php
    `-- mail.php
```

## App コンテナにバインドマウント

```
$ docker container run                        \
    --name app                                \
    --rm                                      \
    --detach                                  \
    --interactive                             \
    --tty                                     \
    --mount type=bind,src=$(pwd)/src,dst=/src \
    docker-practice:app                       \
    php -S 0.0.0.0:8000 -t /src
```

## ボリュームの削除と再作成

```
$ docker volume rm \
    docker-practice-db-volume
    
$ docker volume create \
    --name docker-practice-db-volume
```

## DB コンテナにバインドマウント

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
    docker-practice:db
```
