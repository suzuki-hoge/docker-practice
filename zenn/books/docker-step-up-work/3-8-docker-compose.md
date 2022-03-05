---
title: "３部: Docker Compose"
---

最後の仕上げとして、今までのコマンドを全て Docker Compose に置き換えます。

全て置き換えると言ってもほとんどが簡単な機械作業ですので、さくさくと済ませていきます。

# 全体構成とハイライト
## やることの確認
＼ | やること                       | できるようになること                                                                                
:-- | :--                            | :--                                                                                                 
App|イメージをビルド               | ✅　PHP が準備できる<br>✅　メール送信が準備できる
App|コンテナを起動しビルド結果を確認<br>Web サーバを起動                 | ✅　Dockerfile の妥当性が確認できる<br>✅　Web サーバが起動できる                  
App|ソースコードをバインドマウント | ✅　ホストマシンの `.php` 編集が即反映される                                                    
App|コンテナのポートを公開         | ✅　ブラウザからアクセスできる                                            
App|コンテナをネットワークに接続<br>データベースサーバの接続設定<br>メールサーバの接続設定   | ✅　DB コンテナに接続できる<br>✅　Mail コンテナに接続できる
App|👉　Docker Compose 化              | これらを１コマンドで再現できる
DB| イメージをビルド                                                         | ✅　文字コードとログの設定ができる
DB| 環境変数を指定してコンテナを起動                                         | ✅　Dockerfile の妥当性が確認できる<br>✅　MySQL サーバが起動できる<br>✅　ユーザとデータベースを作成できる
DB| データ置場にボリュームをマウント                                 | ✅　テーブルがコンテナ削除で消えなくなる                                      
DB| 初期化クエリをバインドマウント                                       | ✅　コンテナ起動時にテーブルが作成される                                            
DB| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | ✅　App コンテナからホスト名で接続できる                                            
DB| 👉　Docker Compose 化                                                        | これらを１コマンドで再現できる
Mail| イメージを選定                                                           | ✅　SMTP サーバが起動できる<br>✅　Web サーバが起動できる                                      
Mail| コンテナを起動                                                           | ✅　Web サーバが起動できる<br>✅　SMTP サーバが起動できる                           
Mail| コンテナのポートを公開                                                   | ✅　ブラウザからアクセスできる                            
Mail| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | ✅　App コンテナからホスト名で接続できる                                            
Mail| 👉　Docker Compose 化                                                        | これらを１コマンドで再現できる
ほか| ボリュームを作成                                                        | ✅　マウントする準備ができる
ほか| ネットワークを作成                                                        | ✅　コンテナを接続する準備ができる

## Docker コマンドと Docker Compose の Yaml ファイルの対応表
いままで構築した全体像は次の通りです。
青字の部分が Dockerfile の記述で、黒字の部分が Docker のコマンドを表しています。

![image](/images/structure/structure.056.jpeg)

この黒字の部分を、赤字で示す通り全て Docker Compose の Yaml ファイルに置き換えます。

![image](/images/structure/structure.093.jpeg)

今までのページで構築したことと置き換え方法の対応表は、次の通りです。

＼   | やりたいこと           | Docker コマンド                 | Yaml ファイル
:--  | :--                    | :--                             | :--                            
App  | コンテナの定義         | -                               | `app:`                         
App  | コンテナ名の指定       | `container run --name`          | `container_name:`              
App  | イメージのビルド       | `image build`                   | `build:`                       
App  | バインドマウント       | `container run --mount`         | `volumes:`                     
App  | ポートを公開           | `container run --publish`       | `ports`                        
App  | ネットワークに接続     | `container run --network`       | -                              
App  | デフォルト命令の上書き | `container run <command>`       | `command:`                     
DB   | コンテナの定義         | -                               | `db:`                          
DB   | コンテナ名の指定       | `container run --name`          | `container_name:`              
DB   | 環境変数を指定         | `container run --env`           | `environment:`                 
DB   | イメージのビルド       | `image build`                   | `build:`                       
DB   | ボリュームをマウント   | `container run --mount`         | `volumes:`                     
DB   | バインドマウント       | `container run --mount`         | `volumes:`                     
DB   | ネットワークに接続     | `container run --network`       | -                              
DB   | エイリアスを設定       | `container run --network-alias` | -                              
Mail | コンテナの起動         | `container run`                 | `mail:`                        
Mail | イメージの指定         | -                               | `image:`                       
Mail | プラットフォームの指定 | `container run --platform`      | `platform:`                    
Mail | ポートを公開           | `container run --publish`       | -                              
Mail | エイリアスを設定       | `container run --network-alias` | -                              
ほか | ボリュームの作成       | `volume create`                 |                                
ほか | ネットワークの作成     | `network create`                | -                              

