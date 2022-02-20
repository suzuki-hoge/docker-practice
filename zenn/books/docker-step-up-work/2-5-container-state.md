---
title: "２部: コンテナの状態保持"
---

コンテナを削除するとコンテナで行った操作がどうなるか学び、Dockerfile やボリュームなどが必要になる理由を理解します。

# コンテナの状態について
[２部: ](2-1-points) の コンテナとは の中に、次のような特徴がありました。

> 3. 複数のコンテナは互いに独立していて影響できず、独自に動作する

このページではこの特徴を２つの観点から確認します。

1. 同じイメージから起動しても違うコンテナである
1. コンテナでの操作はほかのコンテナに影響しない

確認してみましょう。

# 同じイメージから起動しても違うコンテナである
これは `CONTAINER ID` を確認すれば明らかです。

１つめの Nginx コンテナを起動します。

```:Host Machine
$ docker container run \
    --detach           \
    --rm               \
    --name nginx1      \
    nginx
```

２つめの Nginx コンテナを起動します。

```:Host Machine
$ docker container run \
    --detach           \
    --rm               \
    --name nginx2      \
    nginx
```

コンテナ一覧を確認すると、`CONTAINER ID` の異なる２つのコンテナが起動していることが確認できます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS     NAMES
770f08892af6   nginx     "/docker-entrypoint.…"   4 seconds ago   Up 3 seconds   80/tcp    nginx2
abff10020aa4   nginx     "/docker-entrypoint.…"   7 seconds ago   Up 6 seconds   80/tcp    nginx1
```

`nginx1` コンテナを削除して再度 `nginx1` という名前でコンテナを起動します。

```:Host Machine
$ docker stop \
    nginx1
    
$ docker container run \
    --detach           \
    --rm               \
    --name nginx1      \
    nginx
```

名前は同じですが、先ほどとは `CONTAINER ID` が違うので別のコンテナです。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS     NAMES
4f37cff849da   nginx     "/docker-entrypoint.…"   5 seconds ago   Up 5 seconds   80/tcp    nginx1
770f08892af6   nginx     "/docker-entrypoint.…"   4 seconds ago   Up 3 seconds   80/tcp    nginx2
```

同じイメージから起動しても、同じ名前で起動しても、**コンテナは起動するたびに新しい別物** だということが確認できました。

![image](/images/structure/structure.038.jpeg)

# コンテナでの操作はほかのコンテナに影響しない
Ubuntu イメージからメインプロセスが `bash` のコンテナを２つ起動します。

```:Host Machine
$ docker container run \
    --interactive        \
    --tty                \
    --rm                 \
    --name ubuntu1       \
    ubuntu               \
    bash

#
```

```:Host Machine
$ docker container run \
    --interactive        \
    --tty                \
    --rm                 \
    --name ubuntu2       \
    ubuntu               \
    bash

#
```

`ubuntu1` コンテナの方で `vim` をインストールして、`~/hello.txt` を作成します。

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

**コンテナで行った作業や作成したファイルは他のコンテナには一切影響しない** ことが確認できました。

![image](/images/structure/structure.039.jpeg)

# コンテナの状態を別のコンテナに引き継ぐには
大別して 2 つ方法があります。

- 構成変更を引き継ぎたいならイメージを作る
- ファイルを残したいならホストマシンと共有する

どちらもページを設け細かく説明するので、ここでは紹介だけします。

## 構成変更を引き継ぎたいならイメージを作る
`vi` などのコンテナで必要になるコマンドは、Dockerfile を用いてイメージの方に含めておくことで解決ができます。

![image](/images/structure/structure.040.jpeg)

そうすれば「コンテナを起動するたびに `vi` を入れる」のではなく「`vi` が入ったコンテナを起動する」ことで解決できます。

詳しくは [２部: ](2-8-dockerfile) で説明します。

## ファイルを残したいならホストマシンと共有する
`hello.txt` のファイルが消えてほしくない場合は、ボリュームかバインドマウントを用いてホストマシンにファイルを共有することで解決できます。

![image](/images/structure/structure.041.jpeg)

そうすれば「コンテナを起動するたびに `~/hello.txt` を作る」のではなく「コンテナ起動したらホストマシンの `~/hello.txt` をマウントする」ことで解決できます。

詳しくは [３部: ]() で説明します。

# まとめ
簡潔にまとめます。

- コンテナは起動するたびに違うコンテナである
- コンテナの操作は他のコンテナに影響しない  
- 状態を引き継ぎたいならなんらかの対処が必要
  - Dockerfile
  - ボリュームやバインドマウント

混乱してしまった時は立ち返ってみてください。

:::details このページで作成したものの掃除
```:Host Machine
$ docker container rm --force \
    nginx1 nginx2 ubuntu1 ubuntu2
```
:::
