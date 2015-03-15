<?php

$scene=json_decode(file_get_contents('php://input'), true);  // Парсим json сцену
$frames_col=$scene["properties"]["interval"]/$scene["properties"]["step"];  // Вычисляем количество кадров
$entity_col=count($scene["entities"]);  // Вычисляем количество сущностей
for($i=1; $i<=$frames_col; $i++)  // Идём цикл по кадрам
  for($j=1; $j<=$entity_col; $j++) {  // Идём цикл по сущностям
    $scene["frames"]["f".$i]["e".$j]["x"]=$scene["entities"]["e".$j]["x"];  // Задаём координату x в данном кадре
    $scene["frames"]["f".$i]["e".$j]["y"]=$scene["entities"]["e".$j]["y"]+$k*$scene["properties"]["gravity"]*$scene["properties"]["step"];	// Задаём координату y в данном кадре
    $k++;
  }
echo json_encode($scene); die();  // Возвращаем массив в виде json

?>