---
title: "３部: ネットワーク"
---

構築作業の最後はコンテナ同士が通信できるようにネットワークを学びます。

これが終われば残すは Docker Compose のみとなり、実質の構築は終わりです。

![image](/images/structure/structure.085.jpeg)

# このページでやること
- ネットワークの作成
- DB コンテナ
  - 作成したネットワークにコンテナを接続する
- Mail コンテナ
  - 作成したネットワークにコンテナを接続する
- App コンテナ
  - 作成したネットワークにコンテナを接続する
  - DB コンテナへの接続設定をする
  - Mail コンテナへの接続設定をする

# このページで初登場するコマンドとオプション
## ネットワークを作成する
```:コマンド
$ docker network create [option] name
```

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
`--network`   | コンテナをネットワークに接続 | 他のコンテナと同じネットワークに入れる
`--network-alias`   | コンテナにネットワーク内でのエイリアスを設定   | 他のコンテナから指定しやすくする

# コンテナのネットワークについて
bridge

# ネットワークの作成
ネットワークを使うには、まずはネットワークの作成を行います。

```:コマンド
$ docker network create [option] <name>
```

この本では特に `[option]` は指定せず、１つだけ `docker-practice-network` という名前のネットワークを作ります。

```:Host Machine
$ docker network create \
    docker-practice-network

b1a6a93a2277ff8dfee537c174315f10daabdd807319b1eba25a287f954d2369 
```

作成はこれだけです。
ネットワーク一覧を確認してみたい方は `docker network ls` を実行してみてください。

# コンテナをネットワークに接続する
## IP アドレスを割り当てる
ボリュームのときと同様に、作成したネットワークにコンテナを接続するには `docker container run` のオプションを追加します。

`--network` で先ほど作成した `docker-practice-network` を指定するようにコマンドを修正します。

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

$
```

これでネットワークに接続できているかは、ネットワークとコンテナを検査してみればわかります。

ネットワークの検査は `docker network inspect` で、コンテナの検査は `docker container inspect` で行います。

ネットワークの `Subnet` は `172.20.0.0/16` で `Gateway` は `172.20.0.1` となっています。

```:Host Machine
$ docker network inspect docker-practice-network | jq '.[].IPAM.Config'
[
  {
    "Subnet": "172.20.0.0/16",
    "Gateway": "172.20.0.1"
  }
]
```

コンテナの `Networks` には `docker-practice-network` が設定されており、`IPAddress` が `172.20.0.2` になっています。

```:Host Machine
$ docker inspect app | jq '.[].NetworkSettings.Networks'
{
  "docker-practice-network": {
    "IPAMConfig": null,
    "Links": null,
    "Aliases": [
      "bf4f3a61d7a9"
    ],
    "NetworkID": "b1a6a93a2277ff8dfee537c174315f10daabdd807319b1eba25a287f954d2369",
    "EndpointID": "038037dfc407241837ddef010424411d73e8bc7ec449445348f9d605b90678c7",
    "Gateway": "172.20.0.1",
    "IPAddress": "172.20.0.2",
    "IPPrefixLen": 16,
    "IPv6Gateway": "",
    "GlobalIPv6Address": "",
    "GlobalIPv6PrefixLen": 0,
    "MacAddress": "02:42:ac:14:00:02",
    "DriverOpts": null
  }
}
```

これで **App コンテナに他のコンテナから接続する準備ができました**。

１コンテナだけネットワークに接続しても意味はないので、Mail コンテナもネットワークに接続します。

当然接続するネットワークは同じ `docker-practice-network` です。

```:Host Machine
$ docker container run                \
    --name mail                       \
    --rm                              \
    --detach                          \
    --platform linux/amd64            \
    --publish 18025:8025              \
    --network docker-practice-network \
    mailhog/mailhog:v1.0.1
