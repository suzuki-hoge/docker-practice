---
title: "２部: コンテナの基礎操作"
---

コンテナの一番基本の操作について理解します。

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
`-f, --force`   | 実行中のコンテナを強制削除する | 停止と削除をまとめて行う

# コンテナとは ( 再掲 )
todo

# コンテナの起動
コンテナの起動は `docker container run` で行います。

```:新コマンド
$ docker container run [option] <image> [command]
```

[Nginx](https://hub.docker.com/_/nginx) という Web サーバのコンテナを起動してみましょう。

このページでは、まずは最小限の指定に絞って起動をしてみます。

任意指定である `[option]` は動作確認のために `--publish` ( 解説は todo ) を、
同じく任意指定である `[command]` は未指定にします。
`<image>` は `nginx` を指定します。

以上を踏まえ、次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run \
    --publish 8080:80  \
    nginx

2022/02/13 23:12:57 [notice] 1#1: start worker processes
```

:::message
Docker のコマンドは長くなりがちなので、この Book では引数ごとに `\` で改行します。
そのままペーストして実行できますが、コマンドは自分の手で入力することを強く推奨します。
手打ちも、手打ちミスのエラーを見るのも大事な経験です。
:::

:::message
出力は見やすいように空行や余白を入れたり、要点となるところ以外をカットしたりしています。ご了承ください。
:::

`start worker processes` の出力とともにターミナルが操作できなくなれば、起動成功です。

ブラウザで http://localhost:8080 にアクセスしてみましょう。

![image](/images/nginx.png)

このような画面が表示されれば Nginx のコンテナが起動して Web サーバにアクセスできています。

**イメージ** から **コンテナ** を起動したので、今行った操作はこういう図で示せます。

![image](/images/structure/structure.012.jpeg)

# 起動中のコンテナ一覧の確認
コンテナ一覧の確認は `docker container ls` で行います。

```:新コマンド
$ docker container ls [option]
```

`docker container run` を実行したターミナルのタブをそのままにして、別のタブを開きコンテナ一覧を確認してみます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                  NAMES
7fbae1e2219d   nginx     "/docker-entrypoint.…"   6 minutes ago   Up 6 minutes   0.0.0.0:8080->80/tcp   amazing_brahmagupta
```

コンテナが 1 つ起動していることが確認できます。

`IMAGE` が指定した `nginx` になっていることが確認できます。
`CONTAINER ID` と `NAMES` はランダムで割り振られた値になっています。

起動したコンテナは `7fbae1e2219d` という `CONTAINER ID` であることが確認できました。

![image](/images/structure/structure.013.jpeg)

# 起動中のコンテナの停止
コンテナの停止は `docker container stop` で行います。

```:新コマンド
$ docker container stop [option] <container>
```

`[option]` は特に指定せず、`<container>` だけ指定します。
コンテナを一意に識別するには、`docker container ls` で確認できる `CONTAINER ID` か `NAMES` を使います。
今回の場合は `7fbae1e2219d` か `amazing_brahmagupta` です。

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

**起動中のコンテナ** に **停止を命令をした** ので、今行った操作はこういう図で示せます。

![image](/images/structure/structure.014.jpeg)

# 全てのコンテナ一覧の確認
コンテナは、停止しても削除するまでは情報としてはホストマシンに残り続け、再起動することもできます。

起動していないコンテナの一覧を確認するには、`docker container ls` に `--all` オプションをつけて実行します。


```:Host Machine
$ docker container ls \
    --all
    
CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS                     PORTS     NAMES
7fbae1e2219d   nginx     "/docker-entrypoint.…"   18 seconds ago   Exited (0) 6 seconds ago             amazing_brahmagupta
```

`--all` オプションをつけない場合の確認範囲はこのように、
![image](/images/structure/structure.015.jpeg)

`--all` オプションをつけた場合の確認範囲はこのように図で示ます。
![image](/images/structure/structure.016.jpeg)

# 停止済コンテナの削除
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

**停止済のコンテナ** に **削除を命令をした** ので、今行った操作はこういう図で示せます。

![image](/images/structure/structure.017.jpeg)

# 起動中コンテナの削除
`docker container stop` と `docker container rm` を次のコマンドでまとめて行うことができます。

```:Host Machine
$ docker container rm \
    --force           \
    <container>
```

すぐ削除するつもりのコンテナを停止する時は、このコマンドを覚えておくと楽ができるでしょう。

**起動中のコンテナ** に **強制削除を命令をした** ので、今行った操作はこういう図で示せます。

![image](/images/structure/structure.018.jpeg)

## 停止するか削除するか
停止中のコンテナは再起動することができますが、僕はほとんど再起動をすることはありません。

コンテナは軽量で使い捨てがコンセプトなので、がんがん起動してがんがん削除して良いと僕は考えます。

# 番外: Namespace について