# 【 ３部: コンテナの起動 】

## App コンテナの起動

```
$ docker container run  \
    --name app          \
    --rm                \
    docker-practice:app \
    php -S 0.0.0.0:8000
```

## DB コンテナの起動

```
$ docker container run                     \
    --name db                              \
    --rm                                   \
    --platform linux/amd64                 \
    --env MYSQL_ROOT_PASSWORD=rootpassword \
    --env MYSQL_USER=hoge                  \
    --env MYSQL_PASSWORD=password          \
    --env MYSQL_DATABASE=event             \
    docker-practice:db`
```

## Mail コンテナの起動

```
$ docker container run     \
    --name mail            \
    --rm                   \
    --platform linux/amd64 \
    mailhog/mailhog:v1.0.1
```
