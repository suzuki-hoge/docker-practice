---
title: "３部: ネットワーク"
---

構築の最後はコンテナ同士が通信できるように Docker のネットワークの使い方を学びます。
Linux におけるネットワークや Docker のネットワークの仕組みには踏み込みすぎず、最低限の基礎知識と利用方法に絞って身につけることを目指します。

これが終われば残すは Docker Compose のみとなり、実質の構築は終わりです。

# 全体構成とハイライト
![image](/images/structure/structure.089.jpeg)

## やることの確認
＼ | やること                       | できるようになること                                                                                
:-- | :--                            | :--                                                                                                 
App|イメージをビルド               | ✅　PHP が準備できる<br>✅　メール送信が準備できる
App|コンテナを起動しビルド結果を確認<br>Web サーバを起動                 | ✅　Dockerfile の妥当性が確認できる<br>✅　Web サーバが起動できる                  
App|ソースコードをバインドマウント | ✅　ホストマシンの `.php` 編集が即反映される                                                    
App|コンテナのポートを公開         | ✅　ブラウザからアクセスできる                                            
App|👉　コンテナをネットワークに接続<br>👉　データベースサーバの接続設定<br>👉　メールサーバの接続設定   | DB コンテナに接続できる<br>Mail コンテナに接続できる
App|Docker Compose 化              | これらを１コマンドで再現できる
DB| イメージをビルド                                                         | ✅　文字コードとログの設定ができる
DB| 環境変数を指定してコンテナを起動                                         | ✅　Dockerfile の妥当性が確認できる<br>✅　MySQL サーバが起動できる<br>✅　ユーザとデータベースを作成できる
DB| データ置場にボリュームをマウント                                 | ✅　テーブルがコンテナ削除で消えなくなる                                      
DB| 初期化クエリをバインドマウント                                       | ✅　コンテナ起動時にテーブルが作成される                                            
DB| 👉　コンテナをネットワークに接続<br>👉　コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
DB| Docker Compose 化                                                        | これらを１コマンドで再現できる
Mail| イメージを選定                                                           | ✅　SMTP サーバが起動できる<br>✅　Web サーバが起動できる                                      
Mail| コンテナを起動                                                           | ✅　Web サーバが起動できる<br>✅　SMTP サーバが起動できる                           
Mail| コンテナのポートを公開                                                   | ✅　ブラウザからアクセスできる                            
Mail| 👉　コンテナをネットワークに接続<br>👉　コンテナにエイリアスを設定 | App コンテナからホスト名で接続できる                                            
Mail| Docker Compose 化                                                        | これらを１コマンドで再現できる
ほか| ボリュームを作成                                                        | ✅　マウントする準備ができる
ほか| 👉　ネットワークを作成                                                        | コンテナを接続する準備ができる

# このページで初登場する構築のコマンドとオプション
## ネットワークを作成する - network create
```:コマンド
$ docker network create [option] name
```

## コンテナを起動する - container run
オプション | 意味 | 用途  
:-- | :-- | :--
`--network`   | コンテナをネットワークに接続 | 他のコンテナと通信できるようにする
`--network-alias`   | コンテナにネットワーク内での<br>エイリアスを設定   | 他のコンテナから指定しやすくする

# Docker のネットワークについて
## ネットワークドライバ
Docker のコンテナは、デフォルトで数種類用意されているネットワークドライバというものによりネットワークに接続されます。

たとえばブリッジネットワークにはこのような特徴があります。

- ネットワークドライバを特に指定しなかった場合の **デフォルト** である
- **同一の** Docker Engine 上のコンテナが互いに通信をする場合に利用する

オーバーレイネットワークにはこのような特徴があります。

- **異なる** Docker Engine 上のコンテナが互いに通信をする場合に利用する

ローカル開発では当然 Docker Engine が複数になることはないため、この本ではブリッジネットワークに絞って学ぶことにします。

![image](/images/picture/picture.024.jpeg)

## ユーザ定義ブリッジネットワーク
コンテナを起動する際にネットワークドライバについて一切の指定を行わないと、デフォルトブリッジネットワークが自動的に生成され、コンテナはこのネットワークに接続されます。