# このページで初登場する構築のコマンド
## ボリュームを作成する - volume create
```:コマンド
$ docker compose up [option]
```

オプション | 意味 | 用途  
:-- | :-- | :--
`-d`<br>`--detach`   | バックグラウンドで実行する   | ターミナルが固まるのを避ける
`--build`   | コンテナを起動する前にイメージをビルドする   | Dockerfile の変更を反映する

# Docker Compose に置き換える作業を始める前に
Docker Compose は複数のコンテナの起動を Yaml ファイルの内容に従って行ってくれるツールで、Docker Desktop に含まれています。

ここまで作ってきたものは大まかに分類すると次の通りです。

- Dockerfile および `COPY` 元のファイル
- イメージをビルドする手順  
- コンテナの起動をする手順

![image](/images/structure/structure.094.jpeg)

このうち Dockerfile 関連のもの以外は **ほぼ Yaml ファイルに置き換えられます**。

![image](/images/structure/structure.095.jpeg)

**コンテナの起動を楽にするツール** ということは **イメージはやはり必要** ということなので、Docker Compose を導入しても **Dockerfile はなくなりはしない** ということが感覚的に理解できるでしょう。

Docker Compose の **Yaml ファイル** と、**Dockerfile** と **イメージ** と **コンテナ** の関係をよく理解しましょう。

# 構築
Docker Compose は `compose up` コマンドで Yaml に従いコンテナを構築します。

その Yaml ファイルに今まで作成した手順を置き換えていきます。

## docker-compose.yml の作成
Docker Compose の Yaml ファイルは、プロジェクトのトップに `docker-compose.yml` で作ることが多いです。
そうすれば Yaml ファイルのパス指定を省略できますし、トップに存在することで「`docker` ではなく `docker compose` を使ってね」というアピールにもなるからです。

次のようなファイルを作成してください。

```yaml:docker-compose.yml
version: '3.9'

services:
```

`version:` は Docker Engine のバージョンに合わせつつ可能な限り新しいものを指定します。

`services:` の下に今まで作った手順の大半を移植していくことになります。

## App / DB / Mail サービスの定義
管理するサービスを `services:` の下に任意の名前で記述します。
サービスとは今まで起動していた３つのコンテナのことです。

今回はここまでの名称に合わせて `app:` `db:` `mail:` と追記します。

```yaml:docker-compose.yml
version: '3.9'

services:
  app:
  db:
  mail:
```

それぞれの下にそれぞれの手順を移植していくことになります。

ここから先は `docker-compose.yml` 全体ではなく、サービスに追記した部分だけを抜粋して記載することにします。
サービスの末尾に追記していけば問題ありませんが、前後関係はないのでどこに記述しても大丈夫です。

## App / DB / Mail コンテナの名前を指定
`container run --name` で指定していたコンテナ名を `container_name:` で置き換えます。

```yaml:docker-compose.yml
  app:
    container_name: docker-practice-app
```

```yaml:docker-compose.yml
  db:
    container_name: docker-practice-db
```

```yaml:docker-compose.yml
  mail:
    container_name: docker-practice-mail
```

ここまでは `app` のように短い名前を指定してきましたが、それは `exec app` のように指定するときに短い方が楽だからでした。

Docker Compose ではコンテナの指定を `compose exec app` のように **サービス名で行える** ため、コンテナ名を短くする必要はありません。
とは言え、未指定だと複数の Docker Compose を実行したときにわかりづらくなってしまうため、適当なプリフィックスを揃えてつけておくくらいはすると良いでしょう。

## App / DB イメージのビルド
**Dockerfile そのものは今までと全く同じものが必要** ですが、Dockerfile の指定をすれば **ビルド作業は Docker Compose が行ってくれます**。

`image build --file <path>` で指定していた Dockerfile を `build.dockerfile:` で、`<path>` を `build.context:` で置き換えます。

```yaml:docker-compose.yml
  app:
    build:
      dockerfile: docker/app/Dockerfile
      context: .
```

```yaml:docker-compose.yml
  db:
    build:
      dockerfile: docker/db/Dockerfile
      context: .
```

イメージのビルドは **`compose up` をしたがイメージが存在しない場合**、もしくは **`compose up --build` を実行した場合** に行われます。

## Mail イメージの指定
Dockerfile ではなくイメージを直接指定することももちろんできます。

`container run <image>` で指定していたイメージを `image:` で置き換えます。

