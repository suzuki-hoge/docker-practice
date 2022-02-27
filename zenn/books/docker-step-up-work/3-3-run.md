---
title: "３部: コンテナの起動"
---

[３部]() でビルドしたイメージを起動して、今できる動作確認を行います。

![image](/images/structure/structure.067.jpeg)

# このページでやること
- `docker container run` の実行

# このページで初登場するコマンドとオプション
オプションがいくつか増えます。

頻出はしないものなので、頭の片隅に存在を留めておくくらいで十分です。

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
まだメールサーバ ( = Mail コンテナ ) と接続できていないので **確認できません**。

# DB コンテナの起動
ビルドした `docker-practice:db` を起動して MySQL を操作してビルドの結果を確認します。

**配布されているイメージは基本的にデフォルト命令で起動** します。

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

対話しない、何が起こるか確認したいのでバックグラウンドにしない、名前と削除対応はいつも通り、**アーキテクチャの設定が必要**、**環境変数が必要**、命令を変えない、と整理して次のコマンドでコンテナを起動します。

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

一切の SQL を書かずに `hoge` と `event` が作られたのは **`mysql:5.7` のイメージがいろいろやってくれたから** です。

このように、配布されているイメージにはいろいろと便利な拡張がされているものがあります。
Docker も MySQL も知らないとこれらの恩恵を正しく理解して使いこなすのは難しいですが、 **MySQL そのものの機能か Docker の機能か、それとも特定のイメージの機能か** を少しでも意識してみるとだんだんと活用できるようになります。

当然まだテーブルはありません、これは [３部]() で解決します。

```:Container
mysql> show tables;

Empty set (0.00 sec)
```

# Mail コンテナの起動
Mail コンテナも DB コンテナと同様にデフォルト命令のまま起動します。

起動すると送信されたメールを確認するための Web サーバと SMTP サーバが起動しますが、さっと Web サーバだけ確認します。
何も手を加えずに起動しているので、Web サーバが起動していれば SMTP サーバも起動していると考えてよいでしょう。

対話しない、何が起こるか確認したいのでバックグラウンドにしない、名前と削除対応はいつも通り、**アーキテクチャの設定が必要**、命令を変えない、と整理して次のコマンドでコンテナを起動します。

```:Host Machine
$ docker container run     \
    --name mail            \
    --rm                   \
    --platform linux/amd64 \
    mailhog/mailhog:v1.0.1

2022/02/26 14:09:42 [SMTP] Binding to address: 0.0.0.0:1025
[HTTP] Binding to address: 0.0.0.0:8025
2022/02/26 14:09:42 Serving under http://0.0.0.0:8025/
```

それらしいメッセージが出てターミナルが固まれば、おそらく起動に成功しています。

今回も **起動している同じコンテナに** 接続して `curl` で確認します。

が、**このコンテナには `bash` がない** ので `bash` を命令するとエラーになります。
`/etc/os-release` を見ると Alpine Linux であることがわかりますが、軽量であることを重視した Alpine Linux をベースとしたイメージには `curl` はおろか `bash` も入っていない場合が大半です。

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

# コンテナが起動しないときは
コンテナが起動しない理由は、大きく分けて２つあります。

1. Docker の状態や操作に不備がある
2. イメージや命令に不備がある

いずれの場合もターミナルの出力をよく読んで、図のどこに不備があるのかを考えるのが大切です。

## 1. Docker の状態や操作に不備がある
- e.g. コマンドの文法が間違っている ( 操作が悪い )
- e.g. コンテナ名が衝突してたり、Docker Engine が起動してなかったりする ( 状態が悪い )

これらは **`docker container run` の出力をよく読めば手がかりを得られます**。

`--detach` を付けている場合は外すと良いでしょう。
( 付けたまま出力を確認する方法もあり、それは [３部]() で扱います。)

## 2. イメージや命令に不備がある
- e.g. MySQL の設定ファイルが間違っている ( イメージが悪い )

これも **`docker container run` の出力をよく読むのが大切** ですが、問題の本質は **Docker とはあまり関係ない** という理解が大切です。

また **イメージが悪い場合でも `docker image build` が失敗するとは限らない** ということがポイントです。
**イメージそのものはただの情報の集まりであり、そこに含まれている設定ファイルは正しいか検証されていません**。

結果的に `container image build` が成功して `docker container run` が失敗した場合でも、**悪いのは イメージ** という可能性があるということです。

![image](/images/structure/structure.068.jpeg)

安易に `docker mysql 起動しない` などと調べても、`my.cnf` にタイポがあるという問題に辿り着くのは難しいでしょう。

慣れるまでは少し難しいですが、問題を **仕込んだタイミング** と **発覚したタイミング** の相関が把握できるようになるためにも、図示して線を書く習慣を身につけましょう。

# まとめ

todo github commit

## やったこと
- App コンテナ
  - ２部で学んだ通りに起動
  - Dockerfile の５つの命令を `bash` で確認
  - ビルトインウェブサーバーを起動し、**起動中のコンテナに接続** して `curl` で確認 
- DB コンテナ
  - **環境変数を指定** して起動
  - **起動中のコンテナに接続** して `mysql` で接続を確認
- Mail コンテナ
    - **起動中のコンテナに `root` の `sh` で接続** して `curl` で確認

## ポイント
- なんらかの機能がなにに提供されているかを **意識する** と使いこなしやすい
  - e.g. ビルトインウェブサーバーは PHP
  - e.g. 環境変数で指定したユーザの作成は `mysql5.7` 
- コンテナが起動しないときは、**問題をいつ仕込んだか** よく考えるとよい    

## できるようになったこと
- `docker image run` の正常終了
- 起動した３コンテナそれぞれについて、直接接続して localhost 通信でサーバの起動を確認

![image](/images/structure/structure.067.jpeg)

## やりきれなかったこと
- DB コンテナのテーブル作成
    - 解決は [３部]()
