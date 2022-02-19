---
title: "２部: コンテナの状態保持"
---

コンテナを終了するとコンテナで行った操作がどうなるか理解します。

# コンテナの状態について
todo 

このページでは次の２つのポイントを確認します。

1. 同じイメージから起動したコンテナでも、コンテナ同士は隔離されていてお互いに影響されない
2. コンテナは起動するたびに新しいものが作成される

# コンテナの構成変更は破棄される
確認してみます。

まずは `ubuntu:20.04` イメージからコンテナを起動します。

```:Host Machine
$ docker container run \
    --interactive        \
    --tty                \
    --rm                 \
    --name ubuntu1       \
    ubuntu:20.04         \
    bash

#
```

特に深い理由はありませんが、ここでは `figlet` というアスキーアートを作るコマンドをインストールすることにします。

```:Container
# apt update
# apt install -y figlet

# figlet 'D o c k e r'
 ____                   _
|  _ \    ___     ___  | | __   ___   _ __
| | | |  / _ \   / __| | |/ /  / _ \ | '__|
| |_| | | (_) | | (__  |   <  |  __/ | |
|____/   \___/   \___| |_|\_\  \___| |_|

#
```

これで `ubuntu:20.04` イメージとは構成の違うコンテナになりました。

e

次に同じイメージから名前以外は全く同じオプションを指定して `ubuntu2` を起動して確認します。

```:Host Machine
$ docker container run \
    --interactive        \
    --tty                \
    --rm                 \
    --name ubuntu2       \
    ubuntu:20.04         \
    bash

# figlet

bash: figlet: command not found
```

`ubuntu1` と `ubuntu2` という名前を付けているのでわかりやすいですが、これらは **違うコンテナ** なので状態は共有していません。

e

ポイントの１について確認できました。

> 1. 同じイメージから起動したコンテナでも、コンテナ同士は隔離されていてお互いに影響されない

これから `ubuntu1` コンテナと `ubuntu2` コンテナを削除しますが、その前に `CONTAINER ID` を控えておきます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE          COMMAND   CREATED          STATUS          PORTS     NAMES
4673ce7219e5   ubuntu:20.04   "bash"    29 seconds ago   Up 28 seconds             ubuntu1
aa751e341705   ubuntu:20.04   "bash"    3 minutes ago    Up 3 minutes              ubuntu2
```

控えたら削除します。削除は複数まとめて行うことが可能です。

```:Host Machine
$ docker container rm \
    --force           \
    ubuntu1 ubuntu2
```

そしてまた全く同じコマンドで `ubuntu1` を起動しますが、`ubuntu1` コンテナには `figlet` がないことを確認します。

```:Host Machine
$ docker container run   \
    --interactive        \
    --tty                \
    --rm                 \
    --name ubuntu1       \
    ubuntu:20.04         \
    bash
    
# figlet

bash: figlet: command not found
```

最後に `CONTAINER ID` を確認すると、名前は最初と同じ `ubuntu1` ですが `CONTAINER ID` は変わっていることが確認できます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE          COMMAND   CREATED          STATUS          PORTS     NAMES
33f1f768bc96   ubuntu:20.04   "bash"    7 minutes ago    Up 7 minutes              ubuntu1
```

e

ポイントの２について確認できました。

> 2. コンテナは起動するたびに新しいものが作成される

# コンテナでファイルを作成する
`figlet` をインストールするという構成変更を行い、コンテナの構成変更は他のコンテナに影響しないということを確認しました。

次はコンテナ内で作成したファイルは他のコンテナからアクセスできないということを確認します。
構成変更について確認した手順とほとんど同じになりますので、手短に対話を用いず進めます。

まずは `ubuntu3` コンテナに `hello.txt` を作成します。

```:Host Machine
$ docker container run             \
    --rm                           \
    --name ubuntu3                 \
    ubuntu:20.04                   \
    echo 'hello world' > hello.txt
```

デフォルト命令を `echo` に上書きしているため、コンテナは即時停止します。

e

`ubuntu4` コンテナには当然 `hello.txt` はなく、

```:Host Machine
$ docker container run \
    --rm               \
    --name ubuntu4     \
    ubuntu:20.04       \
    cat hello.txt
                
cat: hello.txt: No such file or directory
```             

新たに起動した `ubuntu3` コンテナにも、`hello.txt` はありません。

```:Host Machine
$ docker container run \
    --rm               \
    --name ubuntu3     \
    ubuntu:20.04       \
    cat hello.txt
                
cat: hello.txt: No such file or directory
```             

e

ファイル作成も構成変更と同じように他のコンテナには影響しないことが確認できました。

# コンテナの操作を別のコンテナに引き継ぐにはどうするか
大別して 2 つ方法があります。

## 構成変更を永続化したいならイメージを作る
`figlet` などのコンテナで必要になるコマンドは、Dockerfile を用いてイメージの方に入れておくことで解決ができます。

todo e

詳しくは todo で説明します。

## ファイルを残したいならホストマシンと共有する
`hello.txt` のファイルが消えてほしくない場合は、ボリュームかバインドマウントを用いてホストマシンにファイルを共有することで解決できます。

todo e

詳しくは todo で説明します。