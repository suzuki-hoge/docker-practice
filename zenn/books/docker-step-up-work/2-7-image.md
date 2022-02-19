---
title: "２部: イメージの基礎"
---

todo 〜〜のためののイメージについて理解します。

# このページで初登場するコマンドとオプション
## イメージを取得する
```:新コマンド
$ docker image pull [option] <image>
```

```:旧コマンド
$ docker pull [option] <image>
```

## イメージ一覧を確認する
```:新コマンド
$ docker image ls [option]
```

```:旧コマンド
$ docker images [option]
```

# イメージとは ( 再掲 )

# イメージを探すには
基本的に、イメージは [Docker Hub](https://hub.docker.com/) で検索して選ぶことになるでしょう。

![image](/images/docker-hub-ubuntu-search.png)

[Tags](https://hub.docker.com/_/ubuntu?tab=tags) のタブから都合の良いバージョンや構成内容を選び、記載してあるコマンドで取得・実行ができます。

![image](/images/docker-hub-ubuntu-tags.png)

イメージを取得するには、Docker Hub にも書いてあるように `docker pull` を使います。
( `docker pull` は旧コマンドです )

```:新コマンド
$ docker image pull [option] <image>
```

が、`docker container run` は `docker image pull` などいくつかのコマンドの集合体のような便利なコマンドなので、あえて `docker image pull` だけを行う必要は基本的にはありません。

この Book では `docker image pull` は利用せず、`docker container run` でまとめて扱うこととします。

# イメージを指定するには TAG を使う
`docker container run` などのコマンドで `<image>` を指定する場合は、`IMAGE ID` や `REPOSITORY:TAG` 形式などいくつかの方法で指定することができます。

```:新コマンド
$ docker container run [option] <image> [command]
```

`<image>` を指定する方法は複数ありますが、大抵の場合は人間にとって理解しやすい `REPOSITORY:TAG` 形式を使います。

`REPOSITORY` はたとえば `ubuntu` で、それにバージョンや構成内容を示す `TAG` が付いた状態で公開されています。
`TAG` はたとえば `ubuntu` であれば `20.04` や `21.10` や `22.04` などがあります。

`ubuntu:22.04` や `ubuntu:21.10` のイメージからコンテナを起動して `/etc/lsb-release` という OS 情報が書かれたファイルを見てみると、イメージの `REPOSITORY` は同じですが構成は異なるコンテナが起動していることが確認できます。

```:Host Machine
$ docker container run \
    --rm               \
    --name ubuntu      \
    ubuntu:22.04       \
    cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu Jammy Jellyfish (development branch)"
```

```:Host Machine
$ docker container run \
    --rm               \
    --name ubuntu      \
    ubuntu:21.10       \
    cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=21.10
DISTRIB_CODENAME=impish
DISTRIB_DESCRIPTION="Ubuntu 21.10"
```

また `TAG` には必ず `latest` というタグがあり、`TAG` を省略した場合は `latest` を指定したことになります。
2022 年 3 月時点では、`ubuntu:latest` と `ubuntu` の `DISTRIB_RELEASE` はどちらも `20.04` であることが確認できます。

```:Host Name
$ docker container run \
    --rm               \
    --name ubuntu      \
    ubuntu:latest      \
    cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

```:Host Name
$ docker container run \
    --rm               \
    --name ubuntu      \
    ubuntu             \
    cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

# 使う TAG を決めるには
Ubuntu のバージョンは 2022 年 2 月時点ではそれぞれ次の通りです。

- `22.04` → 開発中 ( コードネーム Jellyfish )
- `21.10` → 最新リリース
- `20.04` → 長期サポート ( Long Term Support )

状況に応じて、たとえば次のように考えて選択すると良いでしょう。

スタンス                 | 構築フェーズ              | 保守フェーズ                       
:--                      | :--                       | :--                                
常に新しいものを使いたい | `22.04` や `21.10` を指定 | 最新発表があったら手動で更新       
常に LTS を使いたい      | `latest` を指定           | `latest` の実態が更新されるのに従う
常に今の LTS を使いたい  | `20.04` を指定            | 次の LTS 発表時に手動で更新

この考え方は、Ubuntu に限らず PHP コンテナや MySQL コンテナや Apache コンテナなど、全てのイメージ選択において同様です。

この Book ではこの先も同じ結果が得られることを期待して、`latest` ではなく `20.04` を明示して使うことにします。

# ローカルにある取得済みのイメージ一覧を確認するには
ホストマシンにあるイメージ一覧を確認するには、`docker image ls` を使います。

```:Host Machine
$ docker image ls

REPOSITORY   TAG      IMAGE ID       CREATED        SIZE
nginx        latest   2e7e2ec411a6   2 weeks ago    134MB
ubuntu       22.04    63a463683606   4 weeks ago    70.4MB
ubuntu       21.10    2a5119fc922b   4 weeks ago    69.9MB
ubuntu       20.04    9f4877540c73   4 weeks ago    65.6MB
ubuntu       latest   9f4877540c73   4 weeks ago    65.6MB
centos       latest   e6a0117ec169   4 months ago   272MB
```

一度も `docker image pull` を実行していない `ubuntu` のイメージも、ローカルに取得してあることが確認できます。

また、`ubuntu:20.04` と `ubuntu:latest` の `IMAGE ID` が全く同じであることも確認できます。
これは２つのコンテナが「動かしてみたら同じっぽい」のではなく「全く同じイメージである」という意味になります。

# どんなイメージか把握するには
イメージの中身を詳細に把握するのは難しいですが、それでもいくつかの情報は読み取れます。

まずは対応しているホスト OS のアーキテクチャが何かです。

![image](/images/docker-hub-ubuntu-archs.png)

これは todo で説明した通りですが、Mac ( M1 ) の場合は気になるポイントになるでしょう。

そして `DIGEST` のいずれかを選択して詳細画面を開くと、イメージのレイヤーが確認できます。

![image](/images/docker-hub-ubuntu-cmd.png)

Dockerfile については todo で解説しますが、`CMD ["bash"]` の表記からデフォルト命令が `bash` であることが読み取れます。
これは `docker run` で `[command]` を指定しなかった場合は `bash` とする、という情報がイメージに含まれていることを意味します。

このイメージはシンプルな構成ですが、セットアップ手順や環境変数が読み取れるような場合もあります。

[`Rails の Tags`](https://hub.docker.com/_/rails?tab=tags) ページから `5.0.1` を選んでレイヤーを確認してみると、実に 22 ものレイヤーがあることが確認できます。

![image](/images/rails-layers-1.png)

この先のページで Dockerfile が簡単にでも読み書きできるようになると、なんとなくの情報はかなり読み取れるようになります。

最後に Dockerfile についてですが、これは `REPOSITORY` によるとしか言いようがありません。

Rails のように [`5.0.1` の Dockerfile はこれだ](https://github.com/docker-library/rails/blob/e16e955a67f48c1e8dc0af87ba6c0b7f8302bad2/Dockerfile) と説明ページに書いてあれば見ることができる、くらいに覚えておくと良いでしょう。

ちなみにレイヤーのページで確認できる内容は Dockerfile そのものではありません。
Dockerfile によって積み上げられたレイヤーの情報だと言うことを理解しておくと良いでしょう。

レイヤーについては todo で詳しく確認します。
