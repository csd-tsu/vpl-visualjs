<?php

$scene=json_decode(file_get_contents('php://input'), true);  // ������ json �����
$frames_col=$scene["properties"]["interval"]/$scene["properties"]["step"];  // ��������� ���������� ������
$entity_col=count($scene["entities"]);  // ��������� ���������� ���������
for($i=1; $i<=$frames_col; $i++)  // ��� ���� �� ������
  for($j=1; $j<=$entity_col; $j++) {  // ��� ���� �� ���������
    $scene["frames"]["f".$i]["e".$j]["x"]=$scene["entities"]["e".$j]["x"];  // ����� ���������� x � ������ �����
    $scene["frames"]["f".$i]["e".$j]["y"]=$scene["entities"]["e".$j]["y"]+$k*$scene["properties"]["gravity"]*$scene["properties"]["step"];	// ����� ���������� y � ������ �����
    $k++;
  }
echo json_encode($scene); die();  // ���������� ������ � ���� json

?>