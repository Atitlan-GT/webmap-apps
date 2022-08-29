<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
include 'dbconnect.php';
$service = "";

if (isset($_POST['service'])) {
    $service = $_POST['service'];
} else {
    echo "No service";
    exit();
}

call_user_func($service);

function insert_RF_predict()
{
    $conn = OpenCon();

    $data_arr = explode(",", $_POST['data']);

    $query = "INSERT INTO RF_predict";
    $query .= " (Date, prediction)";
    $query .= "  VALUES (" . $_POST['data'] . ") ON DUPLICATE KEY UPDATE ";
    $query .= " prediction=" . $data_arr[1];

    if ($conn->query($query) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $query . "<br>" . $conn->error;
    }

    $conn->close();
}

function insert_RF_prob_predict()
{
    $conn = OpenCon();

    $data_arr = explode(",", $_POST['data']);

    $query = "INSERT INTO RF_prob_predict";
    $query .= " (Date, prediction_prob)";
    $query .= "  VALUES (" . $_POST['data'] . ") ON DUPLICATE KEY UPDATE ";
    $query .= " prediction_prob=" . $data_arr[1];

    if ($conn->query($query) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $query . "<br>" . $conn->error;
    }

    $conn->close();
}

function insertHAB_features()
{
    $conn = OpenCon();

    $data_arr = explode(",", $_POST['data']);

    $query = "INSERT INTO hab_features";
    $query .= " (Date, AerosolOpticalDepth, LakeMaxTemp, LakeMeanTemp, LandLakeMeanTempDif,";
    $query .= " LandMaxTemp, LandMeanTemp, DailyMeanRH, DailyMeanTemp2m, DailyMeanWindDir, ";
    $query .= "DailyMeanWindSpd, Rain, Runoff)";
    $query .= "  VALUES (" . $_POST['data'] . ") ON DUPLICATE KEY UPDATE ";
    $query .= " AerosolOpticalDepth=" . $data_arr[1] . ", LakeMaxTemp=" . $data_arr[2] . ", LakeMeanTemp=" . $data_arr[3];
    $query .= ", LandLakeMeanTempDif=" . $data_arr[4] . ", LandMaxTemp=" . $data_arr[5] . ", LandMeanTemp=" . $data_arr[6];
    $query .= ", DailyMeanRH=" . $data_arr[7] . ", DailyMeanTemp2m=" . $data_arr[8] . ", DailyMeanWindDir=" . $data_arr[9];
    $query .= ", DailyMeanWindSpd=" . $data_arr[10] . ", Rain=" . $data_arr[11] . ", Runoff=" . $data_arr[12];

    if ($conn->query($query) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $query . "<br>" . $conn->error;
    }

    $conn->close();
}

