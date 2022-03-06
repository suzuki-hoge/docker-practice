---
title: "３部: デバッグノウハウ"
---

このページでは番外編としてデバッグのノウハウを少し紹介します。

いずれも具体的なエラーを解決するための直接の答えではないのが心苦しいですが、**こういう考え方をすると自分でも対応できそうだ** と活用していただければと思います。

# 現状を調べる
対応の基本は **漠然と全部を見ない** で **仮説を立ててしっかり調べる** ことです。

そのために必要なコマンドをいくつか掲載します。

## 一覧を確認する
`xxx ls` で対象の一覧を確認できます。

- イメージの一覧は `image ls`
- コンテナの一覧は `container ls`
- ボリュームの一覧は `volume ls`
- ネットワークの一覧は `network ls`

## 詳細を確認する
`xxx inspect` で対象の詳細を確認できます。

- イメージの一覧は `image inspect <image>`
- コンテナの一覧は `container inspect <container>`
- ボリュームの一覧は `volume inspect <volume>`
- ネットワークの一覧は `network inspect <network>`

## コンテナの出力を確認する
`--detach` オプションを付けてバックグラウンドで起動したコンテナでも、出力を確認する方法がいくつかあります。

### container logs を使う
`container logs` はターミナルへ出力されるはずだった内容を表示します。

```:新コマンド
$ docker container logs [option] <container>
```

```:Host Machine
$ docker container logs docker-practice-app

[Sun Mar  6 06:38:25 2022] PHP 8.0.16 Development Server (http://0.0.0.0:8000) started
[Sun Mar  6 06:41:45 2022] 172.29.0.1:59192 Accepted
[Sun Mar  6 06:41:45 2022] 172.29.0.1:59192 [200]: GET /form.php
[Sun Mar  6 06:41:45 2022] 172.29.0.1:59192 Closing
[Sun Mar  6 06:42:00 2022] 172.29.0.1:59194 Accepted
[Sun Mar  6 06:42:00 2022] 172.29.0.1:59194 [200]: POST /mail.php
[Sun Mar  6 06:42:00 2022] 172.29.0.1:59194 Closing
[Sun Mar  6 06:42:02 2022] 172.29.0.1:59200 Accepted
[Sun Mar  6 06:42:02 2022] 172.29.0.1:59200 [200]: GET /history.php
[Sun Mar  6 06:42:02 2022] 172.29.0.1:59200 Closing
```

`--follow` もあるので、ほとんど `tail -f` と同じ感覚で使えます。

### Docker Desktop を使う
Docker Desktop の `Containers / Apps` でも同じ情報を確認できます。

![image](/images/docker-desktop-log.png)

## サービスのログを確認する
コンテナの出力とは別に、サーバそのもののログを確認するのも大切です。

たとえばこの本で構築した MySQL データベースは、`docker/db/my.cnf` により `/var/log/mysql/query.log` と `/var/log/mysql/error.log` が出力される設定になっています。

**起動中のコンテナに接続** して、このログをしっかり読みましょう。

```:Host Machine
$ docker container exec --interactive --tty docker-practice-db bash

# tail -n 6 /var/log/mysql/query.log

2022-03-06T06:42:00.694829Z	    2 Connect	hoge@172.29.0.3 on event using TCP/IP
2022-03-06T06:42:00.725785Z	    2 Query	insert into mail (sent_to, subject, body, sent_at, result) values ('hoge@example.com', 'Announce', 'Ready to start Docker Practice!', '03/06 15:42:00', '1')
2022-03-06T06:42:00.763917Z	    2 Quit
2022-03-06T06:42:02.084728Z	    3 Connect	hoge@172.29.0.3 on event using TCP/IP
2022-03-06T06:42:02.089192Z	    3 Query	select * from mail
2022-03-06T06:42:02.110868Z	    3 Quit
```

## コンテナ内を調べる
「直したのに設定が読み込まれていない気がする...」ような場合はさっとコンテナに接続して `COPY` やバインドマウントの結果を **直接確認** してしまいましょう。

```:Host Machine
$ docker container exec docker-practice-db cat /etc/my.cnf

[mysqld]
character_set_server = utg8
collation_server     = utf8_unicode_ci
general_log          = 1
general_log_file     = /var/log/mysql/query.log
log-error            = /var/log/mysql/error.log

[client]
default-character-set = utf8
```

