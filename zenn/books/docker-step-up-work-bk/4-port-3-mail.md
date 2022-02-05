---
title: "🖥️ ｜ 🐳 ｜ Mail コンテナにブラウザアクセスできるようにしよう"
---
# Mail コンテナにホストマシンから繋げるようにしよう
MailCatcher は開発用のモックメールサーバです

Mail コンテナを起動すると、Gmail のようにブラウザで受信したメールを確認することができます

todo pic

## コンテナ内での動作確認
ちょっとコンテナに繋いで確認してみましょう

:::details コンテナに繋ぐ方法は覚えていますか？
CONTAINER ID を確認して

```
$ docker ps
CONTAINER ID    IMAGE                            COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher           "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                        "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
0f7d28ae360e    docker-step-up-work-build_php    "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

`docker exec <CONTAINER> <command>` です

```
$ docker exec -it 1b4cbbeb4f19 bash
OCI runtime exec failed: exec failed: container_linux.go:380: starting container process caused: exec: "bash": executable file not found in $PATH: unknown
```

が、失敗しました

どうやらこのコンテナには `bash` がインストールされていなかったようです

仕方ないので代わりに `sh` を使いましょう

```
$ docker exec -it 1b4cbbeb4f19 sh

#
```

接続できました
:::

`curl` を使ってモックメールサーバを叩いてみようと思うのですが、`bash` が入っていなかったくらいですからおそらく `curl` も入ってないでしょう

```
# curl
/bin/sh: curl: not found
```

適当に入れましょう、この `curl` は今回の動作確認で使い捨てるので Dockerfile を書くほどではありません

```
# apk update

# apk add curl
```

[MailCatcher の公式サイト](https://mailcatcher.me/) をみると `127.0.0.1:1080` ( = `localhost:1080` ) で起動しているはずです

HTML が返ってくるか簡単に確認してみましょう

```
# curl -sS localhost:1080 | grep '<title>'
  <title>MailCatcher</title>
```

HTML が返ってくるので、なんらかのサーバが起動していますね


## ホストマシンからの動作確認
では次はホストマシンのブラウザで `localhost:1080` にアクセスしてみましょう

![image](/images/mailcatcher-ng.png)

つながりません

コンテナへはデフォルトではホストマシンからネットワーク接続をすることはできません ( todo

```
$ docker stop 1b4cbbeb4f19
```

```
$ docker run --platform=linux/amd64 -d -p 11080:1080 schickling/mailcatcher 
```

`-p host:container` でホストマシンのポートをコンテナのポートに繋げることができます ( todo

http://localhost:11080 をホストマシンのブラウザで開いてみましょう

![image](/images/mailcatcher-boot.png)

これでメールを受信するたびに `docker exec -it <CONTAINER> sh` をしてコンテナの中で確認する作業がブラウザでできるようになりました
