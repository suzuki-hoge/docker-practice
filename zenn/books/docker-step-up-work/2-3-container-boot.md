---
title: "２部: コンテナ起動時の基本の指定"
---

`docker container run` の大量なオプションのうち、基本的に常に指定することになるいくつかのオプションを理解します。

# このページで初登場するコマンドとオプション
## コンテナを起動する
```:新コマンド
$ docker container run [option] <image> [command]
```

```:旧コマンド
$ docker run [option] <image> [command]
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-i`<br>`--interactive`   | コンテナの標準入力に接続する | コンテナを対話操作する
`-t`<br>`--tty`   | 擬似ターミナルを割り当てる   | コンテナを対話操作する ( todo )
`-d`<br>`--detach`   | バックグラウンドで実行する   | ターミナルが固まるのを避ける
`--rm`   | 停止済コンテナを自動で削除する | 起動時に停止済コンテナと<br>一意な情報が衝突するのを避ける
`--name`   | コンテナに名前をつける | コンテナを指定しやすくする
`--platform`   | イメージのアーキテクチャを明示する | M1 Mac で必要な場合がある

# コンテナを対話操作する
[Ubuntu](https://hub.docker.com/_/ubuntu) のコンテナは、起動すると `bash` が操作できます。

このような対話操作を行う場合は、todo の `--interactive` オプションと todo の`--tty` のオプションが必要になります。

```:Host Machine
$ docker container run \
    --interactive      \
    --tty              \
    ubuntu

# 
```

`#` に切り替わったプロンプトは Ubuntu コンテナの中です。OS 情報などを確認するとそれがわかります。

```:Container
# cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

:::message
この Book では `$` のプロンプトをホストマシン、`#` のプロンプトをコンテナとして使い分けます。
:::

`--interactive` と `--tty` を付け忘れると、標準入出力が使えないので即時ホストマシンのターミナルに戻ってきてしまいます。

```:Host Machine
$ docker container run \
    ubuntu

$ 
```

一方で、Nginx の Web サーバ起動のような対話をしない命令には `--interactive` オプションと `--tty` オプションは必要ありませんが、付けても問題はありません。
付けて悪さをすることはないので、ショートオプションの `-i` と `-t` をあわせて常に `-it` を指定する癖があっても良いくらいですが、この Book では訓練の意味を込めて必要な場合のみロングオプションを使うようにします。

# コンテナを非同期で起動する
`--detach` オプションを使うと、コンテナをバックグラウンドで実行することができます。
これを Nginx コンテナの Web サーバのような常駐プロセスを起動する時に指定すると、ターミナルが出力で固まらなくなります。

```:Host Machine
$ docker container run \
    --detach           \
    --publish 8080:80  \
    nginx

606ccda5b16a0f6ebb8496e20a2abc1da40a48ab4f43aef8bc6d0117ce65fad1

$
```

フォアグラウンドで実行した時に見えた大量の出力はなくなり、`CONTAINER ID` を表示だけして即時ホストマシンのプロンプトに戻ります。
この状態でも当然 http://localhost:8080 にアクセスすれば Nginx の Web サーバにアクセスできます。

コンテナの停止や終了はフォアグランドで起動した時と同様です。
起動中コンテナの強制削除をしておきましょう。

```:Host Machine
$ docker container fm \
    --force           \
    606ccda5b16a0f6ebb8496e20a2abc1da40a48ab4f43aef8bc6d0117ce65fad1
```

この Book では基本的には `--detach` を指定することにしますが、動くことが確認できていないコマンドを試行錯誤しながら組み立てる段階では動作確認がしやすいので外す方が良いでしょう。ご自身の状況に合わせて付け外ししてください。
また当然ですが、`bash` のような対話操作をする場合は付けません。

# コンテナ停止時に自動で削除する
`--rm` オプションを使うと、コンテナが停止した時に自動で削除されるようになります。
特に停止済コンテナを再起動したりしない場合は、このオプションをつけておくことで停止済コンテナが溜まり続ける状態を防ぐことができます。
また、後述する `--name` オプションと合わせてよく使います。

```:Host Machine
$ docker container run \
    --rm               \
    --detach           \
    --publish 8080:80  \
    nginx

974b0b8a40d8d1a3c5b693720982c1a47ba948272e124da75c822f0ad0f4e875

$
```

起動中コンテナの強制削除ではなくただの停止を実行しても、削除されていることが確認できます。

```:Host Machine
$ docker container stop \
    974b0b8a40d8d1a3c5b693720982c1a47ba948272e124da75c822f0ad0f4e875
    
$ docker container ls \
    --all
    
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES    
```

この Book では停止済のコンテナを操作することはないため、`--rm` は常に指定するものとします。

# コンテナに名前をつける
`--name` オプションを使うと、起動したコンテナの名前を指定できるようになります。

```:Host Machine
$ docker container run \
    --name web-server  \
    --rm               \
    --detach           \
    --publish 8080:80  \
    nginx

1144303f9d718b35bf7a354f51872dde18bffbcdd8ca900a2f7efb5c9fe62d97

$
```

( 見切れてしまっていますが ) `NAMES` が `web-server` になっていることが確認できます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS                  NAMES
1144303f9d71   nginx     "/docker-entrypoint.…"   35 seconds ago   Up 35 seconds   0.0.0.0:8080->80/tcp   web-server
```

この `NAMES` でもコンテナを指定することができるので、コンテナ停止などを行う時にわざわざ `CONTAINER ID` を調べる手間を省けます。

```:Host Machine
$ docker container stop \
    web-server
```

コンテナ指定に使うと言うことは `NAMES` は一意である必要があるため、同じコンテナ名で複数コンテナを起動することはできません。
このカウントは停止済コンテナも含まれるため、名前をつけたコンテナは停止ではなく削除をするようにしておいた方が混乱が少ないでしょう。

そのため `--name` オプションは `--rm` オプションと合わせて使うことが多いです。

この Book ではわかりやすくかつランダム性が排除できるため、`--name` は常に指定するものとします。

# コンテナのデフォルト命令を上書きする
オプションではありませんが、`docker container run` の `[command]` は正しく理解する必要がある重要な引数なので、ここで確認します。

```:新コマンド
$ docker container run [option] <image> [command]
```

いままで利用した Nginx のイメージは、コンテナを起動すると Web サーバが起動し、Ubuntu のイメージは `bash` が起動しました。
コンテナを起動した時にどんなコマンドが実行されるかは、イメージによって決まっています。

`docker container run` で `[command]` を指定しなかった場合は、イメージごとに決まっているデフォルト命令が実行されますが、`[command]` の指定によりそれを上書きすることができます。

これにより「Nginx のイメージで Web サーバが起動したい」ときと「Nginx のイメージで `bash` が使いたい」ときに違うイメージを用意しなくて済むようになります。

デフォルト命令で Web サーバを起動したいとき ( 例１ )

```:Host Machine
$ docker container run \
    --rm               \
    --detach           \
    nginx
```

Web サーバの起動ではなく、`bash` を使ってコンテナの中を確認したい時 ( 例２ )

```:Host Machine
$ docker container run \
    --rm               \
    --interactive      \
    --tty              \
    nginx              \
    bash
```

ここで大事になるのが **イメージ** と **コンテナ** の関係を正しく把握することです。

例２で Nginx のコンテナの `bash` を起動しましたが、これは例１とは違う Nginx のコンテナの `bash` です。
イメージを OS のようなものだと思っていると「イメージの ( 中の ) Web サーバを起動した」「イメージに SSH をする感覚で `bash` を起動した」と捉えがちですが、全く違います。

![image](/images/structure/structure.020.jpeg)

`docker container run` をするたびに **新しいコンテナがイメージから作られている** ことをよく理解しましょう。

![image](/images/structure/structure.021.jpeg)

例１で起動したコンテナの `bash` を起動するには、todo の `docker container exec` を使います。

![image](/images/structure/structure.022.jpeg)

なんども繰り返しますが、**なに** を **どうする** のかよく考えるようにすれば、この手の勘違いは起きずスムーズに理解することができます。

# ( 若干番外 ) コンテナの OS アーキテクチャを指定する
この Book では細かいことは割愛しますが、OS のアーキテクチャを明示的に指定する必要がある場合は `--platform` というオプションを使います。

たとえば Docker Hub の [Ubuntu](https://hub.docker.com/_/ubuntu) イメージを見てみると、`OS/ARCH` というところにいくつか候補があることがわかります。

![image](/images/docker-hub-ubuntu-archs.png)

一般に Intel or AMD CPU を使っている場合 ( = Windows と Intel の Mac ) は `linux/amd64` を、ARM CPU を使っている場合 ( = M1 の Mac ) は `linux/arm64/v8` を Docker が自動で選択します。

この `linux/amd64` もしくはそれに類するものはまず間違いなく存在しますが、`linux/arm64/v8` は存在しないことが珍しくありません。

ARM CPU を利用しているが `linux/arm64/v8` が存在しない場合に、強引に `linux/amd64` のイメージを利用するために `--platform` オプションを使うことになります。

`--platform=linux/amd64` は、Intel or AMD CPU の人にとっては未指定時と同じ結果になるため影響はありません。
また `--platform=linux/arm64/v8` を明示する状況も多くありません。

この Book では、必要な場合に限り `--platform=linux/amd64` を指定するのみとします。
次の表を見て状況に応じて解釈し対応してください。

オプション                  | 自分のマシン    | 結果                                    
:--                         | :--              | :--                                     
`--platform=linux/amd64`    | Intel or AMD CPU | 意味がない<br>気にしなくて良い<br>削っても良い
`--platform=linux/amd64`    | ARM CPU         | 大事<br>そっくりそのまま指定する
`--platform=linux/arm64/v8` | Intel or AMD CPU | まず目にしない<br>この Book にはない
`--platform=linux/arm64/v8` | ARM CPU         | 意味がない<br>まず目にしない<br>この Book にはない

余談ですが、`--platform` オプションで解決するかは、イメージによりケースバイケースです。
OS アーキテクチャについて気になる方は以前公開したこの Book を、

https://zenn.dev/suzuki_hoge/books/2021-07-m1-mac-4ede8ceb81e13aef10cf

M1 Mac での Docker 利用については同じく以前公開したこの Book を、

https://zenn.dev/suzuki_hoge/books/2021-12-m1-docker-5ac3fe0b1c05de

それぞれご覧いただければと思います。

# まとめ
ショートオプションを使って `-itd` などとよく指定されますが、ロングオプションで正しく理解しておけばちゃんと把握できます。

この Book では以後それぞれ次の方針でロングオプションを用いて扱うことにします。

オプション      | この Book での使い方 | 実運用時の考え方                                 
:--             | :--                  | :--                                              
`--interactive` | 対話時のみ指定       | 常に指定しても害はない                           
`--tty`         | 対話時のみ指定       | 常に指定しても害はない                           
`--detach`      | 常駐型プロセス時のみ指定 | 出力が見たいやデバッグをしたいなど<br>必要に応じて付け外しする         
`--rm`          | 常に指定             | 停止済コンテナを再起動など<br>したいか考えて決める   
`--name`        | 常に指定             | 指定して損はしない                               
`--platform`    | 必要な場合のみ指定   | Intel or AMD CPU ならスルー<br>ARM CPU なら要注意

