---
title: "３部: コンテナの起動"
---

【 ３部: イメージのビルド 】でビルドしたイメージを起動して、今できる動作確認を行います。

# 全体構成とハイライト
![image](/images/structure/structure.067.jpeg)

## やることの確認
＼ | やること                       | できるようになること                                                                                
:-- | :--                            | :--                                                                                                 
App|イメージをビルド               | ✅　PHP が準備できる<br>✅　メール送信が準備できる
App|👉　コンテナを起動しビルド結果を確認<br>👉　Web サーバを起動                 | Dockerfile の妥当性が確認できる<br>Web サーバが起動できる                  
App|ソースコードをバインドマウント | ホストマシンの `.php` 編集が即反映される                                                    
App|コンテナのポートを公開         | ブラウザからアクセスできる                                            
App|コンテナをネットワークに接続<br>データベースサーバの接続設定<br>メールサーバの接続設定   | DB コンテナに接続できる<br>Mail コンテナに接続できる
App|Docker Compose 化              | これらを１コマンドで再現できる
DB| イメージをビルド                                                         | ✅　文字コードとログの設定ができる
DB| 👉　環境変数を指定してコンテナを起動                                         | Dockerfile の妥当性が確認できる<br>MySQL サーバが起動できる<br>ユーザとデータベースを作成できる
DB| データ置場にボリュームをマウント                                 | テーブルがコンテナ削除で消えなくなる                                      
DB| 初期化クエリをバインドマウント                                       | コンテナ起動時にテーブルが作成される                                            
DB| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
DB| Docker Compose 化                                                        | これらを１コマンドで再現できる
Mail| イメージを選定                                                           | ✅　SMTP サーバが起動できる<br>✅　Web サーバが起動できる                                      
Mail| 👉　コンテナを起動                                                           | SMTP サーバが起動できる<br>Web サーバが起動できる                           
Mail| コンテナのポートを公開                                                   | ブラウザからアクセスできる                            
Mail| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
Mail| Docker Compose 化                                                        | これらを１コマンドで再現できる
ほか| ボリュームを作成                                                        | マウントする準備ができる
ほか| ネットワークを作成                                                        | コンテナを接続する準備ができる

# このページで初登場する構築のコマンドとオプション
## コンテナを起動する - container run
オプション | 意味 | 用途  
:-- | :-- | :--
`-e`<br>`--env`   | コンテナに環境変数を設定する | 意味の通り

# 構築
## App コンテナの起動
### 起動してビルド結果を確認する
【 ３部: イメージのビルド 】でビルドした `docker-practice:app` を起動し、`bash` を実行します。

```:Host Machine
$ docker container run  \
    --name app          \
    --rm                \
    --interactive       \
    --tty               \
    docker-practice:app \
    bash
```

Dockerfile の内容が正しく反映されているか、１つずつ確認します。

`FROM` は、OS 情報を確認すれば良いでしょう。
Ubuntu 20.04 になっているはずです。

```:Container
# cat /etc/lsb-release

DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
```

PHP をインストールするための `RUN` は、PHP のバージョンが確認できれば良いでしょう。
PHP 8.0 になっているはずです。

```:Container
# php -v | head -n 1

PHP 8.0.16 (cli) (built: Feb 21 2022 14:42:00) ( NTS )
```

PHP の設定ファイルの `COPY` は、中身を見ればホストマシンと全く同じファイルが存在することを確認できるはずです。

```:Container
# cat /etc/php/8.0/cli/conf.d/mail.ini

[Mail]
sendmail_path = /usr/bin/msmtp -t
```

msmtp をインストールするための `RUN` も、バージョンを確認できれば良いでしょう。

```:Container
# msmtp --version | head -n 1

msmtp version 1.8.6
```

msmtp の設定ファイルの `COPY` は、空ファイルなので存在を確認できれば大丈夫です。

```:Container
# ls /etc/msmtprc

/etc/msmtprc
```

確認できたら `exit` で `bash` を終了します。

## App コンテナの Web サーバの起動
続けてアプリケーションを実行する Web サーバを起動します。

