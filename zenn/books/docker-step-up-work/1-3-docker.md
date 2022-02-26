---
title: "１部: Docker とは？"
---

簡単に仮想化技術について学んだので、このページではその中の１つである Docker について学びます。

# Docker とは
Docker はコンテナ型仮想化を用いてアプリケーションの開発や配置を行うための、Docker 社の開発しているプラットフォームです。

2013 年のリリース当初は 「Docker」は単一のアプリケーションを指す言葉だったようですが、標準化と発展に伴いさまざまなコンポーネントを含むようになり、今は「Docker」はプラットフォームであるとされているようです。
Docker という単語がなにを指しているかは結構曖昧ですが、この本ではプラットフォームのこととして使います。

このページではそのプラットフォームに含む Docker Xxx という名前の要素について、要点だけ簡単に整理します。

- Docker Engine
- Docker CLI
- Docker Desktop
- Docker Compose
- Docker Hub

Docker について調べるとよく耳にする「コンテナ」と「イメージ」と「Dockerfile」については、２部全体を使い説明します。

また、次の要素はこの本では扱わないため、ここで簡単に触れて **今は学ばない範囲とマーク** しておきます。

- ECS / GKE  
- ECR / GCR
- Kubernetes

# Docker Engine とは
Docker Engine が [１部: ]() で紹介したコンテナ型仮想化ソフトウェアの部分です。
これによりアプリケーションをコンテナとして扱うことができるようになります。

Docker のコンテナは Linux のカーネルと機能を使って動いているため、Docker Engine は Linux でしか動きません。

要約すると **コンテナを乗せる部分** で、**Linux で動く** ソフトウェアです。

![image](/images/picture/picture.015.jpeg)

また、Command Line Interface ( CLI ) も Docker Engine に提供されます。

# Docker CLI とは
Docker Engine に提供され、`docker run` や `docker build` のような `docker` ではじまるコマンドで Docker に命令をすることができます。

要約すると **コマンドのこと** で、普段もっとも目にする想像しやすい部分でしょう。

![image](/images/picture/picture.016.jpeg)

ちなみに `docker` コマンドは `dockerd` というデーモンに命令を伝え `containerd` というランタイムを操作しますが、一般に `dockerd` や `containerd` は隠蔽されており意識することはありません。

# Docker Desktop とは
Docker Desktop は Windows や Mac で Docker Engine を動かすためのアプリケーションです。

**Docker Desktop に Linux のカーネルが含まれている** ため、Linux 以外の OS でも Docker Engine を動かすことができるようになります。

一般に「ホストマシンに Docker をインストールする」とは「Docker Desktop アプリケーションをインストールする」ということになるでしょう。^[Windows で Hyper-V が利用できない場合に VirtualBox を使い Docker を動かす Docker Toolbox というものもありますが、ここでは取り扱いません。]

要約すると **Windows か Mac で Docker を使おうと思ったときに Docker 一式をインストールできるもの** です。

![image](/images/picture/picture.017.jpeg)

Docker Desktop には Docker Compose や Kubernetes なども含まれています。

## インストールとアカウントについて
Docker Desktop は [ドキュメントサイト](https://docs.docker.jp/desktop/index.html#desktop-download-and-install) を読み進めると Docker Hub からダウンロードできます。
ドキュメントには Docker for Windows や Docker for Mac と書いてありますが、それぞれ Docker Desktop のことなので安心してください。

以降この本では Docker Desktop がインストールしてあるものとして進めます。

Docker Desktop には Docker ID を使って Sign in することができますが、アカウントを作らなくても十分活用できます。
Sign in するメリットについては [ダウンロード率制限](https://matsuand.github.io/docs.docker.jp.onthefly/docker-hub/download-rate-limit/) などを見てみてください。

# Docker Compose とは
Docker Compose は Docker CLI をまとめて実行してくれる便利なツールで、`docker compose up` のような `docker compose` ではじまるコマンドを提供してくれます。

「２つのコンテナを起動し」「それぞれのネットワークを構築し」「コンテナのデータをホストマシンに出力させる」という複雑なコマンドを、Yaml ファイルを書くことで実現することができるツールです。

要約すると **`docker` コマンドをまとめて実行してくれるようなもの** です。

![image](/images/picture/picture.018.jpeg)

Docker Compose を導入すれば **極めて簡単** に **同じ構成を再現** できるようになります。

この本の３部では Docker CLI だけで構築した環境を Docker Compose に置き換えるところまで経験できますが、あまりの手軽さに驚くことでしょう。

# Docker Hub とは
[Docker Hub](https://hub.docker.com/) は Docker のイメージレジストリである Saas サービスです。

公開されているイメージを `git pull` したり、構築したイメージを `git push` する先のように理解すれば、まずは大丈夫です。

要約すると **イメージの GitHub のようなもの** です。

![image](/images/picture/picture.020.jpeg)

Docker Hub からのイメージの取得には、アカウントやログインは必要ありません。

# ECS / GKE とは
[Amazon Elastic Container Service ( ECS )](https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/Welcome.html) と [Google Kubernetes Engine ( GKE )](https://cloud.google.com/kubernetes-engine) は、コンテナ管理サービスです。

要約すると **Docker Engine の入った Linux のこと** で、**ローカル開発に使ったコンテナをそのままリリースできる場所** のことです。

![image](/images/picture/picture.021.jpeg)

ローカル開発環境の構築に限定すれば必要ないため、この本ではこれらのコンテナ管理サービスは使用しません。

# ECR / GCR とは
[Amazon Elastic Container Registry ( ECR )](https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/what-is-ecr.html) と [Google Container Registry ( GCR )](https://cloud.google.com/container-registry) は、非公開のイメージのレジストリです。

要約すると **プライベートな Docker Hub のこと** で、「商用サービスのイメージを Docker Hub に晒したくないけど、レジストリに登録しないとデプロイできない」というときなどに使うことになります。

![image](/images/picture/picture.022.jpeg)

ローカル開発環境の構築に限定すれば GitHub と Dockerfile で十分なので、この本ではこれらの非公開レジストリは使用しません。

# Kubernetes とは
Kubernetes ( 略して k8s とも ) は多数のコンテナを自動的に管理するオーケストレーションソフトウェアです。
オーケストレーションにより、コンテナの監視やコンテナ停止時の自動起動やスケーリングなどが実現できるようになります。

要約すると **起動中のコンテナの面倒を見てくれる** ものです。

![image](/images/picture/picture.023.jpeg)

Kubernetes も Docker Desktop に含まれていますが、開発環境の構築にここまで必要になることはまずないので、この本では Kubernetes は使用しません。

ちなみにオーケストレーションツールは `docker` コマンドではなく `dockerd` や `containerd` を直接使っています。

# まとめ
長くなってしまったので、簡潔にまとめます。

- Docker Engine は **コンテナを乗せるソフトウェア**
- Docker CLI は **コンテナなどを操作するコマンド**
- Docker Desktop は **Linux や Docker Xxx が一式入ってるアプリケーション**
- Docker Compose は **コマンドをまとめて実行してくれるツール**
- Docker Hub は **イメージレジストリの Saas サービス**
- ECS / GKE は **Docker Engine の入ったコンテナ管理サービス**
- ECR / GCR は **非公開のイメージレジストリ**
- Kubernetes は **起動中のコンテナを見てくれるソフトウェア**

混乱してしまった時は立ち返ってみてください。