このデフォルトブリッジネットワークには次のような特徴があります。

1. コンテナが通信するためには、全てのコンテナ間をリンクする操作が必要になる
1. コンテナ間の通信は IP アドレスで行う
1. 別プロジェクトのコンテナに接続できてしまう

![image](/images/picture/picture.025.jpeg)

これに対し、自分でブリッジネットワークを作成すると、デフォルトネットワークと比べて次のような利点のあるネットワークに接続できます。

1. 相互通信をできるようにするには同じネットワークを割り当てるだけでよい  
1. コンテナ間で自動的に DNS 解決を行える
1. 通信できるコンテナが同一ネットワーク上のコンテナに限られ、隔離度があがる

![image](/images/picture/picture.026.jpeg)

「コンパイルをして欲しい」「テストをして欲しい」「静的コンテンツをホスティングしてブラウザから見たい」のような **コンテナ間通信を必要としない場合はデフォルトブリッジネットワークで十分** ですが、「PHP から MySQL を使う」のような **コンテナ間通信を必要とする場合はユーザ定義ブリッジネットワークを使う** と判断してよいでしょう。

:::message
このページで扱っているネットワークという単語は **Docker のネットワーク** を指しています。
「コンパイルに必要なライブラリをダウンロードするためにインターネットに出ていきたい」のようなはなしではありません。
それは今までコンテナ内での `apt install` などが通っていることからも、問題になることはありません。
:::

# 構築
## ユーザ定義ネットワークを作成する
ネットワークの作成は、次のコマンドで行います。

```:コマンド
$ docker network create [option] <name>
```

この本では特に `[option]` は指定せず、`docker-practice-network` という名前のネットワークを作ります。

```:Host Machine
$ docker network create \
    docker-practice-network

b1a6a93a2277ff8dfee537c174315f10daabdd807319b1eba25a287f954d2369 
```

作成はこれだけです。

これでコンテナをネットワークに接続する準備ができました。

### 作成できたことを確認する
ネットワーク一覧を確認するには、 `network ls` を使います。

```:Host Machine
$ docker network ls

NETWORK ID     NAME                      DRIVER    SCOPE
0edfc31a4369   bridge                    bridge    local
959366d438e3   docker-practice-network   bridge    local
ec6642979247   host                      host      local
34ab35cb2a65   none                      null      local
```

`bridge` と `host` と `none` はデフォルトの必ず存在するネットワークで、それに加えて１つの `bridge` ドライバの `docker-practice-network` があることを確認できます。

## App コンテナをネットワークに接続する
ボリュームのときと同様に、作成したネットワークにコンテナを接続するには `container run` のオプションを追加します。

`--network` で作成した `docker-practice-network` を指定するようにコマンドを修正します。

```:Host Machine
$ docker container run                        \
    --name app                                \
    --rm                                      \
    --detach                                  \
    --mount type=bind,src=$(pwd)/src,dst=/src \
    --publish 18000:8000                      \
    --network docker-practice-network         \
    docker-practice:app                       \
    php -S 0.0.0.0:8000 -t /src
```

接続もこれだけです。

これで App コンテナがほかのコンテナに接続する準備ができました。

### コンテナがネットワークに接続できたことを確認する
コンテナがネットワークに接続できているか確認するには、ネットワークを検査する `network inspect` コマンドとコンテナを検査する `container inspect` コマンドを使います。

まずネットワークを検査してみると、ネットワークの `Subnet` は `172.26.0.0/16` で `Gateway` は `172.26.0.1` となっています。
( 毎回同じ IP アドレスになるとは限りません )

```:Host Machine
$ docker network inspect docker-practice-network | jq '.[].IPAM.Config'
[
  {
    "Subnet": "172.26.0.0/16",
    "Gateway": "172.26.0.1"
  }
]
```

次にコンテナの検査をしてみると、`Networks` に `docker-practice-network` が設定されており、`IPAddress` が `172.26.0.2` になっています。

