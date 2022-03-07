<?php

/*
 * view
 */

echo '<title>Mail Form | Docker Practice</title>' . PHP_EOL;
echo '<div style="width: 40rem; margin-top: 2rem; margin-left: auto; margin-right: auto; border: 8px solid #ACF;">
        <div style="padding: 0 2rem 0 2rem; border: 2px solid #38F;">
          <h1 style="text-align: center;">Mail Form</h1>
          <form action="mail.php" method="post">
            <div style="margin-bottom: 1.5rem;">
              <input type="email" id="to" name="send_to" maxlength="16" placeholder="Send to" autofocus style="width: 100%; font-size: 1.25rem; padding: 0.375rem;" />
            </div>
            <div style="margin-bottom: 1.5rem;">
              <input type="text" id="sub" name="subject" maxlength="16" placeholder="Subject" style="width: 100%; font-size: 1.25rem; padding: 0.375rem;" />
            </div>
            <div style="margin-bottom: 1.5rem;">
              <input type="text" id="body" name="body" maxlength="50" placeholder="Body" style="width: 100%; font-size: 1.25rem; padding: 0.375rem;" />
            </div>
            <div style="margin-bottom: 1.5rem; text-align: center;">
              <input type="submit" value="Send" style="width: 13rem; height: 3rem; font-size: 1.5rem; color: #FFF; background-color: #38F; border-radius: 5px; border: none; cursor: pointer;"/>
            </div>
          </form>
          <hr>
          <div style="text-align: center;">
            <a href="history.php"><p style="color: blue;">Mail History</p></a>
          </div>
        </div>
      </div>';
