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

echo '<title>Mail History | Docker Practice</title>' . PHP_EOL;
echo '<div style="width: 40rem; margin-top: 2rem; margin-left: auto; margin-right: auto; border: 8px solid #ACF;">
        <div style="padding: 0 2rem 0 2rem; border: 2px solid #38F;">
          <h1 style="text-align: center; margin-bottom: 0;">Mail History</h1>
          <table style="border-spacing: 0 1rem; width: 100%;">
            <tr style="text-align: left;">
              <th style="width: 5%;"></th>
              <th style="width: 35%;">Sent to</th>
              <th style="width: 35%;">Subject</th>
              <th style="width: 25%;">Sent at</th>
            </tr>';
foreach ($select as $row) {
    $mark = $row['result'] ? '✅' : '❌';
    echo "  <tr>
              <td style='font-size: 0.75rem;'>{$mark}</td>
              <td>{$row['sent_to']}</td>
              <td>{$row['subject']}</td>
              <td>{$row['sent_at']}</td>
            </tr>";
}
echo '    </table>
          <hr>
          <div style="text-align: center;">
            <a href="form.php"><p style="color: blue;">Mail Form</p></a>
          </div>
        </div>
      </div>';
