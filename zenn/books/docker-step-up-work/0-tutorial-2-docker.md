---
title: "📚 ｜ 🐳 ｜ Docker って？"
---
## Docker Desktop とは
Docker Desktop は Windows や Mac で動くアプリケーションで、Docker Engine や Docker CLI や Docker Compose を含んでいます

ホストマシン上で Docker を使う場合は、これをインストールすることになります

Docker Desktop は [公式サイト](https://docs.docker.jp/desktop/index.html#desktop-download-and-install) でダウンロードできます

以降この Book では Docker Desktop がインストールしてあるものとして進めます

## Docker Hub とは
[Docker Hub](https://hub.docker.com/) はイメージ ( わかりやすく言えば ≒ Dockerfile ) を共有する Saas サービスです

ソースコードを `git push` する先のように理解すれば、まずは大丈夫です

Docker Desktop のインストールや Dockerfile の取得には、Docker Hub のアカウントやログインは必要になりません

Dockerfile を `push` するときなどは必要になりますが、この Book では行いませんので、この Book ではアカウント作成は不要です

## ちょっとまとめ
- VirtualBox などと Docker の違いの 1 つは、ゲスト OS が存在しないこと
- ローカルマシンに Docker Desktop をインストールすると一通りのことができるようになる
- Docker Hub はイメージ ( ≒ Dockerfile ) を共有するサービスで、Read に限ればアカウントは不要
