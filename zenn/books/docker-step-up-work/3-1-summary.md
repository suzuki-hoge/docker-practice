---
title: "３部: 構成の全体図"
---

３部は [１部]() でデモしたメールフォームのアプリケーションを構築しながら、コンテナの連携などを学びます。

![image](/images/demo-form-1.png)

このアプリケーションは次の３コンテナで構成されています。

- 自分で PHP をインストールしたアプリケーションを動かすコンテナ ( 以後 App コンテナ )
- OSS のメールサーバのコンテナ ( 以後 Mail コンテナ )
- メール送信履歴のためのデータベースのコンテナ ( 以後 DB コンテナ )

また、２部で学んだ **コンテナ** と **イメージ** と **Dockerfile** に加え、さらにいくつかの要素を使っており、全体を図示すると次のようになっています。

![image](/images/structure/structure.056.jpeg)

急に複雑に見えますが、１ページずつ分解し、少しずつシンプルに構築していきます。
以下に３部のインデックスと、そのページで構築する部分を図示したものを記載します。

[３部: イメージの作成]()
![image](/images/structure/structure.057.jpeg)

[３部: コンテナの起動]()
![image](/images/structure/structure.067.jpeg)

[３部: デバッグ]() ( 余談 )
![image](/images/structure/structure.071.jpeg)

[３部: ボリューム]()
![image](/images/structure/structure.076.jpeg)

[３部: バインドマウント]()
![image](/images/structure/structure.080.jpeg)

[３部: ポート]()
![image](/images/structure/structure.084.jpeg)

[３部: ネットワーク]()
![image](/images/structure/structure.088.jpeg)

[３部: Docker Compose]()
![image](/images/structure/structure.092.jpeg)

最後まで読み進めると、こと「開発環境を Docker で構築する」という点において **「全然わからない」ということはなくなっているはず** です。

普段なんとなく Docker を利用している方やこの本を一度読んだ方も、必要な時にここのインデックスと図を見て部分的にでも役立てていただきたいと思います。


todo: clone base