function listDates()
{
    $conn = OpenCon();

    $imageDate = "imageDate";

    $query = "SELECT * FROM landsat";

    $result = mysqli_query($conn, $query) or die(mysqli_error($query));
    $numResults = mysqli_num_rows($result);
    if ($result) {
        $counter = 0;
        echo "{\"dates\":[";
        while ($row = mysqli_fetch_array($result)) {
            $date = $row["$imageDate"];
            if (++$counter == $numResults) {
                echo "\"" . $date . "\"";
            } else {
                echo "\"" . $date . "\",";
            }
        }
        echo "]}";
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function listHABFeaturesByDate()
{
    $conn = OpenCon();

    $query = "SELECT `Date`,
                        `AerosolOpticalDepth`,
                         `LakeMaxTemp`,
                          `LakeMeanTemp`,
                           `LandLakeMeanTempDif`,
                            `LandMaxTemp`,
                             `LandMeanTemp`,
                              `DailyMeanRH`,
                               `DailyMeanTemp2m`,
                                `DailyMeanWindDir`,
                                 `DailyMeanWindSpd`,
                                  `Rain`,
                                   `Runoff` 
                   FROM `hab_features` WHERE `Date` = '" . $_POST['date'] . "'";
    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = $row;
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function listHABPredictionsByDate()
{
    $conn = OpenCon();
    $query = "SELECT `Date`,
                        `prediction`
                   FROM `RF_predict` WHERE `date` = '" . $_POST['date'] . "'";
    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = $row;
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function listHABProbPredictionsByDate()
{
    $conn = OpenCon();
    $query = "SELECT `Date`,
                            `prediction_prob`
                       FROM `RF_prob_predict` WHERE `date` = '" . $_POST['date'] . "'
                       ORDER BY `Date` ASC";
    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = $row;
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function listProbByRange()
{
    $conn = OpenCon();
    $query = "SELECT `Date`,
                            `prediction`
                       FROM `RF_predict` WHERE `date` >= '" . $_POST['start'] . "' and `date` <= '" . $_POST['end'] . "'
                       ORDER BY `Date` ASC";
    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = [$row['Date'], floatval($row['prediction'])];
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function listMeansByRange()
{
    $conn = OpenCon();

    $query = "SELECT `Date`,
                                `LandMeanTemp`, `LakeMeanTemp` 
                           FROM `hab_features` 
                           WHERE `date` >= '" . $_POST['start'] . "' and `date` <= '" . $_POST['end'] . "'
                           ORDER BY `date` ASC";

    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $LandMeanTemp = getNullOrNum($row['LandMeanTemp']);
            $LakeMeanTemp = getNullOrNum($row['LakeMeanTemp']);
            $emparray[] = [$row['Date'], [$LandMeanTemp, $LakeMeanTemp]];
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function getNullOrNum($val)
{
    return $val === NULL ? null : floatval($val);
}

function selectAvailableLandsat()
{
    getAvailableImagery("landsat");
}


function selectAvailableSentinel()
{
    getAvailableImagery("sentinel");
}

function getAvailablePlanet()
{
    $conn = OpenCon();

    $query = "SELECT `imageDate`, `imageID`
                                   FROM planet
                                   ORDER BY `imageDate` ASC";

    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = [$row['imageDate'], $row['imageID']];
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function getLatestPlanet()
{
    $conn = OpenCon();

    $query = "SELECT `imageDate`, `imageID`
                                       FROM planet
                                       ORDER BY `imageDate` DESC 
                                        LIMIT 1";

    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = [$row['imageDate'], $row['imageID']];
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function updatePlanetData()
{
    $conn = OpenCon();

    $date = $_POST['date'];
    $url = $_POST['url'];
    $layerID = $_POST['layerID'];

    $query = "INSERT INTO planet";
    $query .= " (imageDate, url, imageID)";
    $query .= "  VALUES (" . $date . ", " . $url . "," . $layerID . ") ON DUPLICATE KEY UPDATE url=" . $url . ", imageID=" . $layerID;

    if ($conn->query($query) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $query . "<br>" . $conn->error;
    }

    $conn->close();
}

function getAvailableImagery($table)
{
    $conn = OpenCon();

    $query = "SELECT `imageDate` 
                                   FROM $table
                                   ORDER BY `imageDate` ASC";

    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = $row['imageDate'];
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function updateAvailableDates()
{
    $conn = OpenCon();

    $dateType = $_POST['data']; // landsat

    $data_arr = explode(",", $_POST['dateList']);

    foreach ($data_arr as $value) {
        //echo $value;
        $query = "INSERT INTO " . $dateType;
        $query .= " (imageDate)";
        $query .= "  VALUES (" . $value . ") ";

        if ($conn->query($query) === TRUE) {
            echo "New record created successfully";
        } else {
            echo "Error: " . $query . "<br>" . $conn->error;
        }
    }
    unset($value);
    $conn->close();
}

function getDayAtAGlance()
{
    $conn = OpenCon();
    $query = "SELECT `LandMeanTemp`, `LakeMeanTemp`, `Rain`, `Date`, `DailyMeanWindDir`, `DailyMeanWindSpd`
                                       FROM hab_features
                                       ORDER BY `Date` DESC 
                                        LIMIT 1";
    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = [$row['Date'], $row['LandMeanTemp'], $row['LakeMeanTemp'], $row['Rain'], $row['DailyMeanWindDir'], $row['DailyMeanWindSpd']];
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function listLatestProbByRange()
{
    $conn = OpenCon();

    $query = "SELECT `Date`,
                                `prediction_prob`
                           FROM `RF_prob_predict` 
                           ORDER BY `Date`  DESC 
                                        LIMIT 1";

    $result = mysqli_query($conn, $query) or die(mysqli_error($query));

    $emparray = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $emparray[] = [$row['Date'], floatval($row['prediction_prob'])];
        }
        echo json_encode($emparray);
    } else {
        echo "Nothing found";
    }
    CloseCon($conn);
}

function loadMorePlanet()
{
    header("Location: cpd.html");
}
