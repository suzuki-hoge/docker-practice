---
title: "🖥️ ｜ 🐳 ｜ Mail サーバを数分で用意しよう"
---
# Mail コンテナを起動しよう
Mail コンテナも Docker Hub のイメージを使います

[MailCatcher](https://mailcatcher.me/) というメール送信機能とモックのメールサーバを提供してくれる Ruby によるライブラリがあります

ホスト OS には `gem` で入れるようですが、[Docker Hub にイメージがある](https://hub.docker.com/r/schickling/mailcatcher) のでそれを使います

:::message
機能的には大差なさそうですが、更新の比較的最近な [MailHog](https://hub.docker.com/r/mailhog/mailhog) のイメージを使う方が一般には良いでしょう

ただ MailHog は Mac ( M1 ) だとメールサーバは問題なく使えますがメール送信機能が動かなかったため、このワークでは MailCatcher を使います

メール送信を `sendmail` などで行いメールサーバだけを使いたい場合は、MailHog の利用も可能です
:::

Docker Hub で調べたイメージ名を指定して起動してみましょう

今回は `-d` オプションをつけてみます

```
$ docker run -d --platform=linux/amd64 schickling/mailcatcher
1b4cbbeb4f1909a179823fbb700543f06d9cf80ff21ce1ccf19169183f566374

$
```

`-d` というバックグラウンドで実行するフラグをつけたので、すぐホストマシンのターミナルに戻ってきてしまいました

`-d` をつけるとターミナルが固まらずにコンテナはバックグラウンドで起動するようになります

`bash` のように対話操作するものや `cat /lsb-release` のような即時終わるものを除き、MySQL サーバや Mail サーバのコンテナを起動する時には `-d` をつけるとターミナルが多くなりすぎず良いでしょう

Step 1 の Mail コンテナはこれで十分です

- :bulb: MailCatcher イメージを選択し、それをそのまま起動したコンテナができました
- :bulb: コンテナへの命令は常駐プロセスの `mailcatcher` ですが、`-d` によりバックグラウンドモードにしているのでターミナルが固まりませんでした

# コンテナ一覧を確認してみよう
3 つのコンテナが確認できれば大丈夫です

```
$ docker ps
CONTAINER ID    IMAGE                     COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher    "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
345264ac9206    ubuntu:20.04              "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

`CONTAINER ID` と `NAMES` はランダムです

# まとめ
3 つの `docker run` の使い方を紹介しました

- `docker run` はイメージからコンテナを起動するコマンド
- `-it` で `bash` などの対話操作を可能にする
- `-e` で環境変数を指定できる
- `-d` でバックグラウドで実行できる

:bulb: `docker run` は `docker pull` を含んでいるので忘れがちですが、`docker run` はイメージからコンテナを起動するとよく意識しましょう

今は自分で Ubuntu イメージに変更を加えたコンテナと、Docker Hub から取得したイメージをそのまま使っているコンテナが起動しています

![image](/images/slide/slide.008.jpeg)

- [step0](books/docker-step-up-work/bk/step0.mder-step-up-work/bk/step0.md)
- [step2](books/docker-step-up-work/bk/step2.mder-step-up-work/bk/step2.md)

