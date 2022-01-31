---
title: "📚 ｜ 🐳 ｜ コンテナを終了するとどうなるの？"
---

# 導入
## 目的・動機
コンテナの状態管理について知り、イメージを作る必要性を知りましょう。

## このページで初登場するコマンド
特になし

# コンテナの状態
## Ubuntu コンテナの状態を確認する
前のページで終了してしまったはずなので、Ubuntu コンテナを起動し直します。

```
$ docker run     \
    --name php   \
    --rm         \
    -it          \
    ubuntu:20.04 \
    bash
```

ここまでのワークで Ubuntu コンテナは終了と起動を何度か行っているので、PHP をインストールした Ubuntu コンテナと今起動した Ubuntu コンテナは違うのものになっているはずです。

Ubuntu コンテナには PHP をインストールしてありましたが、今起動したこの Ubuntu コンテナはどうなっているでしょうか。

`docker exec` で確認してみましょう。
`<container>` には `--name` で指定した `php` を使います。

```
$ docker exec php php -v

OCI runtime exec failed: exec failed: container_linux.go:380:
starting container process caused: exec:
"php": executable file not found in $PATH: unknown
```

PHP が入っていません。

## MySQL コンテナの状態を確認する
MySQL コンテナも起動し直して確認しましょう。

```
$ docker run                            \
    --name mysql                        \
    --rm                                \
    --platform=linux/amd64              \
    -d                                  \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_USER=hoge                  \
    -e MYSQL_PASSWORD=password          \
    -e MYSQL_DATABASE=event             \
    mysql:5.7
```

こちらの `docker exec` でも `<container>` の指定に `--name` で指定した `mysql` を使います。

```
$ docker exec -it mysql mysql -h localhost -u hoge -ppassword event -e 'select * from foo;'

ERROR 1146 (42S02) at line 1: Table 'event.foo' doesn't exist
```

MySQL コンテナのデータが残っていません。

## コンテナの状態について
コンテナは 1 つ 1 つが独立して存在し、コンテナの状態は終了するとどこにも残りません。

なので PHP のインストール作業や MySQL データベースへのデータ追加は、コンテナを終了すると全て振り出しに戻ります。

同じイメージから起動したコンテナ同士でもコンテナは状態を共有しませんし、変更は全て終了時に破棄されます。
それにより常にクリーンで同じ状態のコンテナが起動してくれるので安心して使えるのですが、毎回インストール作業やデータ追加作業を行うのは面倒すぎます。

この先のワークで PHP のインストールを毎回行わなくて良い Ubuntu コンテナと、追加したデータが残る MySQL コンテナをセットアップしていきます。

# まとめ
- コンテナで行った作業は残らない
- インストールしたものも作成したファイルもデータも全て消え、毎回同じクリーンなコンテナが起動する
- それを調整するためにイメージを作成したりする
