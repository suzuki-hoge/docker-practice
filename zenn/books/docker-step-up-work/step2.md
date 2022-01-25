---
title: "Step 2: コンテナに接続しよう"
---

この章の目標は起動しているコンテナを操作して、`docker exec` を理解することです

- [コマンドライン・リファレンス ( exec )](http://docs.docker.jp/v19.03/engine/reference/commandline/exec.html)

コンテナを終了してしまった場合は、Step 1 の手順で起動し直しておきましょう

# MySQL コンテナに接続しよう
`docker ps` を見るだけでは面白くありませんので、MySQL サーバに繋いでみましょう

`docker exec <CONTAINER>` で、起動しているコンテナに対して命令を送ることができます

まずは `docker ps` を実行して `CONTAINER ID` を確認します

```
$ docker ps
CONTAINER ID    IMAGE                     COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher    "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
345264ac9206    ubuntu:22.04              "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

`docker exec` をしてみましょう

```
$ docker exec 11d945f0edf0 ls -l
total 72
drwxr-xr-x   1 root root 4096 Nov 17 10:34 bin
drwxr-xr-x   2 root root 4096 Oct  3 09:00 boot
drwxr-xr-x   5 root root  340 Jan 23 08:13 dev
drwxr-xr-x   2 root root 4096 Nov 17 10:33 docker-entrypoint-initdb.d
lrwxrwxrwx   1 root root   34 Nov 17 10:34 entrypoint.sh -> usr/local/bin/docker-entrypoint.sh
drwxr-xr-x   1 root root 4096 Jan 23 08:13 etc

略
```

:bulb: `docker run` と似ていますが `docker exec` はコンテナを指定しています

`docker xxx` が何を引数に何を行っているか、本当にちゃんと意識しましょう

面倒なようですが一度それができればすぐ理解できます、結局一番の近道です

`docker exec` は起動しているコンテナに命令をするコマンドなので、イメージは指定できませんし、`docker exec` をどう実行しても `docker ps` で確認できるコンテナが増えたりはしません

コンテナの中で `ls -l` が実行されました

次は `bash` を命じてみましょう

`bash` を使うときは `docker run` と同じく `-it` が必要です

```
$ docker exec -it 11d945f0edf0 bash

#
```

接続できると、環境変数が埋まっていることが確認できます

```
# env | grep -i mysql
MYSQL_DATABASE=event
MYSQL_VERSION=5.7.36-1debian10
MYSQL_USER=hoge
MYSQL_PASSWORD=password
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_MAJOR=5.7
```

データベースに繋いでみましょう

MySQL サーバに接続する `mysql` コマンドの書式は次の通りです

```
mysql -h <host> -u <user> -p<password> <database>
```

:::details MySQL コンテナの `bash` から作ったユーザで `event` データベースに接続してみましょう
```
# mysql -h localhost -u hoge -ppassword event

>mysql>
```

`<host>` は MySQL コンテナの `bash` から繋ぐので `localhost` で、それ以外は自分で決めたパラメータです
:::

空っぽの `event` データベースが作られていることが確認できます

```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| event              |
+--------------------+
2 rows in set (0.00 sec)

mysql> use event;
Database changed

mysql> show tables;
Empty set (0.00 sec)
```

また、`docker exec` で `ls -l` のように複数単語による命令が指定できるということは、`mysql` も指定できるということです

:::details `docker exec` で `bash` を起動せずに MySQL データベースに接続してみましょう
```
$ docker exec -it 11d945f0edf0 mysql -h localhost -u hoge -ppassword event

>mysql>
```

コンテナの中で動いたコマンド全くそのままです

`docker exec` 自体はホストマシンのターミナルで書いてますが、`mysql` コマンドが実行されるのはコンテナの中だと意識しましょう

このコマンドはホストマシンから MySQL データベースに接続しているのではなく、ホストマシンからコンテナへ MySQL データベースに接続する命令を送りつけています
:::

# まとめ
`docker exec` を紹介しました

![image](/images/slide/slide.009.jpeg)

- `docker exec` は起動しているコンテナに命令を送るコマンド
- `docker run` と文法は似ているが、指定するものが違うことを意識する
- コンテナへの SSH というのは普通は行わない、`docker exec` で `bash` を命じれば良い

`docker exec` は言語コンテナに「ちょっとこれテストしてくれや」とか「ちょっとコンテナ内のサーバログ見せてや」みたいな感じでそこそこ使います

思った通りに動かない時に直接 `bash` で接続してデバッグしたりもするので、覚えておきましょう

- [step1](./step1.md)
- [step3](./step3.md)

