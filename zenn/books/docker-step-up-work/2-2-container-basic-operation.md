---
title: "２部: コンテナの基礎操作"
---

コンテナを操作するコマンドをいくつか使い、コンテナを起動したり停止したりできるようになりましょう。

コマンド一覧を覚えても「わかったけどいつ使うのさ」という気持ち止まりで正しい理解にはつながりづらいと [２部: Docker を理解するためのポイント](2-1-points) で言いましたが、最低限の基本操作は覚えておく必要があります。

２部のここから先では、特定の用途によって使い分けたりしない Docker 操作の基礎を学びます。

# このページで初登場するコマンドとオプション
## コンテナを起動する
```:新コマンド
$ docker container run [option] <image> [command]
```

```:旧コマンド
$ docker run [option] <image> [command]
```

## コンテナ一覧を確認する
```:新コマンド
$ docker container ls [option]
```

```:旧コマンド
$ docker ps [option]
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-a`<br>`--all`   | 全てのコンテナを表示する | 起動中以外のコンテナを確認する

## コンテナを停止する
```:新コマンド
$ docker container stop [option] <container>
```

```:旧コマンド
$ docker stop [option] <container>
```

## コンテナを削除する
```:新コマンド
$ docker container rm [option] <container>
```

```:旧コマンド
$ docker rm [option] <container>
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-f`<br>`--force`   | 実行中のコンテナを強制削除する | 停止と削除をまとめて行う

