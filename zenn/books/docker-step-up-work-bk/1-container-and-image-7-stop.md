---
title: "📚 ｜ 🐳 ｜ コンテナを終了してみよう"
---

# 導入
## 目的・動機
コンテナを停止する方法を知っておきましょう。

## このページで初登場するコマンド
[`docker stop [option] <container>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/stop/)

オプション | 意味 | 用途  
:-- | :-- | :--

[`docker rm [option] <container>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/rm/)

オプション | 意味 | 用途  
:-- | :-- | :--
`-f, --force`   | 実行中のコンテナを強制削除する | 終了と削除をまとめて行う

# コンテナを終了する
## stop によるコンテナの終了
`bash` などのコンテナは `exit` で `bash` を終了すればコンテナも終了しますが、サーバのようなコンテナを終了するには `docker stop` を使います。

```txt:docker stop
$ docker stop [option] <container>
```

起動中のコンテナを停止するので、当然引数は `<container>` になります。
`CONTAINER ID` は `docker ps` で調べましょう。

```
$ docker ps

CONTAINER ID    IMAGE                     COMMAND                   CREATED          STATUS          PORTS                  NAMES
c8cabbe7b1ae    ubuntu:20.04              "bash"                    9 minutes ago    Up 9 minutes                           sharp_galileo
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"    7 minutes ago    Up 7 minutes    3306/tcp, 33060/tcp    stupefied_napier
2c70700cc16b    mailhog/mailhog:v1.0.1    "MailHog"                 1 minutes ago    Up 1 minutes    1025/tcp, 8025/tcp     confident_fermat
```

調べたら `CONTAINER ID` を指定して `docker stop` をします。

```
$ docker stop c8cabbe7b1ae
$ docker stop 11d945f0edf0
$ docker stop 2c70700cc16b
```

`docker ps` をするとコンテナが終了していることが確認できます。

```
$ docker ps

CONTAINER ID    IMAGE    COMMAND    CREATED    STATUS    PORTS    NAMES
```

## コンテナの状態
`docker stop` によりコンテナを終了しましたが、実はコンテナは実行中ではないだけで情報としてはまだ残っています。

実行中以外の `STATUS` のコンテナも確認するには、`-a` オプションを使います。

```
$ docker ps -a

CONTAINER ID    IMAGE                     COMMAND                   CREATED          STATUS                       PORTS                  NAMES
c8cabbe7b1ae    ubuntu:20.04              "bash"                    9 minutes ago    Exited (0) 18 seconds ago                           sharp_galileo
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"    7 minutes ago    Exited (0) 20 seconds ago    3306/tcp, 33060/tcp    stupefied_napier
2c70700cc16b    mailhog/mailhog:v1.0.1    "MailHog"                 1 minutes ago    Exited (0) 30 seconds ago    1025/tcp, 8025/tcp     confident_fermat
```

終了済みのコンテナが残っている、という状態です。

## rm によるコンテナの削除
終了済みのコンテナを削除するには `docker rm` を使います。

```
$ docker rm c8cabbe7b1ae
$ docker rm 11d945f0edf0
$ docker rm 2c70700cc16b
```

```
$ docker ps -a

CONTAINER ID    IMAGE    COMMAND    CREATED    STATUS    PORTS    NAMES
```

これで一覧からも完全になくなりました。

また、起動中のコンテナでも `docker rm` に `-f` オプションを付けることで終了と削除を一気に行うことも可能です。

適当にコンテナを何か起動して、`docker rm` を試してみましょう。

:::details ワーク: 適当なコンテナの起動、docker rm による終了と削除
```
$ docker run -it ubuntu bash
```

`docker rm` では終了はできません。

```
$ docker rm 649ff6ab75bf
Error response from daemon: You cannot remove a running container 649ff6ab75bf90fcd6f0792fd17864b7d399514465a0ad64bec32ea9afa0cdf6. Stop the container before attempting removal or force remove
```

`docker rm -f` なら終了と削除を一気に行えます。

```
$ docker rm -f 649ff6ab75bf
649ff6ab75bf
```

```
$ docker ps -a

CONTAINER ID    IMAGE    COMMAND    CREATED    STATUS    PORTS    NAMES
```
:::

# まとめ
- `docker stop` でコンテナを終了できる
- コンテナは終了しても終了済みコンテナとして一覧には残る
- `docker rm` でコンテナの削除を、`docker rm -f` でコンテナの終了と削除を行える
