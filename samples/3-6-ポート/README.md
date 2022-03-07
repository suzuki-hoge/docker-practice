# 【 ３部: ポート 】

## App コンテナのポートを公開

```
$ docker container run                        \
    --name app                                \
    --rm                                      \
    --detach                                  \
    --interactive                             \
    --tty                                     \
    --mount type=bind,src=$(pwd)/src,dst=/src \
    --publish 18000:8000                      \
    docker-practice:app                       \
    php -S 0.0.0.0:8000 -t /src
```

## Mail コンテナのポートを公開

```
$ docker container run     \
    --name mail            \
    --rm                   \
    --detach               \
    --platform linux/amd64 \
    --publish 18025:8025   \
    mailhog/mailhog:v1.0.1
```
