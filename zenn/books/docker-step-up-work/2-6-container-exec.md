---
title: "２部: コンテナに接続する"
---

コンテナを活用したりトラブルシューティングに必要になったりする、とても大事な `docker container exec` コマンドについて学びます。

# このページで初登場するコマンドとオプション
## コンテナ内でコマンドを実行する
```:新コマンド
$ docker container exec [option] <container> command
```

```:旧コマンド
$ docker exec [option] <container> command
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-i, --interactive`   | コンテナの標準入力に接続する | コンテナを対話操作する
`-t, --tty`   | 擬似ターミナルを割り当てる   | コンテナを対話操作する

# 起動中のコンテナ内でコマンドを実行する
`docker container exec` は、起動中のコンテナに命令を送るコマンドです。

命令を送ると言っても `docker container stop` のような **コンテナを操作する命令ではなく**、コンテナ内で `ls /etc` をせよといった **コンテナ内で実行する Linux コマンド** を命令します。

たとえば Ubuntu イメージでデフォルト命令の `bash` をメインコマンドとしてコンテナを起動し、適当な `hello.txt` を作成します。

```:Host Machine
$ docker container run \
    --interactive      \
    --tty              \
    --rm               \
    --name ubuntu1     \
    ubuntu:20.04       \
    bash

# echo 'hello world' > /hello.txt
```

この `bash` を `exit` で終了せずに、ターミナルの別のタブでコンテナに `cat` コマンドの実行を命令します。

```:Host Machine
$ docker container exec \
    ubuntu1             \
    cat /hello.txt
    
hello world
```

`cat /tmp/hello.txt` の結果で `hello.txt` の存在を確認できました。

:::message
Windows の場合は `cat /tmp/hello.txt` のような空白を含む命令を Git Bash では解釈できない可能性があります。
その場合は PowerShell を使うと解決できると思います。
:::

ファイルを作成したのですからファイルの存在が確認できるのは当たり前の結果に感じますが、次のほとんど同じコマンドとは決定的に違う点が理解できていないと、この先いろいろと回り道をすることになります。


```:Host Machine
$ docker container run \
    ubuntu             \
    cat /hello.txt

cat: /hello.txt: No such file or directory
```

`docker container run` を２回実行してしまっては、**同じイメージからコンテナを２つ起動しただけ** であり、`ubuntu1` コンテナで作成したファイルは `ubuntu2` コンテナでは確認できません。
これは [２部: ](2-5-container-state) で確認しました。

![image](/images/structure/structure.046.jpeg)

`docker container exec` も `docker container run` も Linux コマンドを指定できる点が似ていますが、**起動中のコンテナに命令をするコマンド** と **イメージからコンテナを起動するコマンド** なので、根本的に違います。

# コンテナに接続する
実際に開発やデバッグを行うときは、`ls` などを一発ずつ実行するより起動しているコンテナの `bash` を直接使いたくなることが頻繁にあります。

`bash` も `cat` や `ls` と同じ Linux の１プロセスなので、`docker container exec` を使って命令すれば起動できます。
が、`docker container run` と同様に、コンテナを対話操作する場合は `--interactive` と `--tty` オプションの指定が必要です。

さきほどの `ubuntu1` コンテナが終了している場合は再度起動して、次のコマンドで `ubuntu1` コンテナに `bash` を命令します。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    ubuntu1              \
    bash

#
```

プロンプトが `#` に切り替わったので、Ubuntu コンテナの `bash` に切り替わっています。
普段と同じように操作することができます。

```:Container
# pwd
/

# date
Tue Feb 15 15:18:23 UTC 2022

# whoami
root

# cat /hello.txt
hello world
```

`docker container exec` は次のような場面で大変役に立つので、是非とも正しく理解して使いこなせるようになりましょう。

- コンテナの中にあるログを調べたたい
- Dockerfile を書く前に`bash` でインストールコマンドを確認したい
- MySQL DB サーバのクライアント `mysql` を直接操作したい

## コンテナに SSH するという誤解について
コンテナや `docker container exec` について正しく理解できていないと、`Docker コンテナ SSH` のような検索をしてしまうことは珍しくありません。

これで調べると本当にコンテナに `sshd` という SSH を待ち受ける常駐プロセスを立てて... という手順も見つかりますが、コンテナへの SSH は次のような観点から **推奨できません**。

- SSH のための拡張をしたイメージを作る必要がある
- イメージや Dockerfile とは別に鍵やパスフレーズなどの管理が必要になったり、脆弱性対応などのコストが増える
- SSH の対応が含まれるイメージをそのままデプロイすると、本来は存在しなかった脆弱性が増える可能性がある

SSH をしたくなるという考えは、イメージを仮想サーバのようなものだと捉えていたり、`docker container exec` と `docker container run` の違いが理解できていないと発生しやすいと思います。
僕自身も初めは `Docker コンテナ SSH` で Google 検索をした覚えがあります。

( 再掲 )
![image](/images/structure/structure.027.jpeg)

( 再掲 )
![image](/images/structure/structure.029.jpeg)

# まとめ
簡潔にまとめます。

- `docker container exec` で起動中のコンテナに命令ができる
- SSH 接続は基本的にはせず、`bash` を命じれば良い  
- `docker container run` と `docker container exec` を混同しない

混乱してしまった時は立ち返ってみてください。

:::details このページで作成したものの掃除
```:Host Machine
$ docker container rm --force \
    ubuntu1
```
:::