```

Mail コンテナの `IPAddress` は `172.20.0.3` になったようです。

```:Host Machine
$ docker inspect mail | jq '.[].NetworkSettings.Networks'
{
  "docker-practice-network": {
    "IPAMConfig": null,
    "Links": null,
    "Aliases": [
      "aaeb06fbef9e"
    ],
    "NetworkID": "b1a6a93a2277ff8dfee537c174315f10daabdd807319b1eba25a287f954d2369",
    "EndpointID": "3e24a4032cbc9aa114d3ce81a4b632e98b96b985194a7bb9421d4375a35f9393",
    "Gateway": "172.20.0.1",
    "IPAddress": "172.20.0.3",
    "IPPrefixLen": 16,
    "IPv6Gateway": "",
    "GlobalIPv6Address": "",
    "GlobalIPv6PrefixLen": 0,
    "MacAddress": "02:42:ac:14:00:03",
    "DriverOpts": null
  }
}
```

App コンテナから Mail コンテナに向かって `ping` をしたいので、App コンテナに接続します。

```:Host Machine
$ docker container exec  \
    --interactive        \
    --tty                \
    app                  \
    bash
    
# apt install iputils-ping
```

`ping` を実行すると、ちゃんと疎通できていることが確認できます。

```:Container
# ping 172.20.0.3 -c 3

PING 172.20.0.3 (172.20.0.3) 56(84) bytes of data.
64 bytes from 172.20.0.3: icmp_seq=1 ttl=64 time=0.852 ms
64 bytes from 172.20.0.3: icmp_seq=2 ttl=64 time=0.369 ms
64 bytes from 172.20.0.3: icmp_seq=3 ttl=64 time=0.239 ms

--- 172.20.0.3 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2021ms
rtt min/avg/max/mdev = 0.239/0.486/0.852/0.263 ms
```

## エイリアスを割り当てる
コンテナ同士が通信できるようになりましたが、IP アドレスで通信するのは使い勝手が悪いです。
コンテナの起動順が変わったり数が変わったりしたらずれてしまうかもしれませんし、単純に調べるのが面倒です。

これを解決するために、**コンテナにネットワークの中でのエイリアスを設定** できます。

Mail コンテナを一度停止して、`--network-alias` を追加して起動します。

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

もう一度コンテナを検査してみると、`Aliases` に `mail` が増えていることが確認できます。

```:Host Machine
$ docker inspect mail | jq '.[].NetworkSettings.Networks'
{
  "docker-practice-network": {
    "IPAMConfig": null,
    "Links": null,
    "Aliases": [
      "mail",
      "90326e709303"
    ],
    "NetworkID": "b1a6a93a2277ff8dfee537c174315f10daabdd807319b1eba25a287f954d2369",
    "EndpointID": "3c55ffdac4b6074e6164b2ae2575920351278494f653f98a7b24fe525bf41433",
    "Gateway": "172.20.0.1",
    "IPAddress": "172.20.0.3",
    "IPPrefixLen": 16,
    "IPv6Gateway": "",
    "GlobalIPv6Address": "",
    "GlobalIPv6PrefixLen": 0,
    "MacAddress": "02:42:ac:14:00:03",
    "DriverOpts": null
  }
}
```

App コンテナから `ping` すると、ちゃんと IP アドレスを解決できていることが確認できます。

同じネットワークに接続しているほかのコンテナからは、**IP アドレスではなくエイリアスで接続できます**。

```:Container
# ping mail -c 3

PING mail (172.20.0.3) 56(84) bytes of data.
64 bytes from mail.docker-practice-network (172.20.0.3): icmp_seq=1 ttl=64 time=0.738 ms
64 bytes from mail.docker-practice-network (172.20.0.3): icmp_seq=2 ttl=64 time=0.340 ms
64 bytes from mail.docker-practice-network (172.20.0.3): icmp_seq=3 ttl=64 time=0.221 ms

