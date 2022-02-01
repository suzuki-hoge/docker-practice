---
title: "🖥️ ｜ 🐳 ｜ ビルドのエラーを調べられるようになろう"
---

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
