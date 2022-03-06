---
title: "２部: コンテナの状態保持"
---

コンテナを削除するとコンテナで行った操作がどうなるか学び、Dockerfile やボリュームなどが必要になる理由を理解しましょう。

# コンテナの状態について
【 ２部: Docker を理解するためのポイント 】で次の特徴を挙げました。

> 3. 複数のコンテナは互いに独立していて影響できず、独自に動作する

このページではこの特徴を２つの観点から確認します。

1. 同じイメージから起動しても違うコンテナである
1. コンテナでの操作はほかのコンテナに影響しない

# 同じイメージから起動しても違うコンテナである
これは `CONTAINER ID` を確認すれば明らかです。

１つめの Nginx コンテナを起動します。

```:Host Machine
$ docker container run \
    --name nginx1      \
    --rm               \
    --detach           \
    nginx:1.21
```

２つめの Nginx コンテナを起動します。

```:Host Machine
$ docker container run \
    --name nginx2      \
    --rm               \
    --detach           \
    nginx:1.21
```

コンテナ一覧を確認すると、`CONTAINER ID` の異なる２つのコンテナが起動していることが確認できます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS     NAMES
770f08892af6   nginx:1.21     "/docker-entrypoint.…"   4 seconds ago   Up 3 seconds   80/tcp    nginx2
abff10020aa4   nginx:1.21     "/docker-entrypoint.…"   7 seconds ago   Up 6 seconds   80/tcp    nginx1
```

`nginx1` コンテナを削除して再度 `nginx1` という名前でコンテナを起動します。

```:Host Machine
$ docker stop \
    nginx1
    
$ docker container run \
    --name nginx1      \
    --rm               \
    --detach           \
    nginx:1.21
```

名前は同じですが、先ほどとは `CONTAINER ID` が違うので別のコンテナです。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS     NAMES
4f37cff849da   nginx:1.21     "/docker-entrypoint.…"   5 seconds ago   Up 5 seconds   80/tcp    nginx1
770f08892af6   nginx:1.21     "/docker-entrypoint.…"   4 seconds ago   Up 3 seconds   80/tcp    nginx2
```

同じイメージから起動しても、同じ名前で起動しても、**コンテナは起動するたびに新しい別物** だということが確認できました。

![image](/images/structure/structure.038.jpeg)

# コンテナでの操作はほかのコンテナに影響しない
Ubuntu イメージからメインプロセスが `bash` のコンテナを２つ起動します。

```:Host Machine
$ docker container run \
    --name ubuntu1       \
    --rm                 \
    --interactive        \
    --tty                \
    ubuntu:20.04         \
    bash

#
```

```:Host Machine
$ docker container run \
    --name ubuntu2       \
    --rm                 \
    --interactive        \
    --tty                \
    ubuntu:20.04         \
    bash

#
```

`ubuntu1` コンテナの方で `vi` をインストールして、`~/hello.txt` を作成します。

```:Container ( ubuntu1 )
# apt update
# apt install -y vim

# vi ~/hello.txt
( hello world と入力して :wq で保存して終了する )
```

`ubuntu1` コンテナで `vi` コマンドが実行できることを確認したら、次は `ubuntu2` コンテナで `vi` コマンドを実行します。

```:Container ( ubuntu2 )
# vi

bash: vi: command not found
```

`ubuntu2` コンテナにはそもそも `vi` が存在しないことが確認できます。

`~/hello.txt` も存在しません。

```:Container ( ubuntu2 )
# cat ~/hello.txt

cat: /root/hello.txt: No such file or directory
```

**コンテナで行った操作や作成したファイルは他のコンテナには一切影響しない** ことが確認できました。

![image](/images/structure/structure.039.jpeg)

# コンテナの状態変更を別のコンテナに反映するには
大別して 2 つ方法があります。

- 構成変更を全コンテナに反映したいならイメージを作る
- コンテナのファイルを残したいならホストマシンと共有する

どちらもページを設け細かく説明するので、ここでは紹介だけします。

## 構成変更を引き継ぎたいならイメージを作る
`vi` などをどのコンテナでも使いたい場合は、Dockerfile で **`vi` 入りイメージを作っておく** ことで解決ができます。

![image](/images/structure/structure.040.jpeg)

そうすれば「コンテナを起動するたびに `vi` を入れる」のではなく「`vi` が入ったコンテナを起動する」ことができます。

詳しくは【 ２部: Dockerfile の基礎 】で説明します。

## ファイルを残したいならホストマシンと共有する
`hello.txt` のファイルが消えてほしくない場合は、ボリュームで **ホストマシンにファイルを共有する** ことで解決できます。

![image](/images/structure/structure.041.jpeg)

そうすれば「コンテナを起動するたびに `~/hello.txt` を作る」のではなく「コンテナを起動してからホストマシンのあるボリュームをマウントする」ことができます。

詳しくは【 ３部: ボリューム 】で説明します。

# まとめ
簡潔にまとめます。

- コンテナは **起動するたびに違うコンテナ** である
- コンテナの操作は **他のコンテナに影響しない**
- 別のコンテナに変更を反映するには、なんらかの対処が必要
  - Dockerfile
  - ボリュームやバインドマウント

混乱してしまった時は立ち返ってみてください。

:::details このページで作成したものの掃除
```:Host Machine
$ docker container rm --force \
    nginx1 nginx2 ubuntu1 ubuntu2
```
:::
