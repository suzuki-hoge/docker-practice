<?php

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

