# 【 ３部: Docker Compose 】

## Docker Compose でサービスを起動

```
$ docker compose up \
    --detach        \
    --build
```

## Docker Compose のサービスを全停止

```
$ docker compose down
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
|-- docker-compose.yaml
`-- src
    |-- form.php
    |-- history.php
    |-- index.php
    `-- mail.php
```
