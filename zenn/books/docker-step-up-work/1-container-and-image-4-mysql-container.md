---
title: "🖥️ ｜ 🐳 ｜ MySQL データベースを数分で用意しよう"
---

# 目的

# MySQL コンテナを起動しよう
MySQL は、最初から MySQL がインストールされているイメージを使ってみましょう ( [Docker Hub](https://hub.docker.com/_/mysql) )

```
$ docker run --platform=linux/amd64 mysql:5.7

    You need to specify one of the following:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD
```

:::message
`--platform=linux/amd64` は一部のコンテナを Mac ( M1 ) で動かすために必要なオプションです

Windows および Mac ( Intel ) の方は付けても付けなくても結果に違いはありません

この Book では M1 Mac の Docker 事情については割愛します
:::

`docker run` が `You need to specify one of the following:` と怒られて失敗しています

こういう場合は [Docker Hub の該当イメージのトップページ](https://hub.docker.com/_/mysql) に行ってみましょう、大抵の場合はそこに説明があります

`Environment Variables` の項に説明があるので、それを参考に次の 4 つを指定してみます

`MYSQL_DATABASE` 以外は自由に決めて、控えておいてください

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_USER`
- `MYSQL_PASSWORD` ( `MYSQL_ROOT_PASSWORD` とは違う値に )
- `MYSQL_DATABASE` ( `event` に )

あらためて `docker run` してみましょう

```
$ docker run                            \
    --platform=linux/amd64              \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_USER=hoge                  \
    -e MYSQL_PASSWORD=password          \
    -e MYSQL_DATABASE=event             \
    mysql:5.7
```

:::message
ここからはコマンドがどんどん長くなるので `\` で改行しています

そのままペーストして 1 コマンドとして実行できますが、初見のパラメータなどは極力自分の手で入力するようにしましょう

手打ちもタイポして出るエラーを読むのもとても大事です、最終的な理解度が全く変わります
:::

ずらずらと出力がされ、最後にこのような出力が見えたら起動完了です

```
Version: '5.7.36'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
```

このターミナルとは違うタブでコンテナ一覧を確認するとどうなるでしょうか

それだけ確認してこのページはおしまいです

:::details ワーク: 結果の予想、コンテナ一覧の確認
```
$ docker ps

CONTAINER ID    IMAGE        COMMAND                   CREATED          STATUS          PORTS                  NAMES
11d945f0edf0    mysql:5.7    "docker-entrypoint.s…"    7 minutes ago    Up 7 minutes    3306/tcp, 33060/tcp    stupefied_napier
```

MySQL サーバが起動し続けているので、コンテナは当然終了していません

とは言え `bash` などが起動しているわけでもないので、このターミナルはもうこれ以上操作はできません

放置して次のページに進みましょう
:::


[comment]: <> (Step 1 の MySQL コンテナはこれで十分です)

[comment]: <> (- :bulb: MySQL イメージを選択し、それをそのまま起動したコンテナができました)

[comment]: <> (- :bulb: コンテナに `-e` で環境変数を指定しました)

[comment]: <> (- :bulb: コンテナへの命令は `mysqld` なので、`bash` のようにターミナルが自由に操作できるわけではありません)

[comment]: <> (- :bulb: `bash` のように対話をするつもりがないので、`-it` は付けませんでした)

[comment]: <> (- :warning: このターミナルも終了せず、次のタブを開いて次に進んでください)
