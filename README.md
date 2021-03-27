# Webmap Apps for Lake Atitlan

[![php: 7.3](https://img.shields.io/badge/php-7.3-lime.svg)](https://www.php.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Atitlan-GT/model-data-etl/blob/master/LICENSE)
[![IMapApps: Development](https://img.shields.io/badge/IMapApps-Development-green)](https://imapapps.com)

[Currently in Development]

Two web applications are included inthis package. The first app displays a map which has configurable data layers that can be adjusted by available date. It also has three graph options which show the Probability of a water event, the lake mean temperature, and the land mean temperature all over the period of our model runs. The second application is a dashboard which shows the most current data and values from our model run.

## Installation Requirements

### Required

- Server which supports php
- php 7.3
- MySQL database
- Planet ConnectID and API key
- This needs the database to be filled by the model run. Directions coming soon.

## Setup

1. Create the file dbconnect.php in the top directory which implements the following two functions using your database information:

```
function OpenCon(){
  $mysqli_link = mysqli_connect($hostname, $username, $password, $dbname) or die("<html><script language='JavaScript'>alert('Unable to connect to database! Please try again later.'),history.go(-1)</script></html>");

	return $mysqli_link;
}

function CloseCon($conn)
{
	$conn->close();
}
```

2. Enter your Planet API key in planetproxy.php where it says YOUR_KEY_HERE

3. Deploy the entire structure to your server and run.

## License and Distribution

Copyright © 2021 UAH.

Model Data ETL for Lake Atitlan is distributed by UAH under the terms of the MIT License. See
[LICENSE](https://github.com/Atitlan-GT/webmap_apps/blob/master/LICENSE) in this
directory for more information.
