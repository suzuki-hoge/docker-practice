<?php


/*
* parameters
 */

$sendTo = $_POST['send_to'];
$subject = $_POST['subject'];
$body = $_POST['body'];

/*
 * mail
 */

$success = mail($sendTo, $subject, $body);

/*
 * view
 */

$message = $success ? '✅ Your mail has been sent.' : '❌ Failed mail sending.';

echo '<title>Mail Result | Docker Practice</title>' . PHP_EOL;
echo "<div style='width: 40rem; margin-top: 2rem; margin-left: auto; margin-right: auto; border: 8px solid #ACF;'>
        <div style='padding: 0 2rem 0 2rem; border: 2px solid #38F;'>
          <h1 style='text-align: center;'>Mail Sending Result</h1>
          <p style='font-size: 1.5rem; text-align: center;'>$message</p>
          <hr>
          <div style='text-align: center;'>
            <a href='form.php'><p style='color: blue;'>Mail Form</p></a>
            <a href='history.php'><p style='color: blue;'>Mail History</p></a>
          </div>
        </div>
      </div>";

/*
 * connect
 */

$host = '???';
$port = '???';
$database = '???';
$dsn = sprintf('mysql:host=%s; port=%s; dbname=%s;', $host, $port, $database);

$username = '???';
$password = '???';

$pdo = new PDO($dsn, $username, $password);

/*
 * insert
 */

date_default_timezone_set('Asia/Tokyo');
$insert = $pdo->prepare("insert into mail (sent_to, subject, body, sent_at, result) values (:sentTo, :subject, :body, :now, :result)");
$insert->bindValue(':sentTo', $sendTo);
$insert->bindValue(':subject', $subject);
$insert->bindValue(':body', $body);
$insert->bindValue(':now', date('m/d H:i:s'));
$insert->bindValue(':result', $success ? '1' : '0');
$insert->execute();

/*
 * disconnect
 */

$pdo = null;
