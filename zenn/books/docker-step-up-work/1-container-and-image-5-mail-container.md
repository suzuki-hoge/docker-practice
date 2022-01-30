---
title: "🖥️ ｜ 🐳 ｜ Mail サーバを数分で用意しよう"
---

# 目的

# Mail コンテナを起動しよう
Mail コンテナも Docker Hub のイメージを使います

[MailCatcher](https://mailcatcher.me/) というモックのメールサーバを起動してくれるイメージがあるので、それを使います ( [Docker Hub](https://hub.docker.com/r/schickling/mailcatcher) )

:::message
機能的には大差なさそうですが、更新の比較的最近な [MailHog](https://hub.docker.com/r/mailhog/mailhog) を使う方が一般には良いでしょう

ただ MailHog は Mac ( M1 ) だとメールサーバは問題なく使えますがメール送信機能が動かなかったため、このワークでは MailCatcher を使います

メール送信を `sendmail` などで行いメールサーバだけを使いたい場合は、MailHog の利用も可能です
:::

todo hog でいいのでは？

[Docker Hub](https://hub.docker.com/r/schickling/mailcatcher) で調べたイメージ名を指定して起動してみましょう

今回は `-d` というバックグラウンドで実行するオプションをつけてみます todo

:::detail ワーク: コンテナの起動
```
$ docker run -d --platform=linux/amd64 schickling/mailcatcher
1b4cbbeb4f1909a179823fbb700543f06d9cf80ff21ce1ccf19169183f566374

$
```
:::

`-d` をつけるとターミナルが固まらずにコンテナはバックグラウンドで起動するようになります

`bash` のように対話操作する命令や `cat /lsb-release` のような結果が見たい命令を除き、コンテナを起動するときは `-d` をつけると固まるターミナルが多くなりすぎず良いでしょう

[comment]: <> (- :bulb: MailCatcher イメージを選択し、それをそのまま起動したコンテナができました)

[comment]: <> (- :bulb: コンテナへの命令は常駐プロセスの `mailcatcher` ですが、`-d` によりバックグラウンドモードにしているのでターミナルが固まりませんでした)


# まとめ

[comment]: <> (3 つの `docker run` の使い方を紹介しました)

[comment]: <> (- `docker run` はイメージからコンテナを起動するコマンド)

[comment]: <> (- `-it` で `bash` などの対話操作を可能にする)

[comment]: <> (- `-e` で環境変数を指定できる)

[comment]: <> (- `-d` でバックグラウドで実行できる)

[comment]: <> (:bulb: `docker run` は `docker pull` を含んでいるので忘れがちですが、`docker run` はイメージからコンテナを起動するとよく意識しましょう)

[comment]: <> (今は自分で Ubuntu イメージに変更を加えたコンテナと、Docker Hub から取得したイメージをそのまま使っているコンテナが起動しています)

[comment]: <> (![image]&#40;/images/slide/slide.008.jpeg&#41;)