```:Host Machine
$ docker container inspect app | jq '.[].NetworkSettings.Networks'
{
  "docker-practice-network": {
    "IPAMConfig": null,
    "Links": null,
    "Aliases": [
      "0951c85d839e"
    ],
    "NetworkID": "a6645297673d9588c82139b6e77d48e876c7fee36d6bef312d691c6ee5c37465",
    "EndpointID": "7e09aa35e771f0554ac4e253f399c9852ded3b4c5ef3cfd67c04c803e1e0474f",
    "Gateway": "172.26.0.1",
    "IPAddress": "172.26.0.2",
    "IPPrefixLen": 16,
    "IPv6Gateway": "",
    "GlobalIPv6Address": "",
    "GlobalIPv6PrefixLen": 0,
    "MacAddress": "02:42:ac:1a:00:02",
    "DriverOpts": null
  }
}
```

ネットワークの `Gateway` とコンテナの `Gateway` が一致していて、コンテナの `IPAddress` がそれに続く値になっていれば、ちゃんと設定できています。

## DB コンテナをネットワークに接続し、エイリアスを設定する
App コンテナだけネットワークに接続しても意味はないので、DB コンテナもネットワークに接続します。

当然接続するネットワークは App コンテナと同じ `docker-practice-network` です。

また、App コンテナから DB コンテナにアクセスする時に使うホスト名を `--network-alias` オプションを使って **DB コンテナに** 設定します。

```:Host Machine
$ docker container run                                                                       \
    --name db                                                                                \
    --rm                                                                                     \
    --detach                                                                                 \
    --platform linux/amd64                                                                   \
    --env MYSQL_ROOT_PASSWORD=rootpassword                                                   \
    --env MYSQL_USER=hoge                                                                    \
    --env MYSQL_PASSWORD=password                                                            \
    --env MYSQL_DATABASE=event                                                               \
    --mount type=volume,src=docker-practice-db-volume,dst=/var/lib/mysql                     \
    --mount type=bind,src=$(pwd)/docker/db/init.sql,dst=/docker-entrypoint-initdb.d/init.sql \
    --network docker-practice-network                                                        \
    --network-alias db                                                                       \
    docker-practice:db
```

これで DB コンテナがほかのコンテナから `db` というホスト名で接続される準備ができました。

### 設定できたことを確認する
同じく確認には `network inspect` と `container inspect` を使います。

ネットワークとコンテナの `Gateway` が一致しているか、コンテナの `IPAddress` が妥当か、確認してみてください。

```:Host Machine
$ docker container inspect db | jq '.[].NetworkSettings.Networks'
{
  "docker-practice-network": {
    "IPAMConfig": null,
    "Links": null,
    "Aliases": [
      "db",
      "9eb844b3aaa2"
    ],
    "NetworkID": "a6645297673d9588c82139b6e77d48e876c7fee36d6bef312d691c6ee5c37465",
    "EndpointID": "a50e15edd620708eb19efc7d831832baf4a62e4a43fd81cedd8b437eee592ff4",
    "Gateway": "172.26.0.1",
    "IPAddress": "172.26.0.3",
    "IPPrefixLen": 16,
    "IPv6Gateway": "",
    "GlobalIPv6Address": "",
    "GlobalIPv6PrefixLen": 0,
    "MacAddress": "02:42:ac:1a:00:03",
    "DriverOpts": null
  }
}
```

また、DB コンテナにはエイリアスを設定したので `Networks` の `Aliases` に `db` が増えていることが確認できるはずです。

`--network` オプションを正しく設定できたかは `Gateway` と `IPAddress` を、`--network-alias` オプションを正しく設定できたかは `Aliases` を、それぞれ確認できれば大丈夫です。

## Mail コンテナをネットワークに接続し、エイリアスを設定する
Mail コンテナも DB コンテナと同様に設定します。

`--network` オプションと `--network-alias` オプションを追加して、コマンドは次のようになります。

```:Host Machine
$ docker container run                \
    --name mail                       \
    --rm                              \
    --detach                          \
    --platform linux/amd64            \
    --publish 18025:8025              \
    --network docker-practice-network \
    --network-alias mail              \
    mailhog/mailhog:v1.0.1
```

Mail コンテナの検査をして、`Gateway` と `IPAddress` と `Aliases` がそれぞれ妥当か確認してみてください。