```yaml:docker-compose.yml
  mail:
    image: mailhog/mailhog:v1.0.1
```

イメージの取得は **`compose up` をしたがイメージが存在しない場合** に行われます。

## Mail イメージのプラットフォームを指定
`container run --platform` で指定していたプラットフォームを `platform:` で置き換えます。

```yaml:docker-compose.yml
  mail:
    platform: linux/x86_64
```

ちなみに、DB サービスのプラットフォームの指定は `docker/db/Dockerfile` 内で指定されているため不要です。

## DB コンテナの環境変数の指定
`container run --env` で指定していた環境変数を `environment:` で置き換えます。

```yaml:docker-compose.yml
  db:
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_USER: hoge
      MYSQL_PASSWORD: password
      MYSQL_DATABASE: event
```

## ボリュームの作成と DB コンテナへのマウント
`volume create` で行っていたボリュームの作成を `volumes:` で置き換えます。

ボリュームの作成は特定のサービスに対して行う作業ではないため、`services:` の下ではなくルートに記述します。

```yaml:docker-compose.yml
version: '3.9'

services:
  app:
  db:
  mail:

volumes:
  docker-practice-db-store:
```

まっさらなボリュームを使いたいので、`docker-practice-db-volume` とは名前を変えました。

次に `container run --mount` で指定していたボリュームのマウントを `volume:` で置き換えます。

```yaml:docker-compose.yml
  db:
    volumes:
      - type: volume
        source: docker-practice-db-store
        target: /var/lib/mysql
```

`container run --mount` の指定方法と似ているので、`--volume` オプションからより置き換えやすいと思います。

## App / DB コンテナにバインドマウント
`container run --mount` で指定していたバインドマウントを `volume:` で置き換えます。

```yaml:docker-compose.yml
  app:
    volumes:
      - type: bind
        source: ./src
        target: /tmp/src
```

`volumes:` の要素はリストなので、先程のボリュームのマウントに続けて同じ `volumes:` の下に記述します。

```yaml:docker-compose.yml
  db:
    volumes:
      - type: volume
        source: docker-practice-db-store
        target: /var/lib/mysql
      - type: bind
        source: ./docker/db/init.sql
        target: /docker-entrypoint-initdb.d/init.sql
```

バインドマウントなのに `volumes:` という指定なので混乱してしまいますが、`type: bind` に注目して読むと良いです。

## App / Mail コンテナのポートを公開
`container run --publish` で指定していた環境変数を `ports:` で置き換えます。

```yaml:docker-compose.yml
  app:
    ports:
      - '18000:8000'
```

```yaml:docker-compose.yml
  mail:
    ports:
      - "18025:8025"
```

## ネットワークの作成と DB / Mail コンテナのエイリアス設定
Docker Compose では **自動でブリッジネットワークが作成されます**。
また **サービス名が自動でコンテナのネットワークにおけるエイリアスとして設定されます**。

なので `docker-compose.yml` に書き写した時点で `container run --network` と `container run --network-alias` の置き換えは完了しています。

## App コンテナのデフォルト命令の上書き
`container run <command>` で指定していたデフォルト命令の上書きを `command:` で置き換えます。

```yaml:docker-compose.yml
  app:
    command: php -S 0.0.0.0:8000 -t /tmp/src
```

## 起動と動作確認
置き換えはこれで全てです。

:::details docker-compose.yml の全体
```yaml:docker-compose.yml
version: '3.9'

services:
  app:
    container_name: docker-practice-app
    build:
      dockerfile: docker/app/Dockerfile
      context: .
    ports:
      - '18000:8000'
    volumes:
      - type: bind
        source: ./src
        target: /tmp/src
    command: php -S 0.0.0.0:8000 -t /tmp/src

  db:
    container_name: docker-practice-db
    build:
      dockerfile: docker/db/Dockerfile
      context: .
    volumes:
      - type: volume
        source: docker-practice-db-store
        target: /var/lib/mysql
      - type: bind
        source: ./docker/db/init.sql
        target: /docker-entrypoint-initdb.d/init.sql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_USER: hoge
      MYSQL_PASSWORD: password
      MYSQL_DATABASE: event

  mail:
    container_name: docker-practice-mail
    image: mailhog/mailhog:v1.0.1
    platform: linux/x86_64
    ports:
      - "18025:8025"

volumes:
  docker-practice-db-store:
```
:::

ここまでをしっかり構築してきた経験があるので、ちゃんと `docker-compose.yml` の **全ての行があまさず理解できる** と思います。

次のコマンドで `docker-compose.yml` に記述したサービス全てを起動します。

