---
title: "３部: コンテナの起動"
---

[３部]() でビルドしたイメージを起動して、今できる動作確認を行います。

![image](/images/structure/structure.062.jpeg)

# このページで初登場するコマンドとオプション
## コンテナを起動する
```:新コマンド
$ docker container run [option] <image> [command]
```

```:旧コマンド
$ docker run [option] <image> [command]
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-e`<br>`--env`   | コンテナに環境変数を設定する | 意味の通り

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
`-u`<br>`--user`   | 命令を実行するユーザを指定する | root で実行する

# App コンテナの起動
## ビルド結果の確認
ビルドした `docker-practice:app` を起動して `bash` を命令し、５つの命令が意図した結果になっているかを確認します。

対話をする、名前を付けておく、停止済コンテナはいらない、イメージは先ほどビルドしたもの、と整理して次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run  \
    --interactive       \
    --tty               \
    --name app          \
    --rm                \
    docker-practice:app \
    bash

#    
```

OS 情報

```:Container
# cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

PHP のバージョン

```:Container
# php -v | head -n 1

PHP 8.0.16 (cli) (built: Feb 21 2022 14:42:00) ( NTS )
```

PHP の設定ファイル

```:Container
# cat /etc/php/8.0/cli/conf.d/mail.ini

[Mail]
sendmail_path = /usr/bin/msmtp -t
```

msmtp のバージョン

```:Container
# msmtp --version | head -n 1

msmtp version 1.8.6
```

msmtp の設定ファイル

```:Container
# cat /etc/msmtprc
```

このように確認できればビルドは成功しています。

`exit` で `bash` を終了して大丈夫です。

## Web サーバの起動
続けてアプリケーションを実行する Web サーバを起動する手順を確認します。