**イメージのビルドを忘れている** とか **レイヤーがキャッシュされていて反映されていなかった** というミスは結構あります。

# 「いつ」「どこ」「なに」を把握に努める
Docker に限った話ではありませんが、**問題はいくつかの角度から把握する** ことが大切です。

上で紹介した現状を調べるコマンドを **どのように考えて使えば良いか** 少し整理してみます。

## 「いつ」不備があったか把握する
【 ３部: コンテナの起動 】で説明した通り、たとえば Dockerfile の不備が `image build` のエラーにつながるとは限りません。

![image](/images/structure/structure.068.jpeg)

次の出力は MySQL の設定ファイルに `utg8` と書いてしまった場合の出力です。

`container run` が失敗したときのエラーから **「いつ」が逆算できる** ように、自分の **操作と現状を図示する習慣** をつけましょう。

```:Host Machine
$ docker container logs --follow docker-practice-db

2022-03-06 09:09:11+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.36-1debian10 started.
2022-03-06 09:09:11+00:00 [ERROR] [Entrypoint]: mysqld failed while attempting to check config
	command was: mysqld --verbose --help --log-bin-index=/tmp/tmp.rd1KGvB5KZ
	mysqld: Character set 'utg8' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
mysqld: Character set 'utg8' is not a compiled character set and is not specified in the '/usr/share/mysql/charsets/Index.xml' file
```

**いつ** が把握できないと、**不備のある操作が特定できません**。

## 「どこ」でエラーが発生したか把握する
さきほどの `utg8` についてのエラーは **コンテナ内で発生しています**。

対して次の出力では `ubuntu1` というコンテナ名が衝突したというエラーが **ホストマシン で発生しています**。

```:Host Machine
$ docker container run --name ubuntu1 --interactive --tty ubuntu bash

docker: Error response from daemon: Conflict.
The container name "/ubuntu1" is already in use by container "d72dadxxxxxxx".
You have to remove (or rename) that container to be able to reuse that name.
See 'docker run --help'.
```

**どこ** が把握できないと、**ログを探す場所や補正コマンドを実行する場所が判断できません**。

## 「なに」が直接のエラーを発生させたか把握する
**いつ** と **どこ** を冷静に分析すると、**なに** が直接のエラーを発生させたかわかるはずです。

たとえば `utg8` のエラーは **`image build` 時** に不正な設定ファイルを配置してしまい **MySQL がエラー** を出しているので、**MySQL の設定ファイルを修正してイメージを再ビルド** します。

たとえば `ubuntu1` 衝突のエラーは **`container run` 時** に状態が不正で **Docker がエラー** を出しているので、**ホストマシンでコンテナを整理してコンテナ起動を再実行** します。

**なに** が把握できないと、**具体的なアプローチが決まりません**。

# 疑う範囲を小さくする
エラー発生時に一瞬で「いつ」「どこ」「なに」を即断するのはかなりの経験が必要ですが、**問題ない点を少しずつ確定していくことで着実に絞り込むことは可能** です。

## 一手目
たとえば `Mail History` ページが閲覧できないとします。

![image](/images/demo-no-db-error.png)

その情報だけでは疑わしい点はたくさんあります。

- App コンテナが起動していない
- App コンテナは起動しているが、Web サーバが起動していない
- Web サーバは起動しているが、データベースの接続設定が間違っている
- データベースの接続設定は正しいが DB コンテナが起動していない
- App コンテナも DB コンテナも正しく起動しているが、同じネットワークに接続していない

## 二手目
しかしアプリケーションのトップページは開けることがわかりました。

![image](/images/demo-top.png)

この時点で次は **問題ないと確定して候補から外せます**。

- ~~App コンテナが起動していない~~
- ~~App コンテナは起動しているが、Web サーバが起動していない~~
- Web サーバは起動しているが、データベースの接続設定が間違っている
- データベースの接続設定は正しいが DB コンテナが起動していない
- App コンテナも DB コンテナも正しく起動しているが、同じネットワークに接続していない

