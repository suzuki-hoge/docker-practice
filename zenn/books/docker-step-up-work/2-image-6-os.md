---
title: "📚 ｜ 🐧 ｜ OS やパッケージ管理コマンドをすぐ把握するには？"
---
## よりみち: Alpine Linux
## よりみち: インストールするコマンドはどれ？
適当に接続したコンテナで `yum` を使うか `apt` を使うかわからない、ということがままあります

僕は結構雑に `yum`, `apt`, `apk`, `dnf` とか適当に叩いて見つかったのを使います
// todo dnf

今回は `ap` まで入力して `<TAB>` をガチャガチャやっていたら `apk` があった、という感じです

少しちゃんと調べるなら `/etc/redhat-release` や `/etc/alpine-release` を雑に見てみるというのが有効です

`/ect/*-release` を探すのが手っ取り早いでしょう

コンテナに `bash` で接続するのも面倒なので、`exec` で `ls` 命令を送りつけてしまいます

ただし要点が 2 つあります

- `*` は送れないので `bash -c 'ls *'` のように `bash` 命令で送らなければなりません
- 先ほどのように `bash` がない可能性があるので `sh` でそれを行います

```
$ docker ps
CONTAINER ID    IMAGE                            COMMAND                    CREATED           STATUS           PORTS                  NAMES
1b4cbbeb4f19    schickling/mailcatcher           "mailcatcher --no-qu…"     6 minutes ago     Up 6 minutes     1025/tcp, 1080/tcp     jolly_varahamihira
11d945f0edf0    mysql:5.7                        "docker-entrypoint.s…"     7 minutes ago     Up 7 minutes     3306/tcp, 33060/tcp    stupefied_napier
0f7d28ae360e    docker-step-up-work-build_php    "bash"                     33 minutes ago    Up 33 minutes                           wizardly_bhabha
```

PHP コンテナ

```
$ docker exec 0f7d28ae360e sh -c 'ls /etc/*-release'
/etc/lsb-release
/etc/os-release
```

MySQL コンテナ
```
$ docker exec 11d945f0edf0 sh -c 'ls /etc/*-release'
/etc/os-release
```

Mail コンテナ
```
$ docker exec 1b4cbbeb4f19 sh -c 'ls /etc/*-release'
/etc/alpine-release
/etc/os-release
```

このファイル名でわかれば十分だし、わからなければ中を見れば良いです

PHP コンテナ
```
$ docker exec 0f7d28ae360e sh -c 'cat /etc/*-release'                                                                                                                                                   tmp
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