--- mail ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2034ms
rtt min/avg/max/mdev = 0.221/0.433/0.738/0.221 ms
```

# Mail コンテナのネットワークを設定する
## 起動コマンドの修正
Mail コンテナはエイリアスの例で試した通りなので、再掲するのみとします。

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

# DB コンテナのネットワークを設定する
## 起動コマンドの修正
DB コンテナも、同じネットワークに接続させるのと、エイリアスを設定するだけです。

```:Host Machine
$ docker container run                                                   \
    --name db                                                            \
    --rm                                                                 \
    --detach                                                             \
    --platform linux/amd64                                               \
    --env MYSQL_ROOT_PASSWORD=rootpassword                               \
    --env MYSQL_USER=hoge                                                \
    --env MYSQL_PASSWORD=password                                        \
    --env MYSQL_DATABASE=event                                           \
    --mount type=volume,src=docker-practice-db-volume,dst=/var/lib/mysql \
    --network docker-practice-network                                    \
    --network-alias db                                                   \
    docker-practice:db
```

# App コンテナのネットワークを設定する
## 起動コマンドの修正
App コンテナは、IP アドレスを割り当てる例で試した通りです。
ほかのコンテナから接続するつもりはないので、**App コンテナにエイリアスを割り当てる必要はありません**。

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

## Mail コンテナへの接続設定
[３部]() で解決できなかった App コンテナのメールサーバの設定を行います。

Dockerfile で `COPY` している設定ファイルの空欄を埋めます。

```Dockerfile:docker/app/Dockerfile
COPY ./docker/app/mailrc /etc/msmtprc
```

```txt:docker/app/mailrc
account default
host ???
port ???
from "service@d-prac.mock"
```

エイリアスを設定したのでホスト名は `mail` です。

Mail コンテナには `1025` と `8025` と `18025` というポートが関係していますが、SMTP サーバのポートは `1025` です。
図と正しく把握できていれば `18025` は関係ないことがすぐにわかりますし、そこから `8025` が HTTP サーバだということもわかるはずです。
また、コンテナ同士で通信するときは **ポートの公開は不要** です。

以上を踏まえて、次の通り修正します。

```txt:docker/app/mailrc
account default
host mail
port 1025
from "service@d-prac.mock"
```

**Dockerfile で `COPY` するファイルを変更したので、イメージの再ビルドが必要** です。

```:Host Machine
$ docker image build             \
    --tag docker-practice:app    \
    --file docker/app/Dockerfile \
    .
```

## DB コンテナへの接続設定
App コンテナの MySQL サーバへの取得方法は、`.php` に直接書いてあります。

`history.php` と `mail.php` から次の記述を探してください。

```php:history.php | mail.php
$host = '???';
$port = '???';
$database = '???';
$dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

$username = '???';
$password = '???';
```

ホスト名はエイリアスを設定したので `db` です。
ポートは特に変更していないので MySQL 標準の `3306` です。
データベース名は環境変数で指定して作成したはずの `event` です。
ユーザ名とパスワードも、自分で決めた環境変数に合わせて指定します。

以上を踏まえて、次の通り修正します。
２ファイルあるので２箇所修正します。

```php:history.php | mail.php
$host = 'db';
$port = '3306';
$database = 'event';
$dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

$username = 'hoge';
$password = 'password';
```

# 完成と動作確認
これで全ての構築が完了しました。

http://localhost:18000 を開いて、メールの送信や送信履歴の確認をしてみましょう。

![image](/images/demo-top.png)

![image](/images/demo-form-2.png)

![image](/images/demo-history.png)

一通り操作して問題がなさそうであれば、仕上げの Docker Compose を残すのみです。

問題がある場合は、これまでの内容を考えて [３部]() を活用して対処してみてください。

# まとめ

todo github commit

## やったこと
- ネットワークの作成
- DB コンテナ
  - 作成したネットワークにコンテナを接続する
- Mail コンテナ
  - 作成したネットワークにコンテナを接続する
- App コンテナ
  - 作成したネットワークにコンテナを接続する
  - DB コンテナへの接続設定をする
  - Mail コンテナへの接続設定をする

## ポイント
- 同じネットワークに接続したコンテナ同士なら通信できる
- エイリアスを設定するとホスト名で通信できる  

## できるようになったこと
- App コンテナ
  - メールの送信
  - メール送信履歴の保存

![image](/images/structure/structure.085.jpeg)

## やりきれなかったこと
todo checkbox
