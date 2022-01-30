---
title: "🖥️ ｜ 🐳 ｜ コンテナ起動のエラーを調べられるようになろう"
---

# 目的・動機
Docker にまつわるエラーを調査できるようになりましょう。

このページは具体例を列挙して FAQ のように使うものではなく、イメージとコンテナとプロセスについての理解を深めることでエラーに自力で対処できる力をつけるのが目的です。

# このページで初登場するコマンド
docker logs

# コンテナ起動がエラーを出す理由
いくつも考えられますが、いくつか例を挙げると次のようなものがあります。

- 設定ファイルがおかしい
- 起動コマンドがおかしい
- ポートが競合している ( ポートについては後のページで解説 )

# エラーの原因を調べるには
一番大事なのはコンテナの出力をちゃんと見ることです。

まず一番シンプルなのは `docker run` の `-d` オプションを外すことです、そうすればターミナルに直接コマンドのエラーが出てきます。

```
$ docker run                                            \
    --platform=linux/amd64                              \
    -e MYSQL_ROOT_PASSWORD=password                     \
    -e MYSQL_USER=hoge                                  \
    -e MYSQL_PASSWORD=password                          \
    -e MYSQL_DATABASE=event                             \
    docker-step-up-work-build_mysql

2022-01-30 05:24:57+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.36-1debian10 started.
2022-01-30 05:24:58+00:00 [ERROR] [Entrypoint]: mysqld failed while attempting to check config
	command was: mysqld -d --verbose --help --log-bin-index=/tmp/tmp.5vsB2tEuwm
	mysqld: Character set 'nihongo' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
mysqld: Character set 'nihongo' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
```

起動コマンドである `mysqld` が `nihongo` という Character set を認識できないと言っています。一目瞭然です。

すでに `-d` を付けてバックグラウンドで起動してしまっているコンテナでも、`docker logs` で同じ情報が確認できます。

```
$ docker run                                            \
    --platform=linux/amd64                              \
    -d                                                  \
    -e MYSQL_ROOT_PASSWORD=password                     \
    -e MYSQL_USER=hoge                                  \
    -e MYSQL_PASSWORD=password                          \
    -e MYSQL_DATABASE=event                             \
    docker-step-up-work-build_mysql

d283ece0e8dc8c3ad604566884bb4451d450916bef63fc7175ef27d1148d2903

$ docker logs d283ece0

2022-01-30 05:25:03+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.36-1debian10 started.
2022-01-30 05:25:03+00:00 [ERROR] [Entrypoint]: mysqld failed while attempting to check config
	command was: mysqld --verbose --help --log-bin-index=/tmp/tmp.F0RX0STi4f
	mysqld: Character set 'nihongo' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
mysqld: Character set 'nihongo' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
```

Docker Desktop の `Containers / Apps` でも同じ情報を確認できます。

todo e

いずれの場合も `docker run` の結果をちゃんと見ることです。

そのエラーが Dockerfile の時点で仕込まれていたのかコンテナ起動の仕方が悪いのかを正しく判断し、適切に調べたりヘルプを出したりできるようになるのが極めて大切です。