```:Host Machine
$ docker compose up
```

これだけです、**たったのこれだけ** です。

３つのコンテナが起動していく様が確認できるはずです。

### バックグラウンド実行とイメージの再ビルド
出力を見たかったので `compose up` はフォアグラウンド実行をしましたが、`container run` と同様に `--detach` を指定するとバックグラウンドで実行できます。

フォアグラウンドでの実行は `ctrl + c` で止めることができますが、これは正常な Docker Compose の終了フローにならないため、**コンテナは停止済のまま残ります**。
バックグラウンドでの実行は `compose down` というコマンドで全サービスを一気に停止することが可能で、この場合は `--rm` オプション指定時と同様に **停止済コンテナは削除されます**。

また、`--build` オプションをつけることにより、コンテナの起動前にイメージの再ビルドをさせることができます。

### 動作確認
http://localhost:18000 と http://localhost:18025 にアクセスして、一通りの動作確認を行いましょう。
ボリュームは今までと違うものにしたので、メール送信履歴はなくなっています。

問題なければこれで構築は本当に完成です、おつかれさまでした。

# Docker Compose の利点は再現の容易さ
冒頭のこの図を見てください。
青字が Dockerfile に、赤字が `docker-compose.yml` に記述した内容です。

![image](/images/structure/structure.093.jpeg)

**黒字がなくなっている** ということは、Dockerfile と `docker-compose.yml` だけでこの構築が行えるということです。

それらを Git 管理すれば、長い `container run` の **手順書も不要** ですし、`network create` を忘れて `container run` を実行してしまう **間違いも起きません**。

**Docker Compose はソフトウェアエンジニアにとって必須のツールと言える** でしょう。

# まとめ
このページの ~~手順書~~ **`docker-compose.yml`** と成果物は次のブランチで公開されています。

https://github.com/suzuki-hoge/docker-practice/tree/tmp

混乱してしまったときに参考にしてください。

## ポイント
- `docker-compose.yml` にコンテナと同じ数サービスを定義して、その下に定義を記述する
- Docker Compose に置き換えても **Dockerfile そのものは必要**
- Dockerfile と `docker-compose.yml` の Git 管理により、**環境構築が完全に再現できる**

## できるようになったことの確認
![image](/images/structure/structure.093.jpeg)


＼ | やること                       | できるようになること                                                                                
:-- | :--                            | :--                                                                                                 
App|イメージをビルド               | ✅　PHP が準備できる<br>✅　メール送信が準備できる
App|コンテナを起動しビルド結果を確認<br>Web サーバを起動                 | ✅　Dockerfile の妥当性が確認できる<br>✅　Web サーバが起動できる                  
App|ソースコードをバインドマウント | ✅　ホストマシンの `.php` 編集が即反映される                                                    
App|コンテナのポートを公開         | ✅　ブラウザからアクセスできる                                            
App|コンテナをネットワークに接続<br>データベースサーバの接続設定<br>メールサーバの接続設定   | ✅　DB コンテナに接続できる<br>✅　Mail コンテナに接続できる
App|👉　Docker Compose 化              | ✅　これらを１コマンドで再現できる
DB| イメージをビルド                                                         | ✅　文字コードとログの設定ができる
DB| 環境変数を指定してコンテナを起動                                         | ✅　Dockerfile の妥当性が確認できる<br>✅　MySQL サーバが起動できる<br>✅　ユーザとデータベースを作成できる
DB| データ置場にボリュームをマウント                                 | ✅　テーブルがコンテナ削除で消えなくなる                                      
DB| 初期化クエリをバインドマウント                                       | ✅　コンテナ起動時にテーブルが作成される                                            
DB| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | ✅　App コンテナからホスト名で接続できる                                            
DB| 👉　Docker Compose 化                                                        | ✅　これらを１コマンドで再現できる
Mail| イメージを選定                                                           | ✅　SMTP サーバが起動できる<br>✅　Web サーバが起動できる                                      
Mail| コンテナを起動                                                           | ✅　Web サーバが起動できる<br>✅　SMTP サーバが起動できる                           
Mail| コンテナのポートを公開                                                   | ✅　ブラウザからアクセスできる                            
Mail| コンテナをネットワークに接続<br>コンテナにエイリアスを設定 | ✅　App コンテナからホスト名で接続できる                                            
Mail| 👉　Docker Compose 化                                                        | ✅　これらを１コマンドで再現できる
ほか| ボリュームを作成                                                        | ✅　マウントする準備ができる
ほか| ネットワークを作成                                                        | ✅　コンテナを接続する準備ができる