問題なければ、Mail コンテナもほかのコンテナから `mail` というホスト名で接続される準備ができています。

### App コンテナから DB / Mail コンテナへ通信できることを確認する
App コンテナからほかコンテナへの接続設定をするまえに、まずは App コンテナが DB コンテナに通信ができるか `ping` を使って確認します。

```:Host Machine
$ docker container exec \
    --interactive       \
    --tty               \
    app                 \
    ping db -c 3

PING db (172.26.0.3) 56(84) bytes of data.
64 bytes from db.docker-practice-network (172.26.0.3): icmp_seq=1 ttl=64 time=4.12 ms
64 bytes from db.docker-practice-network (172.26.0.3): icmp_seq=2 ttl=64 time=0.541 ms
64 bytes from db.docker-practice-network (172.26.0.3): icmp_seq=3 ttl=64 time=0.298 ms

--- db ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2023ms
rtt min/avg/max/mdev = 0.298/1.652/4.117/1.745 ms
```

`db` というホストに３回リクエストを投げると、それら全てが `172.26.0.3` 向けて送られ `0% packet loss` という結果になれば問題ありません。

Mail コンテナに対しても同じく成功するはずなので、確認してみてください。

## App コンテナから DB コンテナへの接続設定をする
３つのコンテナが同じネットワークに接続されホスト名で通信できることも確認できたので、App コンテナから MySQL データベースサーバへ接続するための設定を行います。

App コンテナは PHP アプリケーションから MySQL データベースサーバに接続するため、設定は `.php` で行います。

**`.php` はバインドマウントしてありホストマシンの編集は App コンテナ内に即時反映されるようになっている** ので、ホストマシンの好みのエディタで編集することができます。

`history.php` と `mail.php` から次の記述を探してください。
`???` の部分を全て埋め、MySQL に接続できるようにします。

```php:history.php | mail.php
$host = '???';
$port = '???';
$database = '???';
$dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

$username = '???';
$password = '???';
```

今までの設定を手繰り寄せると、それぞれ次のように決まります。

- `$host` は DB コンテナに `--network-alias` オプションで設定した `db`
- `$port` は特に設定していないので MySQL 標準の `3306`
- `$database` は DB コンテナを起動する時に`--env` オプションで指定した `event`
- `$username` と `$password` も DB コンテナに `--env` オプションで指定した `hoge` と `password`

以上を踏まえて、次の通り修正します。
２ファイルあるので２箇所修正してください。

```php:history.php | mail.php
$host = 'db';
$port = '3306';
$database = 'event';
$dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

$username = 'hoge';
$password = 'password';
```

**バインドマウントにより** 編集結果は App コンテナにも反映されているので、特に **コンテナの再起動などは不要** です。

### App コンテナが MySQL データベースサーバにアクセスできていることを確認する
http://localhost:18000/history.php を開き画面が表示されれば大丈夫です。

![image](/images/demo-no-history.png)

それから `Mail Send` に遷移してメール送信をしてみましょう。
まだメールサーバに接続する設定をしていないため、メール送信には失敗します。

![image](/images/demo-form-2.png)

![image](/images/demo-mail-send-failed.png)

送信には失敗しましたが、`Mail History` でその履歴が確認できれば DB コンテナとの接続はちゃんと成功しています。

![image](/images/demo-mail-error-history.png)

## App コンテナから Mail コンテナへの接続設定をする
最後に App コンテナからメールサーバに接続するための設定を行います。

App コンテナは msmtp を使いメールサーバに接続するため、設定は `mailrc` で行います。

**`mailrc` は Dockerfile で `COPY` したファイルなので編集したらイメージの再ビルドが必要** です。
コンテナ内のファイルを編集しても、その編集はそのコンテナに限られるためです。

![image](/images/structure/structure.090.jpeg)

`mailrc` を開いて `???` の部分を埋めます。

```txt:docker/app/mailrc
account default
host ???
port ???
from "service@d-prac.mock"
```

今までの設定を手繰り寄せると、それぞれ次のように決まります。

- `host` は Mail コンテナに `--network-alias` オプションで設定した `mail`
- `port` は MailHog のマニュアルや起動メッセージで確認できる SMTP サーバの `1025`