# コンテナを起動する
[Nginx](https://hub.docker.com/_/nginx) という Web サーバのコンテナを、`docker container run` コマンドを使って起動してみましょう。

```:新コマンド
$ docker container run [option] <image> [command]
```

:::message
この本では独自のルールとして `[option]` のような `[]` で囲まれた引数を **任意**、`<image>` のような `<>` で囲まれた引数を **必須** という意味で表現します。

`[]` の引数は省略可能なので、`<image>` のみを指定する最低限の実行例は次のようになります。

```:正
$ docker container run hello-world
```

`[]` の引数を指定する場合、次のように位置を変えることはできません。

```:誤１
$ docker container --rm run hello-world
```
```:誤２
$ docker container run hello-world --rm
```
`[option]` は `<image>` の前である必要があります。

```:正
$ docker container run --rm hello-world
```
`docker container run` が１つのコマンドだと理解できれば、`ls -l /tmp` と同じような形をしていることが理解できるはずです。
:::

まずはじめに最低限のオプションでコンテナを起動します。
ただ起動だけをしたいので `<image>` に `nginx` を指定するのみにしたいところですが、動作確認が全くできないのは面白みにかけるので `--publish` オプションのみ付けることにします。
`--publish` オプションによりブラウザから動作確認が動作確認ができるようになりますが、これの解説は [３部: todo]() で行います。

以上を踏まえ、次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run \
    --publish 8080:80  \
    nginx:1.21

2022/02/13 23:12:57 [notice] 1#1: start worker processes
```

:::message
Docker のコマンドは長くなりがちなので、この Book では引数ごとに `\` で改行します。

そのままペーストして実行できますが、コマンドは自分の手で入力することを強く推奨します。

手打ちも、手打ちミスのエラーを見るのも大事な経験です。
:::

:::message
出力は見やすいように空行や余白を入れたり、要点と以外をカットしたりしています。
ご了承ください。
:::

`start worker processes` の出力とともにターミナルが操作できなくなれば、起動成功です。

ブラウザで http://localhost:8080 にアクセスしてみましょう。

次のような画面になれば、起動した Nginx コンテナの Web サーバにアクセスできています。

![image](/images/nginx.png)

**イメージ** から **コンテナ** を起動したので、今の状況は次のような図で示せます。

![image](/images/structure/structure.019.jpeg)

# 起動中のコンテナ一覧を確認する
コンテナ一覧の確認をするときは `docker container ls` コマンドを使います。

```:新コマンド
$ docker container ls [option]
```

`docker container run` を実行したターミナルのタブをそのままにして、別のタブを新たに開きコンテナ一覧を確認してみます。

オプションは特に指定しなくてよいので、次のコマンドでコンテナ一覧を確認します。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                  NAMES
7fbae1e2219d   nginx:1.21     "/docker-entrypoint.…"   6 minutes ago   Up 6 minutes   0.0.0.0:8080->80/tcp   amazing_brahmagupta
```

`IMAGE` が `nginx:1.21` と表示されているコンテナが１つ起動していることが確認できます。

`CONTAINER ID` は `7fbae1e2219d` で `NAMES` は `amazing_brahmagupta` となっていますが、これは起動するたびにランダムで割り振られます。

**コンテナ一覧** を確認したら `CONTAINER ID` が `7fbae1e2219d` だったので、今の状況は次のような図で示せます。

![image](/images/structure/structure.020.jpeg)

# 起動中のコンテナを停止する
Web サーバで確認したいことが終わってコンテナを停止したくなったら、`docker container stop` コマンドを使います。

```:新コマンド
$ docker container stop [option] <container>
```

`docker container stop` にはほぼ全くオプションはなく、コンテナを停止するコマンドはシンプルです。

引数        | 値                  | 理由                                    
:--         | :--                 | :--                                     
`[option]`  | | 
`<container>`   | `7fbae1e2219d` か<br>`amazing_brahmagupta` | 命令対象がコンテナのため、<br>コンテナを一意にできる情報を指定する

以上を踏まえ、次のコマンドでコンテナを停止します。

```:Host Machine
$ docker stop \
  7fbae1e2219d
```

正常にコンテナが停止できると、もう http://localhost:8080 にアクセスしても Web サーバにはアクセスできません。

起動中のコンテナ一覧の確認をしても、Nginx コンテナは確認できなくなっています。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

**起動中のコンテナ** に **停止を命令をした** ので、今の状況は次のような図で示せます。

![image](/images/structure/structure.021.jpeg)

# 全てのコンテナ一覧を確認する
コンテナは、停止しても削除するまでは情報としてはホストマシンに残り続け、再起動することもできます。

起動していないコンテナも含めてコンテナ一覧を確認するには、`docker container ls` に `--all` オプションをつけて実行します。

```:Host Machine
$ docker container ls \
    --all
    
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS                     PORTS     NAMES
7fbae1e2219d   nginx:1.21     "/docker-entrypoint.…"   18 seconds ago   Exited (0) 6 seconds ago             amazing_brahmagupta
```

`--all` オプションをつけない場合の確認範囲はこのように、
![image](/images/structure/structure.022.jpeg)

`--all` オプションをつけた場合の確認範囲はこのように図で示ます。
![image](/images/structure/structure.023.jpeg)

# 停止済コンテナを削除する
停止済みのコンテナを削除するには `docker container rm` を行います。

```:新コマンド
$ docker container rm [option] <container>
```

`docker container stop` と同様に `docker container rm` も `<container>` を指定するコマンドなので、`docker container ls` で確認できる `CONTAINER ID` を使って実行します。

```:Host Machine
$ docker container rm \
    7fbae1e2219d
```

これでコンテナは完全に削除されました。

```:Host Machine
$ docker container ls \
    --all

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

**停止済のコンテナ** に **削除を命令をした** ので、今の状況は次のような図で示せます。

![image](/images/structure/structure.024.jpeg)

# 起動中のコンテナを停止せずいきなり削除する
`docker container stop` と `docker container rm` を次のコマンドでまとめて行うことができます。

```:Host Machine
$ docker container rm \
    --force           \
    <container>
```

すぐ削除するつもりのコンテナを停止する時は、このコマンドを覚えておくと楽ができるでしょう。

**起動中のコンテナ** に **強制削除を命令をした** 場合は、状況を次のような図で示せます。

![image](/images/structure/structure.025.jpeg)

## 停止するか削除するか
停止済のコンテナは再起動ができますが、僕はほとんど再起動をすることはありません。

なので僕は `docker container stop` は使わずに `docker container rm --force` か、[２部: コンテナ起動時の基本の指定](2-2-container-basic-operation) で解説する `docker container run` の `--rm` オプションを使って、コンテナはすぐ削除しています。

コンテナは軽量で使い捨てがコンセプトなので、気軽に起動して用が済んだら削除、また使いたくなったら起動しなおす、というスタンスがシンプルでよいと僕は思います。

# まとめ
簡潔にまとめます。

- コンテナを起動するには `docker container run`
- コンテナ一覧を確認するなら `docker container ls`
- 起動中のコンテナを停止するなら `docker container stop`
- 停止済のコンテナを削除するなら `docker container rm`
- 起動中のコンテナを削除するなら `docker container rm --force`

混乱してしまった時は立ち返ってみてください。
