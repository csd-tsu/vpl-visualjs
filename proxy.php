<?php die(); // == Модуль == //
// === #Manul:F# ================================================================ Функции ============================= //
// === #Manul:P# ================================================================ Преддизайновые действия ============= //
// === #Manul:I# ================================================================ Первичные действия ================== //

$ch=curl_init();
curl_setopt($ch, CURLOPT_URL,"http://54.93.200.11:8080/");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/plain')); 
curl_setopt($ch, CURLOPT_POSTFIELDS, '{
  "properties":{
    "gravity":"1",
    "interval":"12",
    "step":"1"
  },
  "entities":{
    "e1":{
      "type":"yarect",
      "width":"300",
      "height":"100",
      "color":"#000000",
      "x":"10",
      "y":"10"
    },
    "e2":{
      "type":"rect",
      "width":"100",
      "height":"100",
      "color":"#ff0000",
      "x":"340",
      "y":"100"
    }
  }
}');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//curl_setopt($ch, CURLOPT_HEADER, true);
$server_output = curl_exec($ch);
curl_close($ch);
echo $server_output;
die(); 
/*
$curl=curl_init('http://4ky.ru');
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, false);

$result=curl_exec($curl);
curl_close($curl);
echo $result;
die();
*/

// === #Manul:A# ================================================================ Действия пользователя =============== //
// === #Manul:V# ================================================================ Визуальные элементы ================= //
// === #Manul:H# ================================================================ HTML ================================ //
// === #Manul:J# ================================================================ Javascript =============== // ?><script>
// === #Manul:C# ================================================================ CSS ================================= //