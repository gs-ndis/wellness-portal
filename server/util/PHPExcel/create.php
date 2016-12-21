<?php

// php -f create.php mytemplate.xlsx myfile.xslt "{A1:\"some data\"}"

if ($_SERVER['argc'] < 3) {
  echo "usage: php -f convert.php input.xlsx output.js\r\n supported formats: .xlsx or .xls or .ods or .csv ";
  exit(2);
}

/** Error reporting */
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

$incoming = $_SERVER['argv'][1];
$outgoing = $_SERVER['argv'][2];
$data = json_decode($_SERVER['argv'][3], true);
$format = $_SERVER['argv'][4];



$outgoingExtention = strtolower(pathinfo($outgoing, PATHINFO_EXTENSION));

if (!file_exists($incoming)) {
  exit($incoming . " not found.\n");
}

define('EOL', (PHP_SAPI == 'cli') ? PHP_EOL : '<br />');

date_default_timezone_set('Europe/London');

/** Include PHPExcel */
require_once dirname(__FILE__) . '/Classes/PHPExcel.php';


// Read from Excel2007 (.xlsx) template
echo date('H:i:s'), " Load Excel2007 template file", EOL;
$objReader = PHPExcel_IOFactory::createReader('Excel2007');
$objPHPExcel = $objReader->load($incoming);
$count = $objPHPExcel->getSheetCount();

for ($i = 1; $i < $count; $i++) {
  $objPHPExcel->removeSheetByIndex(1);
}
$sheet = $objPHPExcel->setActiveSheetIndex(0);
foreach ($data as $key => $value) {
  if (is_array($value)) {
    if ($value['type'] == 'image') {
      echo date('H:i:s'), 'Drawing image ', $value['path'], ' to ', $key, EOL;
      $gdImage = imagecreatefrompng($value['path']);
//      $gdImage = imagecreatetruecolor(200, 140);
      // Add a drawing to the worksheetecho date('H:i:s') . " Add a drawing to the worksheet\n";
      $objDrawing = new PHPExcel_Worksheet_MemoryDrawing();
      $objDrawing->setCoordinates($key);
      $objDrawing->setName('Sample image');
      $objDrawing->setDescription('Sample image');
      $objDrawing->setImageResource($gdImage);
      $objDrawing->setRenderingFunction(PHPExcel_Worksheet_MemoryDrawing::RENDERING_JPEG);
      $objDrawing->setMimeType(PHPExcel_Worksheet_MemoryDrawing::MIMETYPE_DEFAULT);
//      $objDrawing->setHeight(150);
      $objDrawing->setWorksheet($objPHPExcel->getActiveSheet());
    }
  } else {
    echo date('H:i:s'), 'Set value ', $value, ' to ', $key, EOL;
    $sheet->setCellValue($key, $value);
  }
}

echo date('H:i:s'), " Write to Excel5 format", EOL;
$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, $format);
$objWriter->setPreCalculateFormulas(true);
$objWriter->save($outgoing);
echo date('H:i:s'), " File written to ", $outgoing, EOL;
?>
