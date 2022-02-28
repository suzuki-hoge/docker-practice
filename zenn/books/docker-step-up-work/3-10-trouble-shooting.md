---
title: "３部: トラブルシューティング"
---


inspect
ls





# 導入
## 目的・動機
Docker にまつわるエラーを調査できるようになりましょう。

## このページで初登場するコマンド
特になし

# エラーの いつ どこ なに を考えよう
## いつ
いつ とは問題を埋め込む瞬間と、それが発覚する瞬間のことです。

たとえば Dockerfile に不備があったり、`docker run` コマンドのパラメータに間違いがあったりというのが、問題を埋め込む瞬間です。

そしてそれが発覚するのは必ずしも問題を埋め込んだ瞬間とは限りません。
Dockerfile の不備は `docker build` のエラーにもなれば `docker run` のエラーにもなります。
`docker run` のパラメータ間違いが `docker run` のエラーになったりならなかったりもします。

これが把握できないと、不備のある作業が特定できません。

## どこ
どこ とはエラーが発生したマシンのことです。

`docker run` を実行して出たエラーはどこで発生したのでしょうか。
ホストマシン？ コンテナ内？

`docker exec` で `mysql` 命令を送ったけどエラーになってしまったとしたら、エラーはどこで発生したのでしょうか。
ホストマシン？ コンテナ内？ データベース上？

これが把握できないと、出力やログを探し回る場所が判断できません。

## なに
いつ どこ を冷静に分析すると、なに が直接のエラーを発生させたかわかるはずです。

たとえば Dockerfile に不備があった場合、なにが悪くてエラーを出すのでしょうか。
何について調べて修正しなければならないのでしょう？ Docker ？ Linux ？ それとも PHP ？

これが把握できないと、具体的なアプローチが決まりません。

# まとめ
- いつ: いつ問題が埋め込まれ、いつエラーとして目に見えるか
- どこ: どこでログを探せば良いか
- なに: なにについて調べて修正すれば良いか

Docker は間違いが即時エラーにならずに少し先の工程でエラーになるようなことがよくあります。
いつどこでを意識していないと全然問題のない直前に実行したコマンドについて闇雲に調べてしまうことがありますが、冷静に考えて的確に判断できるようになることが理解と解決への一番の近道です。

残りのページで簡単に具体例とアプローチを見ていきましょう

# 導入
## 目的・動機
Docker にまつわるエラーを調査できるようになりましょう。

このページは具体例を列挙して FAQ のように使うものではなく、イメージとコンテナとプロセスについての理解を深めることでエラーに自力で対処できる力をつけるのが目的です。

実際には いつ どこ なに を調べると事象がわかるという順番ですが、今回はクイズ形式で事象から いつ どこ なに を考えてみます。

:::message
このページは出力の大半を削り抜粋したものを掲載しています。
実際はもっと長い出力をじっくり読む必要がありますが、ちゃんと読めばこのページにあるようにちゃんと解決できます。
:::

## このページで初登場するコマンド
特になし

# ビルドエラーのサンプルケース
## e.g. docker build がおかしい
このワークで使っている Dockerfile をあえて少し壊して `docker build` をしました。

```
$ docker build                         \
    -f docker/mysql/Dockerfile         \
    -t docker-step-up-work-build_mysql \
    .

 > [2/2] COPY my.cnf /etc/my.cnf:
------
failed to compute cache key: "/my.cnf" not found: not found
```

このエラーに直面した場合の いつ どこ なに を考えてみましょう。

- いつ: 問題を埋め込んだのは Dockerfile の記述時、エラー発覚は `docker build` の実行時
- どこ: エラーが表示されるのはホストマシン
- なに: Dockerfile の `COPY` と `docker build` の `<path>` について調べて修正する

という感じでしょう。

このケースの場合は `docker build` が即時失敗するので、エラーには簡単に気づくことができます。 ( いつ )
出力もそのまま `docker build` を実行したホストマシンのターミナルに出ているので ( どこ )、ちゃんと読めば Docker についての何かを間違えたことがすぐわかります。( なに )

## e.g. Dockerfile の RUN がおかしい
架空の Dockerfile を用意して `docker build` をしました。

```txt:Dockerfile
FROM ubuntu:20.04

RUN apt update && apt get -y vi
```

```
$ docker build .

 > [2/2] RUN apt update && apt get -y vi:
#5 8.257 E: Invalid operation get
------
executor failed running [/bin/sh -c apt update && apt get -y vi]: exit code: 100
```

このエラーに直面した場合の いつ どこ なに を考えてみましょう。

:::details クイズ: 問題を埋め込んだタイミング、エラーの発覚するタイミング、エラーがどこに表示されるか、何について調べて修正すればいいか
- いつ: 問題を埋め込んだのは Dockerfile の記述時、エラー発覚は `docker build` の実行時
- どこ: エラーが表示されるのはホストマシン
- なに: Dockerfile の `RUN` で実行した `apt` について調べて修正する

という感じでしょう。

