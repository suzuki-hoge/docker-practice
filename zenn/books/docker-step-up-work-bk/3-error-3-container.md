---
title: "🖥️ ｜ 🐳 ｜ コンテナ起動のエラーを調べられるようになろう"
---

# 導入
## 目的・動機
Docker にまつわるエラーを調査できるようになりましょう。

このページは具体例を列挙して FAQ のように使うものではなく、イメージとコンテナとプロセスについての理解を深めることでエラーに自力で対処できる力をつけるのが目的です。

## このページで初登場するコマンド
[`docker logs [option] <container>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/logs/)

オプション | 意味 | 用途  
:-- | :-- | :--

# コンテナ起動がエラーを出す理由
いくつか考えられますが、いくつか例を挙げると次のようなものがあります。

実際には いつ どこ なに を調べると事象がわかるという順番ですが、今回はクイズ形式で事象から いつ どこ なに を考えてみます。

前ページ ( todo ) のまとめを思い出して、考えてみましょう。

> - いつ: どういう操作をしたらエラーが発生するか
> - どこ: ログを探す場所
> - なに: 具体的に調べものをする時の検索ワード

## e.g. 必要なパラメータが足りない
たとえばこのワークでも使っている MySQL コンテナにはパラメータが必要です。

```
$ docker run --platform=linux/amd64 mysql:5.7

    You need to specify one of the following:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD
```

:::details ワーク: いつ、どこ、なにを考えてから開く
- いつ: `docker run` 実行時
- どこ: ホストマシン
- なに: Docker / MySQL

これは `docker run` が即時失敗するので、容易に気付くことができます。
ホストマシンのターミナルのエラーをじっくり読み、MySQL にさせたいことを理解して、Docker の知識を使って `-e` で指定するというアプローチになるでしょう。
:::

## e.g. 一意性の必要な何かが競合している
コンテナに明示的に `--name` で名前をつけて起動したり、後述する `-p` オプションによるポート指定が競合したりすることがあります。

:::details ワーク: いつ、どこ、なにを考えてから開く
- いつ: `docker run` 実行時
- どこ: ホストマシン
- なに: Docker

これは `docker run` が即時失敗するので、容易に気付くことができます。
ホストマシンのターミナルのエラーをじっくり読み、`docker ps` で他のコンテナについて確認したりしながら原因を探します。
:::

# アプローチ
とにかく必要なのはコンテナの出力をちゃんと見ることです。

具体的な方法をいくつか把握しましょう。

## コンテナ起動をフォアグラウンドにする
まず一番シンプルなのは `docker run` の `-d` オプションを外してバックグラウンドではなくフォアグラウンドで実行することです。
そうすればターミナルに直接コマンドのエラーが出てきます。

```
$ docker run                        \
    --name mysql                    \
    --rm                            \
    --platform=linux/amd64          \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_USER=hoge              \
    -e MYSQL_PASSWORD=password      \
    -e MYSQL_DATABASE=event         \
    docker-step-up-work-build_mysql

mysqld: Character set 'nihongo' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
```

起動コマンドである `mysqld` が `nihongo` という Character set を認識できないと言っています。一目瞭然です。

## docker logs を使う
すでに `-d` を付けてバックグラウンドで起動してしまっているコンテナでも、`docker logs` で同じ情報が確認できます。

起動しているコンテナのログを確認するコマンドなので、当然引数は `<container>` です。

```txt:docker logs
$ docker logs [option] <container>
```

```
$ docker run                        \
    --name mysql                    \
    --rm                            \
    --platform=linux/amd64          \
    -d                              \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_USER=hoge              \
    -e MYSQL_PASSWORD=password      \
    -e MYSQL_DATABASE=event         \
    docker-step-up-work-build_mysql

d283ece0e8dc8c3ad604566884bb4451d450916bef63fc7175ef27d1148d2903
```

```
$ docker logs d283ece0

mysqld: Character set 'nihongo' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
```

フォアグラウンドで実行した場合にターミナルに出力される内容が `docker logs` で確認できます。

## Docker Desktop を使う
Docker Desktop の `Containers / Apps` でも同じ情報を確認できます。

todo pic

# まとめ
いずれの場合も `docker run` の結果をちゃんと見ることです。

そのエラーが Dockerfile の時点で仕込まれていたのかコンテナ起動の仕方が悪いのかを正しく判断し、適切に調べたりヘルプを出したりできるようになるのが極めて大切です。
