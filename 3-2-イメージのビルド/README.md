# 【 ３部: イメージのビルド 】

## App イメージのビルド

```
$ docker image build             \
    --tag docker-practice:app    \
    --file docker/app/Dockerfile \
    .
```

## DB イメージのビルド

```
$ docker image build            \
    --tag docker-practice:db    \
    --file docker/db/Dockerfile \
    .
```

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
|       |-- init.sql
|       `-- my.cnf
`-- src
    |-- form.php
    |-- history.php
    |-- index.php
    `-- mail.php
```
