# Docker Practice
## お断り全般
- M1 考慮済み
- `$` がホスト ( Windows や Mac )
- `#` がコンテナ
- コピペはせずコマンドは手打ちしよう
- この Book はローカル開発にフォーカスした内容
  - Docker がローカル開発のためのものという意味ではない

### Book の閲覧
最終的に Zenn に公開するつもりですが、Zenn は限定公開ができないため GitHub で共有します

ただ GitHub は Markdown の文法差異やプレビューの面倒さのせいで書きづらいので、Zenn 形式で書かせてもらいます

Zenn のプレビュー機能で閲覧してください

#### Node.js がローカルにある人
```
$ git clone https://github.com/suzuki-hoge/docker-stepup-work
$ cd zenn
$ npm install
$ npx zenn preview
```

http://localhost:8000

#### Docker がローカルにある人
これから Docker を学ぶのに Docker コマンドで閲覧するというのも...

```
$ git clone https://github.com/suzuki-hoge/docker-stepup-work
$ cd zenn
$ docker compose up -d --build
```

http://localhost:18000

#### Docker + Make がローカルにある人
ワークを最後までと Docker Desktop + Make を使うので、今インストールしても良いでしょう

Mac は Make は標準インストールです ( Windows はわかりません )

```
$ git clone https://github.com/suzuki-hoge/docker-stepup-work
$ cd zenn
$ make up
```

http://localhost:18000

## 目的
- todo 知識の分類 Dockerfile / Linux / PHP
- 自分で問題に対応できるような基礎知識を得る
- 渡された構成を起動するだけではなく、自分で構成を作る過程を経験する
- そのために Docker Compose と Docker を自由に読み書き換えられるようになる

## ほげめも
- todo 知識の分類 Dockerfile / Linux / PHP を分けてポイントする
- todo ターミナルとシェルについてちゃんとする
- todo tree の書式を統一する
- todo 絵とコマンドオプションとまとめを統一する
- todo MailCatcher / MSMTP / MTA について整理する

### 構成 ( 仮 )
- readme: 完成形
- step0: Docker の基礎を知ろう
- step1: コンテナを起動しよう
- step2: コンテナに接続しよう
- step3: イメージを作成しよう
- step4: コンテナにポートを割り当てよう
- step5: コンテナのログを見よう
- step6: ネットワークを使おう
- step7: ボリュームを使おう
- step8: Docker Compose を使おう
- step9: Makefile を作ろう
- step10: 完成
- 例: サクッと使う
- 例: ci
- 例: cd

## 完成品
複数の Dockerfile からなるコンテナを docker-compose.yaml で起動し、PHP を動かします

```
$ tree .
.
|-- Makefile
|-- README.md
|-- docker
|   |-- db
|   |   |-- Dockerfile
|   |   |-- init.sql
|   |   `-- my.cnf
|   `-- php
|       |-- Dockerfile
|       |-- mail.ini
|       `-- mailrc
|-- docker-compose.yaml
`-- src
    |-- index.php
    |-- mail.php
    `-- select.php
```

開発中に行う主要なコマンドは Makefile を配置して実行しやすいようにします

次の手順で起動できるはずです

```
$ git clone https://github.com/suzuki-hoge/docker-stepup-work

$ cd docker-stepup-work

$ make build

$ make up

$ make ps

NAME                    SERVICE    STATUS     PORTS
docker-practice-db      db         running    3306/tcp, 33060/tcp
docker-practice-php     php        running    0.0.0.0:9000->8000/tcp, :::9000->8000/tcp
docker-practice_mail    mail       running    1025/tcp, 0.0.0.0:1080->1080/tcp, :::1080->1080/tcp
```

ブラウザを開くと簡単なトップページが表示され

![image](./images/demo-top.png)

メール送信フォームに入力すると

![image](./images/demo-send.png)

メールが送信されます ( メーラーはモックなので実際には送信されません / 実在しない宛先でも動きます )

![image](./images/demo-result.png)

モックのメールサーバでメールの内容を確認したり

![image](./images/demo-mailer.png)

メールの送信履歴を確認することができます

![image](./images/demo-history.png)

## 前提
次のインストールが必要です

- make ( macOS の場合は不要です )
- Docker Desktop ( 次ページで説明と URL 記載を行います )

この本は Windows の GitBash と macOS ( Intel / M1 ) で動作することを確認しています