以上を踏まえて、次の通り修正します。

```txt:docker/app/mailrc
account default
host mail
port 1025
from "service@d-prac.mock"
```

イメージの再ビルドをして、コンテナの終了と起動を行います。

```:Host Machine
$ docker image build             \
    --tag docker-practice:app    \
    --file docker/app/Dockerfile \
    .

$ docker container stop \
    app

$ docker container run                        \
    --name app                                \
    --rm                                      \
    --detach                                  \
    --mount type=bind,src=$(pwd)/src,dst=/src \
    --publish 18000:8000                      \
    --network docker-practice-network         \
    docker-practice:app                       \
    php -S 0.0.0.0:8000 -t /src    
```

### App コンテナがメールサーバにアクセスできていることを確認する
http://localhost:18000/form.php を開き、メールが送信できれば大丈夫です。

![image](/images/demo-form-2.png)

![image](/images/demo-result.png)

![image](/images/demo-error-and-success-history.png)

# 完成
これで全ての構築が完了しました。

一通り操作して問題がなさそうであれば、仕上げの Docker Compose を残すのみです。

問題がある場合は、これまでの内容をよく整理して原因調査をしなければなりません。
【 ３部: デバッグノウハウ 】を活用して対処してみてください。

# まとめ
このページの手順書と成果物は次のブランチで公開されています。

https://github.com/suzuki-hoge/docker-practice/tree/tmp

混乱してしまったときに参考にしてください。

## ポイント
- コンテナ同士で通信したい時は **自分でネットワークを作る**
- **同じネットワーク** に接続したコンテナ同士なら通信できる
- **エイリアス** を設定すると **ホスト名** で通信できる

## できるようになったことの確認
![image](/images/structure/structure.089.jpeg)

＼ | やること                       | できるようになること                                                                                
:-- | :--                            | :--                                                                                                 
App|イメージをビルド               | ✅　PHP が準備できる<br>✅　メール送信が準備できる
App|コンテナを起動しビルド結果を確認<br>Web サーバを起動                 | ✅　Dockerfile の妥当性が確認できる<br>✅　Web サーバが起動できる                  
App|ソースコードをバインドマウント | ✅　ホストマシンの `.php` 編集が即反映される                                                    
App|コンテナのポートを公開         | ✅　ブラウザからアクセスできる                                            
App|👉　コンテナをネットワークに接続<br>👉　データベースサーバの接続設定<br>👉　メールサーバの接続設定   | ✅　DB コンテナに接続できる<br>✅　Mail コンテナに接続できる
App|Docker Compose 化              | これらを１コマンドで再現できる
DB| イメージをビルド                                                         | ✅　文字コードとログの設定ができる
DB| 環境変数を指定してコンテナを起動                                         | ✅　Dockerfile の妥当性が確認できる<br>✅　MySQL サーバが起動できる<br>✅　ユーザとデータベースを作成できる
DB| データ置場にボリュームをマウント                                 | ✅　テーブルがコンテナ削除で消えなくなる                                      
DB| 初期化クエリをバインドマウント                                       | ✅　コンテナ起動時にテーブルが作成される                                            
DB| 👉　コンテナをネットワークに接続<br>👉　コンテナにエイリアスを設定 | ✅　App コンテナからホスト名で接続できる                                            
DB| Docker Compose 化                                                        | これらを１コマンドで再現できる
Mail| イメージを選定                                                           | ✅　SMTP サーバが起動できる<br>✅　Web サーバが起動できる                                      
Mail| コンテナを起動                                                           | ✅　Web サーバが起動できる<br>✅　SMTP サーバが起動できる                           
Mail| コンテナのポートを公開                                                   | ✅　ブラウザからアクセスできる                            
Mail| 👉　コンテナをネットワークに接続<br>👉　コンテナにエイリアスを設定 | ✅　App コンテナからホスト名で接続できる                                            
Mail| Docker Compose 化                                                        | これらを１コマンドで再現できる
ほか| ボリュームを作成                                                        | ✅　マウントする準備ができる
ほか| 👉　ネットワークを作成                                                        | ✅　コンテナを接続する準備ができる
