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

        $host = 'db';
        $port = '3306';
        $database = 'event';
        $dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

        $username = 'hoge';
        $password = 'password';

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