PHP の [ビルトインウェブサーバー](https://www.php.net/manual/ja/features.commandline.webserver.php) について調べると `php -S` で起動できることがわかるので、コンテナを起動する時の命令を Web サーバの起動に変更します。

対話しない、何が起こるか確認したいのでバックグラウンドにしない、命令を変える、と整理して次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run  \
    --name app          \
    --rm                \
    docker-practice:app \
    php -S 0.0.0.0:8000

[Sat Feb 26 13:43:31 2022] PHP 8.0.16 Development Server (http://0.0.0.0:8000) started    
```

まだコンテナにブラウザからアクセスできないので、**起動している同じコンテナに** 接続して Web サーバの起動を確認します。

まずは接続します。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    app                  \
    bash
```

`curl` も `vi` も `index.html` もないので、適当に準備します。

```:Container
# apt install curl

# echo '<h1>Hello World</h1>' > /index.html
```

Web サーバにリクエストを送ると、HTML が返ってくることが確認できます。

```:Container
# curl localhost:8000

<h1>Hello World</h1>
```

今はここまで確認できれば十分です。
`curl` と `index.html` はコンテナ削除とともに消失しますが、動作確認にしか使わないので問題ありません。

## メールの送信
これはまだメールサーバ ( = Mail コンテナ ) と接続できていないので **確認できません**。

# DB コンテナの起動
ビルドした `docker-practice:db` を起動して MySQL を操作してビルドの結果を確認します。

配布されているイメージは、基本的にデフォルト命令は変更せず使います。

またこのイメージを起動するとエラーが発生してわかることなのですが、起動する時に環境変数の指定が必要になっています。^[レイヤーを確認するとデフォルト命令が `ENTRYPOINT` 命令により `docker-entrypoint.sh` になっており、その Shell で環境変数を確認しています。]
こういうエラーを見た場合は [Docker Hub の該当イメージのトップページ](https://hub.docker.com/_/mysql) に行くと、解説が見つかることが多いです。

`Environment Variables` の項に説明があるので、それを参考に次の 4 つを指定します。

変数名                    | 用途                                           | 値                                                 
:--                       | :--                                            | :--                                                
`MYSQL_ROOT_PASSWORD`     | ルートユーザのパスワード                       | 自由                                               
`MYSQL_USER`<br>( 任意 )     | 作成するユーザの名前<br>指定すると作成される       | 自由                                               
`MYSQL_PASSWORD`<br>( 任意 ) | 作成するユーザのパスワード<br>指定すると作成される | 自由<br>ただし `MYSQL_ROOT_PASSWORD` とは別
`MYSQL_DATABASE`<br>( 任意 ) | データベースの名前<br>指定すると作成される           | `event`

自由となっている部分は自分で決めて、控えておいてください。
この本では上から `rootpassword`, `hoge`, `password`, `event` としますが、自分で決める方がよりよい学びが得られます。

対話しない、何が起こるか確認したいのでバックグラウンドにしない、名前と削除対応はいつも通り、**アーキテクチャの制定が必要**、**環境変数が必要**、命令を変えない、と整理して次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run                     \
    --name db                              \
    --rm                                   \
    --platform linux/amd64                 \
    --env MYSQL_ROOT_PASSWORD=rootpassword \
    --env MYSQL_USER=hoge                  \
    --env MYSQL_PASSWORD=password          \
    --env MYSQL_DATABASE=event             \
    docker-practice:db

2022-02-26 13:53:49+00:00 [Note] [Entrypoint]: MySQL init process done. Ready for start up.
```

特にエラーが出ず出力が固まったら、おそらく MySQL サーバの起動に成功しています。

PHP の Web サーバを `localhost` で確認したように、**起動している同じコンテナに** 接続して MySQL の確認をします。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    db                   \
    bash

#
```

続いて `bash` から `mysql` コマンドで MySQL サーバに接続します。
接続オプションは次の通りです。

オプション | 意味           | 値                                                      
:--        | :--            | :--                                                     
`-h`       | ホスト         | `localhost`                                             
`-u`       | ユーザ         | ルートではない、作成したユーザ                          
`-p`       | パスワード     | ルートではない、作成したユーザ<br>空白を開けずに入力する
引数       | データベース名 | 作成したもの

整理ができたら接続します。
パスワードを隠さず入力しているので警告が出ますが、今はよしとします。

```:Container
# mysql -h localhost -u hoge -ppassword event

mysql>
```

`hoge/password` で `event` データベースに接続できることが確認できました。

一切の SQL を書かずにそれらが作られたのは **`mysql:5.7` のイメージがすごいいろいろやってくれたから** です。

このように、配布されているイメージにはいろいろと便利な拡張がされているものがありますが、調べ物をするときは **MySQL そのものの機能か Docker の機能か、それとも特定のイメージの機能か** を意識していないと上手に解決できません。
初めから完璧に識別するのは難しいですが、少しだけ意識してみるとよいでしょう。

当然まだテーブルはありません、**これは [３部]() で解決します**。

```:Container
mysql> show tables;

Empty set (0.00 sec)
```

# Mail コンテナの起動
Mail コンテナも DB コンテナと同様にデフォルト命令のまま起動します。

起動すると送信されたメールを確認するための Web サーバと SMTP サーバが起動しますが、さっと Web サーバだけ確認します。
何も手を加えずに起動しているので、Web サーバが起動していれば SMTP サーバも起動していると考えてよいでしょう。

対話しない、何が起こるか確認したいのでバックグラウンドにしない、名前と削除対応はいつも通り、**アーキテクチャの制定が必要**、命令を変えない、と整理して次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run                     \
    --name mail                            \
    --rm                                   \
    --platform linux/amd64                 \
    mailhog/mailhog:v1.0.1

2022/02/26 14:09:42 [SMTP] Binding to address: 0.0.0.0:1025
[HTTP] Binding to address: 0.0.0.0:8025
2022/02/26 14:09:42 Serving under http://0.0.0.0:8025/
```

それらしいメッセージが出てターミナルが固まれば、おそらく起動に成功しています。

今回も **起動している同じコンテナに** 接続して `curl` で確認します。

が、**このコンテナには `bash` がない** ので `bash` を命令するとエラーになります。
`/etc/os-release` を見ると Alpine Linux であることがわかりますが、軽量であることを重視した Alpine Linux には `curl` はおろか `bash` も入っていないことが大半です。

そのため Mail コンテナには `sh` を命令します。
また `sudo` もないため、`--user` オプションで `root` で `sh` を起動します。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    --user root          \
    mail                 \
    sh

# apk add curl
```

先ほどターミナルで見たポートにリクエストして、結果を適当に確認します。

```:Container
# curl -sS localhost:8025 | grep '<title>'

    <title>MailHog</title>
```

起動していると判断して良いでしょう。

# まとめ
行ったことを簡潔にまとめます。

- App コンテナ
  - ２部で学んだ通りに起動
  - Dockerfile の５つの命令を `bash` で確認
  - ビルトインウェブサーバーを起動し、**起動中のコンテナに接続** して `curl` で確認 
- DB コンテナ
  - **環境変数を指定** して起動
  - **起動中のコンテナに接続** して `mysql` で接続を確認
- Mail コンテナ
    - **起動中のコンテナに `root` の `sh` で接続** して `curl` で確認
- サービスの機能か Docker の機能かイメージの機能かを **識別** できるのが望ましい

todo: 往復することになるでしょう