---
title: "2-1: コマンドの理解のしかた"
---

Docker の細かい話に入る前に、コマンドについて確認しましょう。

# 一番大切なこと
僕の思う一番大切なことは「コマンドがなにを対象になにを操作するか」を徹底的に意識することです。

これができればすぐ

# コマンドの新旧比較
2017 年 1 月にリリースされた v1.13 で Docker CLI の大幅な変更が行われました。

これは `docker run` や `docker build` のような形で `docker` 直下に命令増えすぎたためなのですが、v1.13 からはそれぞれを `docker container run` や `docker image build` のように何らかのサブコマンドとして使うことが推奨されるようになりました。

普段ネットの記事や業務中に目にするコマンドはおそらく `docker run` や `docker build` などの旧コマンドが多いのではないかと思います。
僕自身も短くて楽なので普段は旧コマンドを使っていますが、この Book では「対象」と「操作」が明瞭な新コマンドを使って説明を行います。

![image](/images/slide/slide.001.jpeg)

# オプションの省略
todo
```:Host Machine
$ docker container run --interactive --tty ubuntu bash
```