このケースも いつ と どこ は簡単ですが、なに は先ほどと違います。
Dockerfile の不備によって `docker build` が失敗していますが、調べて修正するには Linux ( `apt` ) の知識が必要です。
:::

# アプローチ
## ホストマシンのターミナルをよく見る
このページで例に挙げたようなエラーは、いずれもコマンド実行時にすぐエラーがホストマシンのターミナルにでるので、いつ どこ の判断は簡単な部類です。
`docker build` を実行したターミナルの出力をよく見れば良いので、特定のコマンドなどは必要ありません。

なに を意識すれば直接原因にたどり着くのも難しくはないでしょう。

## RUN を崩す
Dockerfile をデバッグする時はあえて `RUN` を書き崩すのも有効です。

`RUN` が 1 つの Dockerfile とは、このように `&&` でコマンドを連続させている書き方のことです。

```txt:Dockerfile
FROM ubuntu:20.04

RUN apt update && apt get -y vi
```

この Dockerfile を `docker build` したときのエラーは次のようになります。

```
 > [2/2] RUN apt update && apt get -y vi:
#5 8.257 E: Invalid operation get
------
executor failed running [/bin/sh -c apt update && apt get -y vi]: exit code: 100
```

対して `RUN` を 2 つに分けた Dockerfile とは、このように 1 行ずつ `RUN` を書く書き方のことです。

```txt:Dockerfile
FROM ubuntu:20.04

RUN apt update
RUN apt get -y vi
```

この Dockerfile を `docker build` したときのエラーは次のようになります。

```
 => ERROR [3/3] RUN apt get -y vi                                                                                                                                                                      0.2s
------
 > [3/3] RUN apt get -y vi:
#6 0.144 E: Invalid operation get
------
executor failed running [/bin/sh -c apt get -y vi]: exit code: 100
```

エラーの範囲が `apt update && apt get -y vi` から `apt get -y vi` に狭くなっていることが確認できます。

デバッグ時にはあえて `RUN` を細かく分けて `docker build` をするというのも有効です、覚えておくと良いでしょう。

# まとめ
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
# 導入
## 目的・動機
Docker にまつわるエラーを調査できるようになりましょう。

このページは具体例を列挙して FAQ のように使うものではなく、イメージとコンテナとプロセスについての理解を深めることでエラーに自力で対処できる力をつけるのが目的です。

todo e ( build error / run error / exec error )

## このページで初登場するコマンド
特になし

# コンテナプロセスがエラーを出す理由
## e.g. Dockerfile の CMD がおかしい
もう一例だけ見てみます。

- PHP 開発サーバを起動するコマンドが `CMD php -S 0.0.0.0:8000` になっている
    - ( 正: `-t src` などのドキュメントルートの指定が必要 )

:::details ワーク: いつ、どこ、なにを考えてから開く
- いつ: ブラウザなどによるアクセス時
- どこ: コンテナ
- なに: PHP

`CMD` でコンテナ起動時の命令を指定していますが、それに問題があります。

ただし `CMD` はイメージにただ情報として含まれるだけなので、`docker build` は成功します。
また、この間違い方だと PHP 開発サーバは起動自体はするので `docker run` も成功します。
しかしブラウザなどでアクセスした際に、4xx とか 5xx 系のエラーになってしまうでしょう。

アクセス時エラーなのでコンテナ内の何らかの出力を探すことになりますが、調べるうちに PHP の起動の仕方が悪かったことがわかるはずです。

このように いつ が `docker build` ではなく なに も Docker ではない場合というのが珍しくありません。
いつ どこ なに を把握することが大切だと感じてもらえたでしょうか。
:::

## e.g. MySQL データベースに繋がらない
たとえば MySQL データベースに繋がらない場合はどうしたら良いでしょうか。

:::details ワーク: いつ、どこ、なにを考えてから開く
- いつ: アクセス時
- どこ: ホストマシンか自コンテナか他のコンテナ、つまりアクセス元次第 / MySQL コンテナ
- なに: MySQL / Docker

MySQL データベースに繋がらない理由は複数考えられます。

単純に認証情報が間違っている場合は、`my.cnf` によって出力するようにした `error.log` に出力があるでしょう。

```
# tail -n 1 /var/log/mysql/error.log
2022-01-30T05:41:09.131003Z 3 [Note] Access denied for user 'hoge'@'localhost' (using password: NO)
```

この場合は MySQL の設定を見直して正しいアクセスをすれば解消するはずです。

`error.log` に出力がなければ、ネットワーク的に MySQL データベースまで到達していない可能性があります。
その場合はクライアント側のプロセスのログを調べる必要があります。たとえば PHP のログや Rails のログなどのことです。

todo

その場合は Docker コンテナのネットワークなどを確認する必要があるでしょう。
:::

# アプローチ
## コンテナ内のログを見る
`docker run` の出力ではなく MySQL データベースなどの起動して動かしているプロセスのログを確認しましょう。

そのためには `docker exec` で接続することと、Dockerfile の `COPY` などで `error.log` などをちゃんと出力するようにしておくことが大切です。
