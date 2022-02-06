---
title: "📚 ｜ 🐳 ｜ Dockerfile ってなに？"
---

# このページで初登場するコマンド
[`docker build [option] <path>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/build/)

オプション | 意味 | 用途  
:-- | :-- | :--
`-f, --file`   | Dockerfile を指定する | 複数の Dockerfile を使い分ける
`-t, --tag` | ビルド結果にタグをつける | 人間が把握しやすいようにする

[`docker history [option] <image>`](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/commandline/history/)

オプション | 意味 | 用途  
:-- | :-- | :--

[Dockerfile](https://matsuand.github.io/docs.docker.jp.onthefly/engine/reference/builder/)

命令 | 意味 | 用途  
:-- | :-- | :--
`FROM` | ベースイメージを指定する | 基盤にする OS などを指定する
`RUN` | コマンドを実行してレイヤーを追加する | 追加インストールなどの Linux 操作を行う
`ENV` | 環境変数を指定する | 意味の通り
`CMD` | デフォルト命令を設定する | サーバを起動したりする

# 導入
[イメージってなに？](#todo) のページで、イメージは `.img` のような実態を持つファイルではなくレイヤーの積み重なった情報であると理解しました。

しかし Docker Hub にある公式イメージなどは基本的に軽量にするためにレイヤーも最低限しか積み重なっておらず、あまり多機能ではありません。
そのため開発をしやすくしたりプロジェクト固有の拡張を行うために、Dockerfile を用いて自分でレイヤーを重ねる必要が出てきます。

