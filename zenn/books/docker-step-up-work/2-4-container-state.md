---
title: "2-4: コンテナの基礎３ コンテナの状態保持"
---

コンテナを終了するとコンテナで行った操作がどうなるか理解します。

# このページで初登場するコマンドとオプション
このページで新たに使うコマンドはなし

# コンテナの変更と終了
## コンテナの構成を変更する
まずは適当に何かをインストールしたいので `ubuntu:20.04` イメージからコンテナを起動します。

```:Host Machine
$ docker container run \
  --name ubuntu        \
  --interactive        \
  --tty                \
  ubuntu:20.04         \
  bash

#
```

なんでも良いので `figlet` を入れてアスキーアートを作れるようにします。

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

## コンテナでファイルを作成する
コンテナ内にファイルを作ります。内容はなんでも良いので `figlet` の中身でも残しておきましょう。

```:Container
# figlet 'f o c a l' > /root/codename.figlet

# cat /root/codename.figlet
  __                          _
 / _|   ___     ___    __ _  | |
| |_   / _ \   / __|  / _` | | |
|  _| | (_) | | (__  | (_| | | |
|_|    \___/   \___|  \__,_| |_|

#
```

## コンテナを終了する
準備は十分なので、コンテナ一覧で `CONTAINER ID` を確認してそれを控えた上で停止して削除します。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE          COMMAND   CREATED          STATUS          PORTS     NAMES
5bb97aeedfe1   ubuntu:20.04   "bash"    10 minutes ago   Up 10 minutes             ubuntu

$ docker container rm -f ubuntu
```

## コンテナを起動して確認する
全く同じコマンドでもう一度コンテナを起動し、`figlet` の存在と `/root/codename.figlet` の存在を確認します。

```:Host Machine
$ docker container run \
  --name ubuntu        \
  --interactive        \
  --tty                \
  ubuntu:20.04         \
  bash

#
```

まず `CONTAINER ID` を確認すると、さきほどとは値が違います。
このことから、今行っているのは再起動ではなく別コンテナの起動であることが理解できます。

```:Host Machine
$ docker container ls

CONTAINER ID   IMAGE          COMMAND   CREATED              STATUS              PORTS     NAMES
10f5f1df122f   ubuntu:20.04   "bash"    About a minute ago   Up About a minute             ubuntu
```

次に新たに起動したコンテナに `figlet` と `/root/codename.figlet` が存在するかを確認します。

```:Container
# figlet

bash: figlet: command not found
```

```:Container
# ls /root

#
```

どちらも存在を確認できないことから、コンテナはコンテナ内で行った変更を一切他のコンテナに影響させないことが確認できました。

# コンテナの操作を別のコンテナに引き継ぐにはどうするか
大別して 2 つ方法があります。

## 構成変更を永続化したいならイメージを作る
`figlet` のインストールなどのコンテナで必要になる作業は、Dockerfile を用いてイメージをビルドする時にインストールすると解決できます。

todo e

詳しくは todo で説明します。

## ファイルを残したいならホストマシンと共有する
`/root/codename.figlet` のファイルが消えてほしくない場合は、ストレージを用いてホストマシンに共有することで解決できます。

todo e

詳しくは todo で説明します。