PHP の [ビルトインウェブサーバー](https://www.php.net/manual/ja/features.commandline.webserver.php) について調べると `php -S` で起動できることがわかるので、コンテナを起動する時の命令をこれに変更します。

```:Host Machine
$ docker container run  \
    --name app          \
    --rm                \
    docker-practice:app \
    php -S 0.0.0.0:8000

[Sat Feb 26 13:43:31 2022] PHP 8.0.16 Development Server (http://0.0.0.0:8000) started    
```

結果を目視したい場合は `--detach` オプションは外しておくと良いでしょう。
`Development Server (http://0.0.0.0:8000) started` と確認できたら大丈夫です。

### Web サーバの応答を確認する
まだ **コンテナにブラウザからアクセスできない** ので、**起動している App コンテナに命令する形で** 動作確認をします。

まずは `bash` で接続して HTML ファイルを作成します。

```:Host Machine
$ docker container exec \
    --interactive       \
    --tty               \
    app                 \
    bash

# echo '<h1>Hello World</h1>' > /index.html
```

Web サーバにリクエストを送ると、HTML が返ってくることが確認できます。

```:Container
# curl localhost:8000

<h1>Hello World</h1>
```

今はここまで確認できれば十分です。

## DB コンテナの起動
【 ３部: イメージのビルド 】でビルドした `docker-practice:db` を起動してビルドの結果を確認します。

Ubuntu などの汎用イメージを除き、MySQL や Nginx や Rails のような特定のサービスがセットアップされているイメージは、**基本的にデフォルト命令で起動** します。

また、このイメージをデフォルト命令で起動するとエラーが発生してわかることなのですが、起動する際に環境変数の指定が必要なイメージがまれにあります。^[レイヤーを確認するとデフォルト命令が `ENTRYPOINT` 命令により `docker-entrypoint.sh` になっていて、その Shell で環境変数を確認しています。環境変数を必須にしているのは Docker の機能ではありません。]
こういうエラーを見た場合は [Docker Hub の該当イメージのトップページ](https://hub.docker.com/_/mysql) に行くと、解説が見つかることが多いです。

`Environment Variables` の項に説明があるので、それを参考に次の 4 つを指定します。

変数名                    | 用途                                           | 値                                                 
:--                       | :--                                            | :--                                                
`MYSQL_ROOT_PASSWORD`     | ルートユーザのパスワード                       | 自由に決めて指定する                                               
`MYSQL_USER`<br>( 設定上は任意 )     | 作成するユーザの名前<br>指定すると作成される       | 自由に決めて指定する                                               
`MYSQL_PASSWORD`<br>( 任設定上は任意 ) | 作成するユーザのパスワード<br>指定すると作成される | 自由に決めて指定する<br>ただし `MYSQL_ROOT_PASSWORD` とは別^[別にするのは、学習の過程で明確に２つを使い分けられることを目的とするためであり、イメージの制約ではありません。]
`MYSQL_DATABASE`<br>( 任設定上は任意 ) | データベースの名前<br>指定すると作成される           | `event`

自由となっている部分は自分で決めて、控えておいてください。
この本では上から `rootpassword`, `hoge`, `password`, `event` としますが、自分で決める方がよりよい学びが得られます。

４つの環境変数を `--env` オプションを４つ使って指定しつつ、コンテナをデフォルト命令で起動します。

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

`--detach` オプションは付けていないので、`Ready for start up.` と出力されるはずです。

### MySQL に接続して確認する
PHP の Web サーバを `localhost` で確認したように、**起動している DB コンテナに** 接続して MySQL の確認をします。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    db                   \
    bash
```

続いて `bash` から `mysql` コマンドで MySQL サーバに接続します。
接続オプションは次の通りです。

オプション | 意味           | 値                                                      
:--        | :--            | :--                                                     
`-h`       | ホスト         | `localhost`                                             
`-u`       | ユーザ         | ルートではない、作成したユーザ                          
`-p`       | パスワード     | ルートではない、作成したユーザ<br>空白を開けずに入力する
引数       | データベース名 | 作成したデータベース

整理ができたら接続します。
パスワードを隠さず入力しているので警告が出ますが、ローカル環境のためよしとします。

```:Container
# mysql -h localhost -u hoge -ppassword event

mysql>
```

`hoge/password` で `event` データベースに接続できることが確認できました。

一切の SQL を書かずに `hoge` と `event` が作られたのは **`mysql:5.7` のイメージに含まれる Shell のおかげ** です。

このように、配布されているイメージにはいろいろと便利な拡張がされているものがあります。
Docker も MySQL も知らないとこれらの恩恵を正しく理解して使いこなすのは難しいですが、 **MySQL そのものの機能か Docker の機能か、それとも特定のイメージの機能か** を少しでも意識してみるとだんだんと活用できるようになります。

当然まだテーブルはありません、これは【 ３部: バインドマウント 】で解決します。

```:Container
mysql> show tables;

Empty set (0.00 sec)
```

## Mail コンテナの起動
Mail コンテナも DB コンテナと同様にデフォルト命令のまま起動します。

コンテナを起動すると、SMTP サーバと、送信されたメールを確認するための Web サーバが起動します。

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

`0.0.0.0:1025` と `0.0.0.0:8025` について出力されることが確認できるはずです。

### Web サーバの応答を確認する
まだどこからもメールは送信されないので、Web サーバだけ軽く確認します。
イメージに何も手を加えずにコンテナを起動したので、Web サーバだけ確認すれば十分だと判断します。

今回も **起動している Mail コンテナに** 接続して `curl` で確認します。

が、**このコンテナには `bash` がない** ので `bash` を命令するとエラーになります。
`bash` がない場合は `sh` を使えば大丈夫です。

接続してから `/etc/os-release` を見ると Alpine Linux であることがわかるのですが、軽量であることを重視した Alpine Linux をベースとしたイメージには `curl` はおろか `bash` も入っていない場合が大半です。

また、`sudo` もないため `--user` オプションで `root` として `sh` を起動します。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    --user root          \
    mail                 \
    sh
```

Ubuntu ではないため、`curl` のインストールには `apt` ではなく `apk` を使います。

```:Container
# apk add curl
```

先ほどターミナルで見た `8025` ポートにリクエストして、結果を適当に確認できれば問題ないでしょう。

```:Container
# curl -sS localhost:8025 | grep '<title>'

    <title>MailHog</title>
```

# コンテナが起動しないときは
コンテナが起動しない理由は、大きく分けて２つあります。

1. Docker の状態や操作に不備がある
2. イメージや命令に不備がある

いずれの場合も **ターミナルの出力をよく読む** ことと、**図のどこに不備があるか考える** ことが大切です。

## 1. Docker の操作や状態に不備がある
- e.g. 起動コマンドの文法が間違っている ( 操作が悪い )
- e.g. コンテナ名が衝突してたり、Docker Engine が起動してなかったりする ( 状態が悪い )

これらは **`container run` の出力をよく読めば手がかりを得られます**。

デバッグ時は `--detach` オプションを外して出力を隠さないようにするとよいでしょう。
( `--detach` オプションを付けたまま出力は確認する方法は【 ３部: デバッグノウハウ 】で説明します。)

## 2. イメージや命令に不備がある
- e.g. MySQL の設定ファイルが間違っている ( イメージが悪い )

これも **`container run` の出力をよく読むのが大切** ですが、問題の本質は **Docker とはあまり関係ない** という理解が大切です。
たとえば MySQL の設定ファイルの文字コード `utf8` を `utg8` にミスタイプするとコンテナ起動時にエラーが出ますが、それは **MySQL が出力したエラー** です。

また **イメージが悪い場合でも `image build` が失敗するとは限らない** 点に注意が必要です。
イメージそのものはただの **情報の集まり** であり、そこに含まれている設定ファイルは **正しいか検証されていない** ので、設定の不備はサービスがその設定ファイルを読み **動かしたときにはじめて発覚** します。
現に App コンテナの msmtp の設定は `???` のままですが、App コンテナは起動して Web サーバも動いています。

要約すると `image build` が成功して `container run` が失敗した場合でも、**悪いのは イメージという可能性がある** ということです。

![image](/images/structure/structure.068.jpeg)

安易に `docker mysql 起動しない` などと調べても、`my.cnf` にミスタイプがあるという問題に辿り着くのは難しいでしょう。

慣れるまでは少し難しいですが、問題を **仕込んだタイミング** と **発覚したタイミング** の相関が把握できるようになるためにも、図示して線を書く習慣を身につけましょう。

# まとめ
このページの手順書と成果物は次のブランチで公開されています。

https://github.com/suzuki-hoge/docker-practice/tree/tmp

混乱してしまったときに参考にしてください。

## ポイント
- なんらかの機能がなにに提供されているかを整理すると使いこなしやすい
  - e.g. ビルトインウェブサーバーは PHP
  - e.g. 環境変数で指定したユーザの作成は `mysql5.7` イメージ
- コンテナが起動しないときは、起動コマンドが悪いのかイメージが悪いのかをまず考える
  - 前者であれば、**出力をよくみて** 文法や状態を確認する
  - 後者であれば、**出力をよくみて** イメージを確認する

## できるようになったことの確認
＼ | やること                       | できるようになること                                                                                
:-- | :--                            | :--                                                                                                 
App|イメージをビルド               | ✅　PHP が準備できる<br>✅　メール送信が準備できる
App|👉　コンテナを起動しビルド結果を確認<br>👉　Web サーバを起動                 | ✅　Dockerfile の妥当性が確認できる<br>✅　Web サーバが起動できる                  
App|ソースコードをバインドマウント | ホストマシンの `.php` 編集が即反映される                                                    
App|コンテナのポートを公開         | ブラウザからアクセスできる                                            
App|コンテナをネットワークに接続<br>データベースサーバの接続設定<br>メールサーバの接続設定   | DB コンテナに接続できる<br>Mail コンテナに接続できる
App|Docker Compose 化              | これらを１コマンドで再現できる
DB| イメージをビルド                                                         | ✅　文字コードとログの設定ができる
DB| 👉　環境変数を指定してコンテナを起動                                         | ✅　Dockerfile の妥当性が確認できる<br>✅　MySQL サーバが起動できる<br>✅　ユーザとデータベースを作成できる
DB| データ置場にボリュームをマウント                                 | テーブルがコンテナ削除で消えなくなる                                      
DB| 初期化クエリをバインドマウント                                       | コンテナ起動時にテーブルが作成される                                            
DB| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
DB| Docker Compose 化                                                        | これらを１コマンドで再現できる
Mail| イメージを選定                                                           | ✅　SMTP サーバが起動できる<br>✅　Web サーバが起動できる                                      
Mail| 👉　コンテナを起動                                                           | ✅　Web サーバが起動できる<br>✅　SMTP サーバが起動できる                           
Mail| コンテナのポートを公開                                                   | ブラウザからアクセスできる                            
Mail| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
Mail| Docker Compose 化                                                        | これらを１コマンドで再現できる
ほか| ボリュームを作成                                                        | マウントする準備ができる
ほか| ネットワークを作成                                                        | コンテナを接続する準備ができる

![image](/images/structure/structure.067.jpeg)
