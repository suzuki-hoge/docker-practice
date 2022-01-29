---
title: "📚 ｜ 🐳 ｜ ネットワークって？"
---
この章の目標は PHP コンテナと MySQL コンテナと Mail コンテナを使って、`docker run` の `--network` オプションを理解することです

- [コマンドライン・リファレンス ( run )](http://docs.docker.jp/v19.03/engine/reference/commandline/run.html)
- [Docker コンテナ・ネットワークの理解](http://docs.docker.jp/v19.03/engine/userguide/networking/dockernetworks.html)

この章では PHP コンテナと MySQL コンテナと Mail コンテナが起動していることを前提とします todo 嘘

```
$ docker ps --format "table {{.ID}} \t {{.Image}} \t {{.Command}} \t {{.Ports}}"

CONTAINER ID    IMAGE                            COMMAND                   PORTS
<PHP>           docker-step-up-work-build_php    "bash"                    0.0.0.0:18000->8000/tcp, :::18000->8000/tcp
<Mail>          schickling/mailcatcher           "mailcatcher --no-qu…"    1025/tcp, 0.0.0.0:11080->1080/tcp, :::11080->1080/tcp
<MySQL>         mysql:5.7                        "docker-entrypoint.s…"    3306/tcp, 33060/tcp
```

# 📚 コンテナのネットワーク
デフォルトでは、コンテナ同士は接続できません

あるコンテナから別のコンテナに接続するためには、ネットワークが必要になります


ネットワークは `docker` の network` サブコマンドで操作します

## 📚 ネットワークの作成
作成は `docekr network create <NAME>` で行います

```
$ docker network create docker-practice-build-network
```

作成したネットワークは `docker network ls` で確認できます

```
$ docker network ls

NETWORK ID      NAME                             DRIVER    SCOPE
983f709d697c    bridge                           bridge    local
9adb1d1b92c3    docker-practice-build-network    bridge    local
ec6642979247    host                             host      local
34ab35cb2a65    none                             null      local
```

`bridge` と `host` と `none` はデフォルトで作られるネットワークです

ネットワークの IP などは `docker network inspect <NAME>` でわかります

出力が多いので Book では `jq` を使って情報を削っていますが、ぜひ一度は `jq` なしの出力も確認してみてください

```
$ docker network inspect docker-practice-build-network | jq '.[].IPAM.Config[]'
{
  "Subnet": "192.168.128.0/20",
  "Gateway": "192.168.128.1"
}
```

`Gateway` が `192.168.128.1` となっていることを確認できます

