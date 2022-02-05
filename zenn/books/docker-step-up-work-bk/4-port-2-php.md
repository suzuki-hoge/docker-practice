---
title: "🖥️ ｜ 🐳 ｜ PHP コンテナにブラウザアクセスできるようにしよう"
---
## PHP コンテナにホストマシンから繋げるようにしよう
PHP もブラウザから確認できるようにしましょう

まずは PHP ファイルをもとにサーバを起動します

```
$ docker ps
CONTAINER ID    IMAGE                            COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher           "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                        "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
0f7d28ae360e    docker-step-up-work-build_php    "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

本来なら Apache や Nginx を用意するところですが、PHP には [ビルトインウェブサーバー](https://www.php.net/manual/ja/features.commandline.webserver.php) の機能を使って PHP をサーバにしてしまいます

```
$ docker ps
CONTAINER ID    IMAGE                            COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher           "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                        "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
0f7d28ae360e    docker-step-up-work-build_php    "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

```
$ docker stop 0f7d28ae360e
```

```
$ docker run -d -it -p 18000:8000 docker-step-up-work-build_php
```

```
$ docker exec -it <PHP> bash
```

```
# cat << EOL > index.php
<?php
echo 'Hello World';
EOL

# cat index.php
<?php
echo 'Hello World';

# php -S 0.0.0.0:8000
[Wed Jan 26 03:20:16 2022] PHP 8.0.14 Development Server (http://0.0.0.0:8000) started
```

Development Server が started したようです
ブラウザで確認してみましょう

:::details 練習: ブラウザで開く localhost のポートはなんでしょう
http://localhost:18000 をホストマシンのブラウザで開いてみましょう
:::

![image](/images/php-boot.png)

これで PHP コンテナの PHP サーバもホストマシンのブラウザから見られるようになりました

# まとめ
-p を確認しました


## Ubuntu のコンテナに PHP を入れよう
- 環境変数も設定する
- index.php も入れる

## PHP のコンテナに MTA も入れよう

## MySQL のコンテナに .cnf を入れよう // todo

- [step3](books/docker-step-up-work-bk/bk/step3.mder-step-up-work/bk/step3.md)
- [step5](books/docker-step-up-work-bk/bk/step5.mder-step-up-work/bk/step5.md)

