---
title: "📚 ｜ 🐳 ｜ ボリュームってなに？"
---
この章の目標は PHP コンテナと MySQL コンテナを使って、`docker run` の `-v` オプションを理解することです

- [コマンドライン・リファレンス ( run )](http://docs.docker.jp/v19.03/engine/reference/commandline/run.html)
- [ボリュームの利用](https://matsuand.github.io/docs.docker.jp.onthefly/storage/volumes/)
- `docker volume`
    - [`create`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/volume_create/)
    - [`inspect`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/volume_inspect/)
    - [`ls`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/volume_ls/)
    - [`prune`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/volume_prune/)
    - [`rm`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/volume_rm/)

この章では PHP コンテナと MySQL コンテナと Mail コンテナが起動していることを前提とします

```
$ docker ps --format "table {{.ID}} \t {{.Image}} \t {{.Command}} \t {{.Ports}}"

CONTAINER ID    IMAGE                            COMMAND                   PORTS
<PHP>           docker-step-up-work-build_php    "bash"                    0.0.0.0:18000->8000/tcp, :::18000->8000/tcp
<Mail>          schickling/mailcatcher           "mailcatcher --no-qu…"    1025/tcp, 0.0.0.0:11080->1080/tcp, :::11080->1080/tcp
<MySQL>         mysql:5.7                        "docker-entrypoint.s…"    3306/tcp, 33060/tcp
```

# 📚 ボリュームとは
コンテナのファイルシステムはホストマシンのファイルシステムとは隔離されており、お互いのファイルを触ったりすることはできません

todo e

またコンテナは起動するたびにクリーンな状態で生まれ変わるので、同じイメージから起動したコンテナでもファイルの変更は影響しません

todo e

しかしたとえば `.php` を編集するのにいちいちコンテナに接続して `vi` で編集するのは非効率すぎますし、MySQL コンテナに作ったデータはコンテナを終了しても残っていて欲しいです

それを解決するためにボリュームという仕組みを使います

ボリュームにはいくつか種類がありますが、このワークでは主要な 2 つを使います

## 📚 ネームドマウント ( todo ネームドボリューム？ )
ネームドマウントは、コンテナ内の任意のディレクトリをホストマシンと共有する機能です

ホストマシン側にコンテナ内のディレクトリを残すことで、コンテナを終了してもコンテナのファイルがホストマシンに残ります

次に同じイメージからコンテナを起動するときに同じボリュームを指定することで、起動直後のコンテナが直前に終了したコンテナのファイルを持った状態にすることができます

この機能は主に MySQL コンテナのデータベースの中身などをコンテナを跨いで維持したいときなどに使われます

`docker run -v <volume-name>:<container-path>`

## 📚 マウントとは
マウントも同じくコンテナ内の任意のディレクトリをホストマシンと共有する機能です

ネームドマウントとの一番の違いは、ホストマシン側でファイルを変更すると即時コンテナ内に反映される点が挙げられます

この機能は主に PHP コンテナの中に置く `.php` ファイルをホストマシンの好きなエディタで書きたいときなどに使われます

`docker run -v <hostmachine-path>:<container-path>`

# 📚 Dockerfile の COPY とは
ここで `docker run -v` からは少し離れますが Dockerfile の `COPY` 命令についても抑えておきましょう

```
FROM ubuntu:20.04

COPY foo.conf /etc/foo.conf
```

Dockerfile の `COPY` 命令は、ホストマシンにあるファイルをイメージ内に配置するコマンドです

この Dockerfile を `docker build` してイメージを作り `docker run` でコンテナを起動すると、そのコンテナは起動直後に `/etc/foo.conf` を持っていることになります

この機能は主にコンテナ内で使うコマンドやサービスの設定ファイルなどを配置したい時などに使われます

# 📝 ひといきまとめ
コンテナのファイル操作に関して 3 つ整理しました

- コンテナ内のファイルをホストマシンに残すネームドマウント
- コンテナ内とホストマシンでファイルを共同編集できるバインドマウント
- イメージをファイルと一緒にビルドする Dockerfile の `COPY`

いずれも用途と特徴が違うので頻繁に使います

コンテナレベルの話なのかイメージレベルの話なのかをよく意識すると理解がしやすいでしょう

todo e      ボリュームを使うのに再ビルドはいらないので拾ってきたのでおk / 設定ファイル配置は焼き直し
