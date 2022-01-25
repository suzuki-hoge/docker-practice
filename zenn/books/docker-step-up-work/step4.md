---
title: "Step 4: コンテナにポートを割り当てよう"
---

この章の目標は PHP コンテナと Mail コンテナを使って、`docker run` の `-p` オプションを理解することです

- [コマンドライン・リファレンス ( run )](http://docs.docker.jp/v19.03/engine/reference/commandline/run.html)

コンテナを終了してしまった場合は、Mail コンテナは Step 1 の、PHP コンテナは Step3 の手順で起動し直しておきましょう

# Mail コンテナにホストマシンから繋げるようにしよう
MailCatcher は開発用のモックメールサーバです

Mail コンテナを起動すると、Gmail のようにブラウザで受信したメールを確認することができます

## コンテナ内での動作確認
ちょっとコンテナに繋いで確認してみましょう

:::details コンテナに繋ぐ方法は覚えていますか？
CONTAINER ID を確認して

```
$ docker ps
CONTAINER ID    IMAGE                     COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher    "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
345264ac9206    ubuntu:22.04              "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

`docker exec <CONTAINER>` です

```
$ docker exec -it 1b4cbbeb4f19 bash
OCI runtime exec failed: exec failed: container_linux.go:380: starting container process caused: exec: "bash": executable file not found in $PATH: unknown
```

が、失敗しました

どうやらこのコンテナには `bash` がインストールされていなかったようです

仕方ないので代わりに `sh` を使いましょう

```
$ docker exec -it 1b4cbbeb4f19 sh

#
```

接続できました
:::

`curl` を使ってモックメールサーバを叩いてみようと思うのですが、`bash` が入っていなかったくらいですからおそらく `curl` も入ってないでしょう

```
# curl
/bin/sh: curl: not found
```

適当に入れましょう、この `curl` は今回の動作確認で使い捨てるので Dockerfile を書くほどではありません

```
# apk update

# apk add curl
```

[MailCatcher の公式サイト](https://mailcatcher.me/) をみると `127.0.0.1:1080` ( = `localhost:1080` ) で起動しているはずです

HTML が返ってくるか簡単に確認してみましょう

```
# curl localhost:1080
<!DOCTYPE html>
<html class="mailcatcher">
<head>
  <title>MailCatcher</title>
  <link href="/favicon.ico" rel="icon" />
  <link rel="stylesheet" href="/assets/mailcatcher.css">
  <script src="/assets/mailcatcher.js"></script>
</head>
<body>
  <header>
    <h1><a href="http://mailcatcher.me" target="_blank">MailCatcher</a></h1>
    <nav class="app">
      <ul>
        <li class="search"><input type="search" name="search" placeholder="Search messages..." incremental="true" /></li>
        <li class="clear"><a href="#" title="Clear all messages">Clear</a></li>

      </ul>
    </nav>
  </header>
  <nav id="messages">
    <table>
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Subject</th>
          <th>Received</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </nav>
  <div id="resizer"><div class="ruler"></div></div>
  <article id="message">
    <header>
      <dl class="metadata">
        <dt class="created_at">Received</dt>
        <dd class="created_at"></dd>
        <dt class="from">From</dt>
        <dd class="from"></dd>
        <dt class="to">To</dt>
        <dd class="to"></dd>
        <dt class="subject">Subject</dt>
        <dd class="subject"></dd>
        <dt class="attachments">Attachments</dt>
        <dd class="attachments"></dd>
      </dl>
      <nav class="views">
        <ul>
          <li class="format tab html selected" data-message-format="html"><a href="#">HTML</a></li>
          <li class="format tab plain" data-message-format="plain"><a href="#">Plain Text</a></li>
          <li class="format tab source" data-message-format="source"><a href="#">Source</a></li>
          <li class="action download" data-message-format="html"><a href="#" class="button"><span>Download</span></a></li>
        </ul>
      </nav>
    </header>
    <iframe class="body"></iframe>
  </article>
</body>
</html>
```

それっぽい HTML が返ってきました

## よりみち: Alpine Linux
## よりみち: インストールするコマンドはどれ？
適当に接続したコンテナで `yum` を使うか `apt` を使うかわからない、ということがままあります

僕は結構雑に `yum`, `apt`, `apk`, `dnf` とか適当に叩いて見つかったのを使います
// todo dnf

今回は `ap` まで入力して `<TAB>` をガチャガチャやっていたら `apk` があった、という感じです

少しちゃんと調べるなら `/etc/redhat-release` や `/etc/alpine-release` を雑に見てみるというのが有効です

`/ect/*-release` を探すのが手っ取り早いでしょう

```
$ docker ps
CONTAINER ID    IMAGE                     COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher    "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                 "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
345264ac9206    ubuntu:22.04              "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

コンテナに `bash` で接続するのも面倒なので、`exec` で `ls` 命令を送りつけてしまいます

ただし要点が 2 つあります

- `*` は送れないので `bash -c 'ls *'` のように `bash` 命令で送らなければなりません
- 先ほどのように `bash` がない可能性があるので `sh` でそれを行います

PHP コンテナ

```
$ docker exec 345264ac9206 sh -c 'ls /etc/*-release'                                                                                                                                                    tmp
/etc/lsb-release
/etc/os-release
```

MySQL コンテナ
```
$ docker exec 11d945f0edf0 sh -c 'ls /etc/*-release'                                                                                                                                                    tmp
/etc/os-release
```

Mail コンテナ
```
$ docker exec 1b4cbbeb4f19 sh -c 'ls /etc/*-release'                                                                                                                                                    tmp
/etc/alpine-release
/etc/os-release
```

このファイル名でわかれば十分だし、わからなければ中を見れば良いです

PHP コンテナ
```
$ docker exec 345264ac9206 sh -c 'cat /etc/*-release'                                                                                                                                                   tmp
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.3 LTS"
NAME="Ubuntu"
VERSION="20.04.3 LTS (Focal Fossa)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 20.04.3 LTS"
VERSION_ID="20.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
VERSION_CODENAME=focal
UBUNTU_CODENAME=focal
```

Debian ですね

MySQL コンテナ
```
$ docker exec 11d945f0edf0 sh -c 'cat /etc/*-release'                                                                                                                                                   tmp
PRETTY_NAME="Debian GNU/Linux 10 (buster)"
NAME="Debian GNU/Linux"
VERSION_ID="10"
VERSION="10 (buster)"
VERSION_CODENAME=buster
ID=debian
HOME_URL="https://www.debian.org/"
SUPPORT_URL="https://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"
```

これも Debian

Mail コンテナ
```
$ docker exec 1b4cbbeb4f19 sh -c 'cat /etc/*-release'                                                                                                                                                   tmp
3.6.2
NAME="Alpine Linux"
ID=alpine
VERSION_ID=3.6.2
PRETTY_NAME="Alpine Linux v3.6"
HOME_URL="http://alpinelinux.org"
BUG_REPORT_URL="http://bugs.alpinelinux.org"
```

これは Alpine ですね

これくらいわかれば十分でしょう

// todo コマンド対応表

## ホストマシンからの動作確認
では次はホストマシンのブラウザで `localhost:1080` にアクセスしてみましょう

![image](/images/mailcatcher-ng.png)

つながりません

コンテナは










## PHP コンテナにホストマシンから繋げるようにしよう








## Ubuntu のコンテナに PHP を入れよう
- 環境変数も設定する
- index.php も入れる

## PHP のコンテナに MTA も入れよう

## MySQL のコンテナに .cnf を入れよう // todo

- [step3](./step3.md)
- [step5](./step5.md)

