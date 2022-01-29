---
title: "🖥️ ｜ 🐳 ｜ MySQL データベースを数分で用意しよう"
---
# MySQL コンテナを起動しよう
MySQL は、最初から MySQL がインストールされているイメージを使ってみましょう

`bash` などを対話で操作するつもりはないので `-it` は不要です

:::message
`-it` を付けても問題はないので常に指定する癖がついても良いくらいですが、この Book では意識して使い分けましょう
:::

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

よく見ると `You need to specify one of the following:` と怒られて失敗しています

コンテナには起動時に環境変数の指定が必要なものがあります

こういう場合は [Docker Hub の MySQL のトップページ](https://hub.docker.com/_/mysql?tab=description) に行ってみましょう、大抵の場合はそこに説明があります

`Environment Variables` の項に説明があるので、次の 4 つを指定してみます

3 つは自由に決めて、控えておいてください

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_USER`
- `MYSQL_PASSWORD` ( `MYSQL_ROOT_PASSWORD` とは違う値に )
- `MYSQL_DATABASE` ( `event` に )

もう一度 `docker run` してみましょう

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

そのままペーストして 1 コマンドとして実行できますが、極力自分の手で入力するようにしましょう

最終的な理解度が全く変わるので、ペーストはお勧めしません
:::

```
Version: '5.7.36'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
```

このような出力が見えたら起動完了です


Step 1 の MySQL コンテナはこれで十分です

- :bulb: MySQL イメージを選択し、それをそのまま起動したコンテナができました
- :bulb: コンテナに `-e` で環境変数を指定しました
- :bulb: コンテナへの命令は `mysqld` なので、`bash` のようにターミナルが自由に操作できるわけではありません
- :bulb: `bash` のように対話をするつもりがないので、`-it` は付けませんでした
- :warning: このターミナルも終了せず、次のタブを開いて次に進んでください
