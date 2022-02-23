---
title: "1-2: サーバ仮想化とは？"
---

簡単に仮想化技術につ
# Docker とは
Docker は Docker 社の開発しているプラットフォームです。

コンテナや Dockerfile については後のページで細かく説明するとして、ここではいくつかの要素の要点だけ簡単に整理します。

- Docker Desktop
- Docker Engine
- Docker CLI
- Docker Compose
- Docker Hub

また、次の要素はこの本では扱わないため、ここで簡単に触れて「今は学ばない範囲」とマークしておきます。

- Amazon ECR / Google Container Registry
- Kubernetes

## Docker Desktop
Docker Desktop は Windows や Mac で動くアプリケーションで、Docker Engine や Docker CLI や Docker Compose を含んでいます。
また、Linux のカーネルも含んでいます。

Docker に関するもの一式が得られるため、Docker を使う場合はこれをインストールすると良いでしょう。
( Windows で Hyper-V が利用できない場合に VirtualBox を使い Docker を動かす Docker Toolbox というものもありますが、ここでは扱いません )

Docker Desktop は [ドキュメントサイト](https://docs.docker.jp/desktop/index.html#desktop-download-and-install) を読み進めると Docker Hub からダウンロードできます。
ドキュメントには Docker for Windows や Docker for Mac と書いてありますが、それぞれ Docker Desktop のことなので安心してください。

以降この本では Docker Desktop がインストールしてあるものとして進めます。

Docker Desktop には Docker ID を使って Sign in することができますが、アカウントを作らなくても十分活用できます。
Sign in するメリットについては [ダウンロード率制限](https://matsuand.github.io/docs.docker.jp.onthefly/docker-hub/download-rate-limit/) などを見てみてください。

## Docker Engine
Docker のコンテナは、Linux の Namespace という技術で成り立っています。( コンテナについては [２部: ](2-1-points) で改めて説明します )

その Namespace を管理・操作してコンテナとしてアプリケーションを構築するために必要なのが Docker Engine です。

コンテナを動作させるためには Linux のカーネルが必要になるので、Docker Engine は Docker Desktop に含まれる Linux カーネルの上で動作します。

e?

## Docker CLI
Docker CLI はその名の通り Docker のコマンドラインインターフェースです。
Docker Desktop により、`docker run` や `docker build` など、Docker に関する様々なことを行うコマンドがホストマシンにインストールされます。

## Docker Compose
Docker Compose は Docker CLI をまとめて実行してくれる便利なラッパーのようなものです。

「３つのコンテナを起動し」「それぞれのネットワークを接続し」「コンテナのログをホストマシンに出力させる」という操作を、Yaml ファイルを書くことで実現することができるツールです。

構築が終わり配布された Docker 環境は Docker Compose を使う形になっていることが多いので、`docker compose up` のようなコマンドを目にしたことがある方も多いと思います。

Docker Compose で行っていることは全て Docker の基本操作なので、Docker の基礎を身につけることで自然と Docker Compose も理解できるようになります。

## Docker Hub
[Docker Hub](https://hub.docker.com/) は Docker のイメージを共有する Saas サービスです。

公開されている Docker イメージを `git pull` したり、構築した Docker 環境を `git push` する先のように理解すれば、まずは大丈夫です。

Docker Desktop のインストールやイメージの取得には、Docker Hub のアカウントやログインは必要になりません。

## Amazon ECR / Google Container Registry
[Amazon Elastic Container Registry](https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/what-is-ecr.html) や [Google Container Registry](https://cloud.google.com/container-registry) は、非公開のイメージのレジストリです。

要するにプライベートな Docker Hub のことで、「公開や配布はしたくないけどレジストリに登録しないとデプロイできない」というときに使うことになります。

開発環境の構築および共有に限定すれば GitHub などで Dockerfile を共有すれば十分なので、この本ではこれらの非公開レジストリは使用しません。

## Kubernetes
Kubernetes は多数のコンテナを自動的に管理するオーケストレーションソフトウェアです。
オーケストレーションにより、コンテナの監視やコンテナ停止時の自動起動やスケーリングなどが実現できるようになります。

Kubernetes も Docker Desktop に含まれていますが、開発環境の構築にここまで必要になることはまずないので、この本では Kubernetes は使用しません。

# コンテナの特徴
## 利点
### 起動が早い
OS の起動を行わないため、仮想サーバに比べて Docker コンテナの方が起動が速いです。

![image](/images/picture/picture.002.jpeg)

そのためコンテナ構築のトライ & エラーが楽だったり、気軽にコンテナを起動することが可能だったりします。

気軽に起動できるので「テストを実行する時だけ起動して数分で削除する」という小さいサイクルでクリーンな環境を使うことができます。

### デプロイしやすい
ローカル開発環境を直接ホストマシンで構築したり仮想サーバで構築したりする場合は、ローカルで構築したものとデプロイしたいものの単位がずれていることが大半だと思います。

たとえば「Vagrant で Ubuntu と PHP を構築して `.php` を動かす」という仮想サーバでローカル開発をして、デプロイする時は「サーバに PHP はインストール済みだから `.php` だけデプロイしたい」というようにずれが生じます。

e

このずれが「Vagrant そのものと、さらに別に `.php` をデプロイする方法が必要」というコストになったり、「Vagrant の PHP がサーバの PHP と違った」というリスクになったりします。

![image](/images/picture/picture.003.jpeg)

対して Docker コンテナは Docker Engine の上で動きます。

Docker コンテナであれば「PHP のインストールされた `.php` が動くコンテナ」をローカルの Docker Engine で動かして開発し、デプロイする時は「サーバの Docker Engine の上に置く」のでずれが生じません。

![image](/images/picture/picture.004.jpeg)

## 注意点
### ホストマシンの OS の違いが影響する可能性がある
Docker コンテナは実際はホスト OS で動いているので、その違いがコンテナに影響してしまう可能性があります

![image](/images/picture/picture.005.jpeg)

そのため、Docker は Windows では相性が悪いなどの話もあるようです^[持っていないので実体験としてはわかりませんが、GitBash などで利用しているとまれに細かい挙動が違ったりすることがあるようです]^[WSL 環境はわかりません]

最近では M1 Mac で Docker を動かすのが大変というはなしもよく見かけます

仮想化技術のはずなのになんでホスト OS が違うとそんなに違うの、という疑問の理由の一つでしょう

