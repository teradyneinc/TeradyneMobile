<?php
    unlink("finish.xml");
    file_put_contents("start.xml.tmp", file_get_contents("php://input"));
    rename("start.xml.tmp","start.xml");
?>

<html>
 <head>
  <title>None</title>
 </head>
 <body>
 </body>
</html>
