---
title: "2-5: コンテナの基礎４ 起動中コンテナへの接続"
---

# このページで初登場するコマンドとオプション
## コンテナ内でコマンドを実行する
```:新コマンド
$ docker container exec [option] <container> command
```

```:旧コマンド
$ docker exec [option] <container> command
```

### オプション
オプション | 意味 | 用途  
:-- | :-- | :--
`-i, --interactive`   | コンテナの標準入力に接続する | コンテナを対話操作する
`-t, --tty`   | 擬似ターミナルを割り当てる   | コンテナを対話操作する

# 起動中のコンテナに命令を送る
## 任意のコマンドを実行する
実際にコンテナを使うときは、起動しているコンテナに直接 `bash` で接続して中を調べたくなることが頻繁にあります。

それが行えるように、起動中のコンテナに接続する方法を知っておきましょう。

```:新コマンド
$ docker container exec [option] <container> command
```

起動中の MySQL コンテナの環境変数を確認したいので、それぞれ次のように指定します。

- `[otpion]` → 対話はしないので特になし
- `<container>` → `--name` 付きで起動したので `mysql`
- `[command]` → 環境変数を表示する `env`
  
以上を踏まえ、次のコマンドでコンテナに接続します。

```:Host Machine
$ docker container exec mysql env

HOME=/root
MYSQL_VERSION=5.7.36-1debian10
MYSQL_MAJOR=5.7
GOSU_VERSION=1.12
MYSQL_ROOT_PASSWORD=rootpassword
HOSTNAME=335b732ab22f
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

コンテナ内で `env` が実行されたことがわかります。

これを習得すれば、ホストマシンからコンテナに「ちょっとファイル見せて」や「ちょっともっかいビルドして」のように自由に命令ができるようになります。

## コンテナに接続する
`env` のようなシンプルな命令ではなく起動しているコンテナ内で複雑なデバッグなどを行いたい場合は、SSH がしたくなるかもしれません。
コンテナを SSH サーバにする方法もないわけではありませんが、次のような観点から推奨できません。

- デバッグのための複雑な設定がイメージに必要になる
- 秘密情報の管理や脆弱性対応などのコストが増える
- デプロイすると、本来は存在しなかった脆弱性が増える可能性がある

やりたいことと Docker の基礎を正しく把握していれば、コンテナに接続するだけなら起動中のコンテナに次のように `bash` 命令を送るだけで良いことが理解できます。

- `[otpion]` → `bash` を使うので `--interactive` と `--tty`
- `<container>` → `--name` 付きで起動したので `mysql`
- `[command]` → `bash`

以上を踏まえ、次のコマンドでコンテナに接続します。

```:Host Machine
$ docker container exec \
  --interactive         \
  --tty                 \
  mysql                 \
  bash

#
```

プロンプトが切り替わったことから、無事コンテナに接続できたことがわかります。

## まとめ
起動中のコンテナを対象とする点が違います