## 三手目
次に `ping` を使ったり `network inspect` や `container inspect` を使ったりして App コンテナから DB コンテナには通信できることがわかりました。

この時点で **さらに候補からいくつかを外せます**。

- ~~App コンテナが起動していない~~
- ~~App コンテナは起動しているが、Web サーバが起動していない~~
- Web サーバは起動しているが、データベースの接続設定が間違っている
- ~~データベースの接続設定は正しいが DB コンテナが起動していない~~
- ~~App コンテナも DB コンテナも正しく起動しているが、同じネットワークに接続していない~~

## 検証
**残った仮説を検証する** には、**`container logs` による PHP のログ確認** と **`container exec` による `.php` の確認** を行います。

このように **仮説の列挙と数手の操作だけ** で漠然とした「やばいエラーでたどうしようなんもわからん」を **「いつ」「どこ」「なに」の把握に近づける** ことができます。

エラー調査の速い人はこういう **仮説の整理と事実の調査を交互にしっかりやっているから速い** のであり、勘や運でやっているわけではありません。
できるようになるには地道な努力あるのみです。

以前書いたこちらの記事も参考にして、ぜひ習慣化してください。

https://zenn.dev/suzuki_hoge/articles/2020-11-logical-debugging-e46a81aa4eb61e0caa5e

# なんの知識が必要な場面か把握する
これは Docker ならではのポイントかなと思いますが、**なんらかの対応をするときに必要になるのが Docker の知識とは限らない** ことがよくあります。

たとえば Dockerfile で PHP のインストールを行いますが、**必要となる知識はほぼ Ubuntu と PHP** の知識です。

たとえば MySQL データベースの呼び出しでエラーが発生したときに、**接続エラーであれば Docker のネットワーク** などを確認しますが **文法エラーであれば MySQL** について調べます。

安易に `docker php install` や `docker mysql connection error` と調べてもあまり効果はありません、しっかり **なに** を捉えるのが確実に近道です。

# 変更が反映されるタイミングを把握する
最後にありがちなはまりどころとして、**変更が反映されるタイミング** について整理します。

`COPY` とバインドマウントについては何度か説明した通りですが、それぞれ **変更されるタイミングが違います**。

`COPY`

![image](/images/structure/structure.090.jpeg)

バインドマウント

![image](/images/structure/structure.083.jpeg)

単純に **ファイルを変更しても `image build` を行っていない** というケースを見かけます。
気付いて自力で解決するためにはしっかりと **`container exec` を使って現状を調べましょう**。

もう少し複雑なケースで、**コンテナにはファイルの変更が反映されているけど Web サーバがそれを認識していない** というケースも見かけます。

この本で使った PHP のビルトインウェブサーバーや Node.js の開発モードなどは、**サーバがファイルを監視しているので変更を自動で読み取ってくれます**。

![image](/images/structure/structure.084.jpeg)

しかしたとえばコンパイルして `.jar` を作らないといけないとか Node.js の本番モードなど、**ファイルの変更だけではサーバに反映されない** ケースもあります。

![image](/images/structure/structure.085.jpeg)

これはもうケースバイケースとしか言いようがないので、**自力でロジカルに調べられる力** が大切になるのです。

# まとめ
長くなってしまったので要約します。

- **現状を調べる方法** を知っておこう
  - **一覧** は `ls` で
  - **詳細** は `inspect` で
  - **コンテナのログ** は `container logs` で
  - **サービスのログ** は `container exec` で
  - **コンテナの中身** も `container exec` で
- 「いつ」「どこ」「なに」の把握に努めよう  
  - 「いつ」が把握できないと、**不備のある操作が特定できない**
  - 「どこ」が把握できないと、**調査や修正を行う場所が特定できない**
  - 「なに」が把握できないと、**具体的なアプローチが決まらない**
- **仮説の整理** と **事実の調査** を行い、**疑う範囲を絞ろう**
- 安易に検索ワードに `docker` をつけず、**なに** を調べるか考えるのが解決への近道
- 変更が反映されるタイミングを理解しよう

この本のエラーを解決する直接のトラブルシューティングはどうしても作り切ることができないため、抽象的な内容が多くなってしまいましたが、この **考え方** を役立てていただければと思います。
