---
title: "🖥️ ｜ 🐳 ｜ PHP コンテナのファイルをエディタで編集できるようにしよう"
---
# 🖥️ PHP コンテナの PHP ファイルをホストマシンで編集できるようにする
ホストマシンで `src/` ディレクトリを作り、PHP ファイルを 3 つ作ってください

```
 tree .
.
|-- docker
|   `-- php
|       `-- Dockerfile
`-- src
    |-- index.php
    |-- mail.php
    `-- select.php
```

PHP ファイルの中身は次の通りです

:::details index.php
```php
<?php

/*
 * view
 */

echo '<h2>Hello Docker Practice!</h2>
      <br><a href="select.php">mail history</a>
      <br><a href="mail.php">mail form</a>';
```
:::

:::details mail.php
```php
<?php

/*
 * GET
 */

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    /*
     * view
     */

    echo '<h2>Mail Form</h2>
          <form action="mail.php" method="post">
              <input type="email" name="adr"  size="35" maxlength="30" placeholder="send to" />
              <input type="text"  name="sub"  size="25" maxlength="20" placeholder="subject" />
              <input type="text"  name="body" size="55" maxlength="50" placeholder="body" />
              <input type="submit" value="send" />
          </form>
          <br><a href="select.php">mail history</a>
          <br><a href="mail.php">mail form</a>';
}

/*
 * POST
 */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    /*
     * parameters
     */

    $adr = $_POST['adr'];
    $sub = $_POST['sub'];
    $body = $_POST['body'];

    /*
     * mail
     */

    $success = mail($adr, $sub, $body);

    /*
     * view
     */

    if ($success) {
        echo '<h2>Mail Result</h2>
              <p>✅ you got mail.</p>
              <br><a href="select.php">mail history</a>
              <br><a href="mail.php">mail form</a>';
    } else {
        echo '<h2>Mail Result</h2>
              <p>❌ failed mail sending.</p>
              <br><a href="select.php">mail history</a>
              <br><a href="mail.php">mail form</a>';
    }

    if ($success) {

        /*
         * connect
         */

        $host = 'todo';
        $port = 'todo';
        $database = 'event';
        $dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

        $username = 'todo';
        $password = 'todo';

        $pdo = new PDO($dsn, $username, $password);

        /*
         * insert
         */

        $insert = $pdo->prepare("insert into mail (adr, sub, body, at) values (:adr, :sub, :body, :at)");
        $insert->bindValue(':adr', $adr);
        $insert->bindValue(':sub', $sub);
        $insert->bindValue(':body', $body);
        $insert->bindValue(':at', date('Y-m-d H:i:s'));
        $insert->execute();

        /*
         * disconnect
         */

        $pdo = null;
    }
}
```
:::

:::details select.php
```php
<?php

/*
 * connect
 */

$host = 'todo';
$port = 'todo';
$database = 'event';
$dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

$username = 'todo';
$password = 'todo';

$pdo = new PDO($dsn, $username, $password);

/*
 * select
 */

$select = $pdo->prepare('select * from mail');
$select->execute();

/*
 * disconnect
 */

$pdo = null;


/*
 * view
 */

echo '<h2>Mail History</h2>
      <table>
          <tr>
              <th align="left" width="330">To</th>
              <th align="left" width="250">Subject</th>
              <th align="left"            >Sent</th>
          </tr>';
foreach ($select as $row) {
    echo "<tr>
              <td>{$row['adr']}</td>
              <td>{$row['sub']}</td>
              <td>{$row['at']}</td>
          </tr>";
}
echo '</table>
      <br><a href="select.php">mail history</a>
      <br><a href="mail.php">mail form</a>';
```
:::

PHP ファイルが用意できたら、バインドマウントでコンテナを起動して、コンテナに PHP ファイルがあることを確認しましょう

todo `-v`

:::details 練習: 起動中のコンテナの停止、コンテナの起動、コンテナ内の PHP ファイルの確認
停止は `docker stop <CONTAINER>` です

```
$ docker stop <PHP>
```

起動は `docker run <IMAGE>` に `-v <hostmachine-path>:<container-path>` です

```
$ docker run                                \
    -it                                     \
    -d                                      \
    -p 18000:8000                           \
    -v $(pwd)/src:/tmp/src                  \
    docker-practice-build_app
```

接続は `docker exec -it <CONTAINER> bash` です

```
$ docker exec -it <PHP> bash

# ls /tmp/src
index.php  mail.php  select.php
```

接続をせずに `ls` 命令を送っても良いでしょう

```
$ docker exec <PHP> ls /tmp/src

index.php
mail.php
select.php
```
:::

コンテナ内に PHP ファイルがあることが確認できました

ホストマシンで PHP ファイルを適当に変更すると、コンテナ内の PHP ファイルも変更されることを確認しましょう
変更も確認も、どんな方法でも良いです

:::details 練習: ホストマシンで PHP ファイルを変更して、コンテナ内の PHP ファイルを確認する
コンテナ内の `index.php` を確認

```
$ docker exec <PHP> head -n 5 /tmp/index.php

<?php

/*
 * view
 */
```

ホストマシンで `index.php` を変更

```
$ vi src/index.php
```

コンテナ内の `index.php` を確認

```
$ docker exec <PHP head -n 5 /tmp/index.php
<?php

/*
 * view !!!
 */
```

ホストマシンでの変更は VSCode でも良いですし、コンテナ内の確認は `bash + cat` などでも良いです

自分がどの環境で何を行っているかを徹底して意識することがコツです
:::

これ以降は PHP コンテナの PHP ファイルをホストマシンで編集することができます

