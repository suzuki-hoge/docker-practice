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
 * insert
 */

$insert = $pdo->prepare("insert into page (pathname, at) values (:pathname, :at)");
$insert->bindValue(':pathname', $_SERVER['REQUEST_URI']);
$insert->bindValue(':at', date('Y-m-d H:i:s'));
$insert->execute();

/*
 * select
 */

$select = $pdo->prepare('select * from page');
$select->execute();

/*
 * show
 */

echo '<ul>';
foreach ($select as $row) {
    echo sprintf('<li>%s ( %s )</li>', $row['pathname'], $row['at']);
}
echo '</ul>';

/*
 * disconnect
 */

$pdo = null;

/*
 * mail
 */

$success = mail('john-doe@example.com', '[docker-practice] page event', sprintf('access %s', $_SERVER['REQUEST_URI']));

if ($success) {
    echo '<p>you got mail.</p>';
} else {
    echo '<p>failed mail sending.</p>';
}


// log をみる

