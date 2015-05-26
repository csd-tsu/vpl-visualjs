$(window).load(function(){
  var canv_ent={};
  var canv_ent_obj={};
  var fe_scene={};
  var frames_col=0;
  var frame=1;
  var state=0;
  var last_time=0;
  
  // == Инициализация == //
  var canv_main=document.createElement('canvas');  // Создаём элемент типа "канвас"
  canv_main.width=$('#fe_visuals').width();  // Устанавливаем свойства ширины канваса
  canv_main.height=$('#fe_visuals').height();  // Устанавливаем свойства высоты канваса
  $('#fe_visuals').append(canv_main);  // Добавляем новый элемент в DOM
  var canv_main_obj=canv_main.getContext('2d');  // Получение объекта канваса
  canv_main_obj.setTransform(1, 0, 0, -1, -0, (canv_main.height)); //меняем оси координат и начало координат, значения по парам: 1,0 - ось Х направлена вправо, 0,-1 - ось У направлена вверх, -0, canv_main.height переносим начало координат в нижний левый угол
  if($.cookie('ps_scene')) $('#fe_scene').val($.cookie('ps_scene'));  // Восстанавливаем сцену из куки

  // == Нажатие на Проиграть == //
  $('#fe_controls_play').click(function(e) {
    $.cookie('ps_scene', $('#fe_scene').val(), { expires: 30 });  // Записываем сцену в кукисы
    $.post($('#fe_url').val(), $('#fe_scene').val(), function(r) {  // Отправляем данные
      fe_scene=JSON.parse(r);  // Парсим JSON массив
      frames_col=0;  // Обнуляем количество кадров
      for(var f in fe_scene["frames"]) frames_col++;  // Считаем количество кадров
      for(var p in fe_scene["entities"]) {  // Перебираем сущности
        switch(fe_scene["entities"][p]["type"]) {  // Выбираем сущность по типу
          case 'rect':  // Если элемент - прямоугольник
            newRect(p, fe_scene["entities"][p]["width"], fe_scene["entities"][p]["height"], fe_scene["entities"][p]["color"]);  // Рендерим прямоугольник
            break;
          case 'circle':  // Если элемент - круг
            newCircle(p, fe_scene["entities"][p]["r"], fe_scene["entities"][p]["color"]);  // Рендерим круг
            break;
        }
      }
      frame=0;  // Переключаемся на первый кадр
      if(state==0) {  // Если состояние Стоп
        state=1;  // Меняем состояние на Проигрывание
        fe_draw_frame();  // Начинаем отрисовку
			}
    });
  });
  
  $('#fe_controls_stop').click(function(e) {
    frame=0;  // Переключаемся на первый кадр
    state=0;
	});
	
	$('#fe_default_scene').click(function(e) {
    $.get('./default_scene.txt', function(re){
      $('#fe_scene').val(re);
    });
	});
	
	// == Отрисовка кадра сцены == //
  function fe_draw_frame() {
    var time = new Date().getTime();
    if(last_time+1<time) {
      last_time = time;
      // Очищаем холст
     // Сохраняем текущую матрицу трансформации
      canv_main_obj.save();
      // Используем идентичную матрицу трансформации на время очистки
      canv_main_obj.setTransform(1, 0, 0, 1, 0, 0);
      canv_main_obj.clearRect(0, 0, canv_main.width, canv_main.height);
      // Возобновляем матрицу трансформации
      canv_main_obj.restore();

      for(var p in fe_scene["frames"][frame]) {  // Перебираем энтити в данном кадре
        canv_main_obj.drawImage(canv_ent[p], fe_scene["frames"][frame][p]["x"], fe_scene["frames"][frame][p]["y"]);  // Выводим энтити на холст
      }
      $('#fe_controls_progress').width(frame*(500/frames_col));
      if(frame>=frames_col) frame=0; else frame++;  // Если текущий кадр последний - переходим на первый, иначе - переходим на следующий
    }
    if(state==1) requestAnimationFrame(fe_draw_frame, canv_main);  // Рисуем следующий кадр
  }

  // == Рендеринг элемента типа прямоугольник == //
  function newRect(id, width, height, color) {
		canv_ent[id]=document.createElement('canvas');  // Создаём холст под рендеринг элемента
		canv_ent[id].width=width;
		canv_ent[id].height=height;
    canv_ent_obj[id] = canv_ent[id].getContext('2d');  // Получаем объект холста
    canv_ent_obj[id].strokeStyle=color;  // Задаём цвет прямоугольника
    canv_ent_obj[id].rect(0,0,width,height);  // Задаём параметры прямоугольника
    canv_ent_obj[id].fillStyle = color;
    canv_ent_obj[id].fill(); 
    canv_ent_obj[id].stroke();  // Рисуем прямоугольник
  }
  
    // == Рендеринг элемента типа круг == //
  function newCircle(id, r, color) {
		canv_ent[id]=document.createElement('canvas');  // Создаём холст под рендеринг элемента
		canv_ent[id].width=r*2+2;
		canv_ent[id].height=r*2+2;
    canv_ent_obj[id] = canv_ent[id].getContext('2d');  // Получаем объект холста  
    canv_ent_obj[id].beginPath();
    canv_ent_obj[id].arc(r*1+1, r*1+1, r, 0, 2*Math.PI, false);  // Задаём параметры круга
    canv_ent_obj[id].fillStyle = color;
    canv_ent_obj[id].fill();   
    canv_ent_obj[id].lineWidth = 1;
    canv_ent_obj[id].strokeStyle = color;  // Задаём цвет круга
    canv_ent_obj[id].stroke();  // Рисуем круга
  }

});